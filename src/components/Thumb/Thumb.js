import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'

const source = {
  dragStart (props, type, se) {
    se.dataTransfer.setData('text/plain', type)
  },
  dragEnd (props, type, se) {
    se.preventDefault()
  }
}

@DragSource('FOLDER', source)
class Thumb extends Component {
  static propTypes = {
    asset: PropTypes.instanceOf(Asset).isRequired,
    host: PropTypes.string,
    dim: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    dragparams: PropTypes.object,
    index: PropTypes.number.isRequired
  }

  componentWillMount () {
    const { asset, host, dim, index } = this.props
    this.proxy = asset.closestProxy(dim.width, dim.height)
    const thumbURL = this.proxy.url(host)
    this.thumbClass = `assets-thumb-${thumbURL}`

    // Delay the image load by a small amount, in order to show images loading in order.
    // (Otherwise browsers will decide for us, and you won't like it)
    // 15ms per image seemed about right in Chrome to balance
    // seeing the color swatch for the longest possible time,
    // without overall load taking longer.
    this.loadTimer = setTimeout(_ => {
      const thumb = document.getElementsByClassName(this.thumbClass)[0]
      if (thumb) thumb.style['background-image'] = `url(${thumbURL})`
      this.loadTimer = null
    }, Math.round(index * 15))
  }

  componentWillUnmount () {
    // if we started a load timer in render() that hasn't finished, cancel it
    if (this.loadTimer) clearTimeout(this.loadTimer)
  }

  render () {
    const { asset, dim, selected, onClick, onDoubleClick, dragparams } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }

    const tproxy = asset.tinyProxy()

    const thumbStyle = {
      'backgroundColor': tproxy[4],
      'backgroundSize': 'cover',
      'width': dim.width,
      'height': dim.height,
      'left': dim.x,
      'top': dim.y,
      'border': selected ? '3px solid #73b61c' : 'none'
    }

    return (
      <div
        className={`assets-thumb ${this.thumbClass}`}
        style={thumbStyle}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        {...dragparams}
      />
    )
  }
}

export default connect(state => ({
  host: state.auth.host
}))(Thumb)
