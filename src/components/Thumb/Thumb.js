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

  render () {
    const { asset, host, dim, selected, onClick, onDoubleClick, dragparams, index } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    const proxy = asset.closestProxy(dim.width, dim.height)
    const thumbURL = proxy.url(host)
    const thumbClass = `assets-thumb-${thumbURL}`

    setTimeout(_ => {
      const thumb = document.getElementsByClassName(thumbClass)[0]
      if (thumb) {
        thumb.style['background-image'] = `url(${thumbURL})`
      }
    }, Math.round(index * 15))

    const tproxy = asset.tinyProxy()
    const proxySvgUrl = `<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="0" y="0" height="1" width="1" style="fill:${tproxy[4]}"/></svg>`
    const proxyDataURL = `url(data:image/svg+xml,${encodeURIComponent(proxySvgUrl)})`

    const thumbStyle={
      'backgroundImage': proxyDataURL,
      'backgroundSize': 'cover',
      'width': dim.width,
      'height': dim.height,
      'left': dim.x,
      'top': dim.y,
      'border': selected ? '3px solid #73b61c' : 'none'
    }

    return (
      <div
        className={`assets-thumb ${thumbClass}`}
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
