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

  constructor (props) {
    super(props)

    const { asset, host } = this.props
    const tproxy = asset.tinyProxy()
    const rects = tproxy.map((color,index) => {
      return `<rect x="${index%3}" y="${Math.floor(index/3)}" height="1" width="1" style="fill:${color}"/>`
    })
    this.url = `<svg viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rects.join('')}</svg>`
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
    }, Math.round(index * 250))

    const proxyURL = `url(data:image/svg+xml,${encodeURIComponent(this.url)})`
    console.log(proxyURL)

    const thumbStyle={
      'backgroundImage': proxyURL,
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
