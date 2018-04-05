import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import AssetSearch from '../../models/AssetSearch'

class Pager extends Component {
  static propTypes = {
    loaded: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch).isRequired,
  }

  render() {
    const { loaded, total } = this.props
    if (loaded < total) {
      const ellipsis = require('./ellipsis.svg')
      return (
        <div
          className="Pager-waiting flexRowCenter"
          style={{ top: this.props.top + 'px' }}>
          <img className="Pager-waiting" src={ellipsis} />
        </div>
      )
    }
    return <div className="Pager" style={{ top: this.props.top + 'px' }} />
  }
}

const mapDispatchToProps = () => ({})

const mapStateToProps = state => ({
  query: state.assets.query,
})

export default connect(mapStateToProps, mapDispatchToProps)(Pager)
