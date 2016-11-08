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
    protocol: PropTypes.string,
    host: PropTypes.string,
    dim: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    dragparams: PropTypes.object
  }

  render () {
    const { asset, protocol, host, dim, selected, onClick, onDoubleClick, dragparams } = this.props
    if (!asset.proxies) {
      return <div className="thumb" style={{ backgroundColor: asset.backgroundColor() }} />
    }
    const proxy = asset.closestProxy(dim.width, dim.height)
    return (
      <div
        className='assets-thumb'
        style={{
          'backgroundImage': `url(${proxy.url(protocol, host)})`,
          'backgroundSize': 'cover',
          'width': dim.width,
          'height': dim.height,
          'left': dim.x,
          'top': dim.y,
          'border': selected ? '3px solid #73b61c' : 'none'
        }}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        {...dragparams}
      />
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host
}))(Thumb)
