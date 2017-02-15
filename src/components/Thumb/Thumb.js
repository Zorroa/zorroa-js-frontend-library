import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'
import classnames from 'classnames'

import { formatDuration, parseFormattedFloat, isolateSelectId } from '../../services/jsUtil'

const source = {
  dragStart (props, type, se) {
    const { asset, selectedAssetIds } = props
    const assetIds = isolateSelectId(asset.id, selectedAssetIds)
    return {assetIds}
  }
}

const ImageThumb = (props) => {
  const { url, backgroundColor, children } = props
  const style = {
    backgroundColor,
    'backgroundSize': 'cover',
    'backgroundImage': `url(${url})`
  }
  return (
    <div className={classnames('ImageThumb')} style={style}>
      { children }
    </div>
  )
}

ImageThumb.propTypes = {
  url: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  children: PropTypes.arrayOf(React.PropTypes.element)
}

@DragSource('ASSET', source)
class Thumb extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)).isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string,
    dim: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    selectedAssetIds: PropTypes.instanceOf(Set),
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    dragparams: PropTypes.object
  }

  renderBadges = () => {
    const { assets } = this.props
    const { width, height } = this.props.dim
    const asset = assets[0]

    const mediaType = asset.mediaType().toLowerCase()
    let pages, duration, icon

    if (mediaType.startsWith('image') && asset.value('image.subimages')) {
      pages = asset.value('image.subimages')
    } else if (mediaType.includes('video') || mediaType.includes('sequence')) {
      duration = asset.duration()
    } else if (mediaType === 'application/pdf' || asset.value('document.pages')) {
      icon = require('./pdf-icon.png')
      pages = asset.value('document.pages')
    }

    const hideText = (!pages && !duration) || width < 50 || height < 50
    const textStyle = hideText ? { display: 'none' } : {}
    const small = width < 80 || height < 80

    if (pages || icon) {
      return (
        <div className="Thumb-multipage-badge">
          <div className={classnames('icon', {small})}><img src={icon}/></div>
          <div style={textStyle} className={classnames('Thumb-pages', {small})}>
            {pages}
          </div>
        </div>
      )
    } else if (duration) {
      return (
        <div className="Thumb-time-badge">
          <div className={classnames('Thumb-play-badge', {small})}>
            <div className={classnames('Thumb-arrow-right', {small})} />
          </div>
          <div style={textStyle} className={classnames('Thumb-duration', {small})}>
            { formatDuration(parseFormattedFloat(duration)) }
          </div>
        </div>
      )
    }
  }

  render () {
    const {assets, protocol, host, isSelected, onClick, onDoubleClick, dragparams} = this.props
    const {width, height, x, y} = this.props.dim      // Original thumb rect
    if (!width || !height) return null
    const style = {width, height, left: x, top: y}    // Dim -> left, right
    const parentURL = assets[0].parentProxyURL(protocol, host)
    if (!parentURL) {
      const asset = assets[0]
      var proxy = asset.closestProxy(width, height)
      const url = proxy ? proxy.url(protocol, host) : ''
      const tproxy = asset.tinyProxy()
      const backgroundColor = tproxy ? tproxy[4] : '#888'
      return (
        <div className={classnames('Thumb', {isSelected})} style={style}
             onClick={onClick} onDoubleClick={onDoubleClick} {...dragparams}>
          <ImageThumb url={url} backgroundColor={backgroundColor}>
            <div className='Thumb-selection'>
              <div className='Thumb-selection-overlay'/>
              <div className='Thumb-selection-check icon-check'/>
            </div>
            { this.renderBadges() }
          </ImageThumb>
        </div>
      )
    }

    return (
      <div className={classnames('Thumb', {isSelected})} style={style}
           onClick={onClick} onDoubleClick={onDoubleClick} {...dragparams}>
        { assets.slice(0).reverse().map((asset, rindex) => {
          var proxy = asset.closestProxy(width, height)
          const url = proxy ? proxy.url(protocol, host) : ''
          const tproxy = asset.tinyProxy()
          const backgroundColor = tproxy ? tproxy[4] : '#888'
          const index = assets.length - rindex - 1
          return (
            <div key={`${asset.id}-${index}`} className={classnames('Thumb-stack', `Thumb-stack-${index}`)}>
              <ImageThumb url={url} backgroundColor={backgroundColor}/>
            </div>
          )
        })}
        <div className="Thumb-inset">
          <ImageThumb url={parentURL}/>
        </div>
        <div className='Thumb-selection'>
          <div className='Thumb-selection-overlay'/>
          <div className='Thumb-selection-check icon-check'/>
        </div>
        { this.renderBadges() }
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host,
  selectedAssetIds: state.assets.selectedIds
}))(Thumb)
