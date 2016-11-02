import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import keydown from 'react-keydown'

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
      isolatedId: PropTypes.string.isRequired
    }
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  @keydown('esc') // http://glortho.github.io/react-keydown/example/index.html
  closeLightbox (event) {
    this.context.router.push('/')
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
}))(Lightbox)
