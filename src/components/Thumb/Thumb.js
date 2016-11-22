import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'
import classnames from 'classnames'

import { formatDuration, parseFormattedFloat } from '../../services/jsUtil'

const source = {
  dragStart (props, type, se) {
    se.dataTransfer.setData('text/plain', JSON.stringify({type, id: props.asset.id}))
  },
  dragEnd (props, type, se) {
    se.preventDefault()
  }
}

let ThumbCache = new Set()

const ImageThumb = (props) => {
  const { asset, dim, onClick, onDoubleClick, dragparams, thumbClass, children } = props
  const tproxy = asset.tinyProxy()
  const style = {
    'backgroundColor': tproxy[4],
    'backgroundSize': 'cover',
    'width': dim.width,
    'height': dim.height,
    'left': dim.x,
    'top': dim.y
  }
  return (
    <div
      className={classnames('ImageThumb', thumbClass)}
      style={style}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      {...dragparams} >
      { children }
    </div>
  )
}

ImageThumb.propTypes = {
  asset: PropTypes.instanceOf(Asset).isRequired,
  dim: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  dragparams: PropTypes.object,
  thumbClass: PropTypes.string.isRequired,
  children: React.PropTypes.element
}

@DragSource('FOLDER', source)
class Thumb extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset).isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string,
    dim: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired
  }

  loadImage (thumbURL) {
    const thumb = document.getElementsByClassName(this.thumbClass)[0]
    if (thumb) thumb.style['background-image'] = `url(${thumbURL})`
    this.loadTimer = null
    ThumbCache.add(thumbURL)
  }

  componentWillMount () {
    const { asset, protocol, host, dim, index } = this.props
    this.proxy = asset.closestProxy(dim.width, dim.height)
    const thumbURL = this.proxy.url(protocol, host)
    this.thumbClass = `assets-thumb-${thumbURL}`

    // Delay the image load by a small amount, in order to show images loading in order.
    // (Otherwise browsers will decide for us, and you won't like it)
    // 15ms per image seemed about right in Chrome to balance
    // seeing the color swatch for the longest possible time,
    // without overall load taking longer.
    const delay = (ThumbCache.has(thumbURL)) ? 0 : 250 + index * 15 // NB: we do need the delay 0 (our div doesn't yet exist)
    this.loadTimer = setTimeout(this.loadImage.bind(this, thumbURL), delay)
  }

  componentWillUnmount () {
    // if we started a load timer in render() that hasn't finished, cancel it
    if (this.loadTimer) clearTimeout(this.loadTimer)
  }

  renderBadges = (pages, duration, icon) => {
    const { width, height } = this.props.dim
    const hideText = (!pages && !duration) || width < 50 || height < 50
    const textStyle = hideText ? { display: 'none' } : {}
    const small = width < 80 || height < 80

    if (pages || icon) {
      return (
        <div className="multipage-badge">
          <div className={classnames('icon', {small})}><img src={icon}/></div>
          <div style={textStyle} className={classnames('pages', {small})}>
            {pages}
          </div>
        </div>
      )
    } else if (duration) {
      return (
        <div className="time-badge">
          <div className={classnames('play-badge', {small})}>
            <div className={classnames('arrow-right', {small})} />
          </div>
          <div style={textStyle} className={classnames('duration', {small})}>
            { formatDuration(parseFormattedFloat(duration) / 1000.0) }
          </div>
        </div>
      )
    }
  }

  render () {
    const { asset, isSelected } = this.props
    if (!asset.proxies) {
      return <div className="Thumb-proxy" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    let pages, duration, icon
    const mediaType = asset.mediaType().toLowerCase()
    if (mediaType.startsWith('image') && asset.value('image.subimages')) {
      pages = asset.value('image.subimages')
    } else if (mediaType.includes('video') || mediaType.includes('sequence')) {
      duration = asset.value('video.duration')
    } else if (mediaType === 'application/pdf' || asset.value('document.pages')) {
      icon = require('./pdf-icon.png')
      pages = asset.value('document.pages')
    }
    const { width, height, x, y } = this.props.dim      // Original thumb rect
    const style = { width, height, left: x, top: y }    // Dim -> left, right
    const ninetyDim = { width: '90%', height: '90%' }   // When multipaged
    const fullDim = { width: '100%', height: '100%' }   // Single thumb
    const frontDim = pages ? ninetyDim : fullDim        // stack-front dim
    const props = { ...this.props, dim: {width: '100%', height: '100%', x: 0, y: 0} }
    const hideMultipageStyle = pages ? { display: 'none' } : {}
    return (
      <div className={classnames('Thumb', {isSelected})} style={style} >
        <div style={hideMultipageStyle} className="stack-back"/>
        <div style={hideMultipageStyle} className="stack-middle"/>
        <div className="stack-front" style={frontDim}>
          <ImageThumb {...props} thumbClass={this.thumbClass}>
            { this.renderBadges(pages, duration, icon) }
          </ImageThumb>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host
}))(Thumb)
