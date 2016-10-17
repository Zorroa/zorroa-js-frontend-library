import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import Lightbar from './Lightbar'
import Inspector from '../Inspector'

class Lightbox extends Component {
  static get displayName () {
    return 'Lightbox'
  }

  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
      isolatedId: PropTypes.number
    }
  }

  render () {
    const { assets, isolatedId } = this.props
    const asset = assets && isolatedId ? assets.find(asset => (asset.id === isolatedId)) : null
    return (
      <div className="lightbox flexCenter fullWidth">
        <Lightbar/>
        <div className="lightbox-body">
          <Inspector asset={asset} />
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  isolatedId: state.assets.isolatedId
}))(Lightbox)
