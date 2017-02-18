import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import keydown from 'react-keydown'

import Asset from '../../models/Asset'
import Lightbar from './Lightbar'
import Inspector from '../Inspector'
import { isolateAssetId } from '../../actions/assetsAction'

class Lightbox extends Component {
  static get displayName () {
    return 'Lightbox'
  }

  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string.isRequired,
    actions: PropTypes.object
  }

  @keydown('esc')
  closeLightbox (event) {
    this.props.actions.isolateAssetId()
  }

  @keydown('right')
  nextAsset (event) {
    this.isolateIndexOffset(1)
  }

  @keydown('left')
  previousAsset (event) {
    this.isolateIndexOffset(-1)
  }

  isolateIndexOffset (offset) {
    const { assets, isolatedId, actions } = this.props
    const index = assets.findIndex(asset => (asset.id === isolatedId))
    if (index + offset >= 0 && index + offset < assets.length) {
      actions.isolateAssetId(assets[index + offset].id)
    }
  }

  render () {
    const { assets, isolatedId } = this.props
    const asset = assets && isolatedId ? assets.find(asset => (asset.id === isolatedId)) : null
    return (
      <div className="lightbox flexCol fullWidth fullHeight">
        <Lightbar/>
        <div className="lightbox-body flexOn fullWidth fullHeight">
          <Inspector asset={asset} />
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  isolatedId: state.assets.isolatedId
}), dispatch => ({
  actions: bindActionCreators({ isolateAssetId }, dispatch)
}))(Lightbox)
