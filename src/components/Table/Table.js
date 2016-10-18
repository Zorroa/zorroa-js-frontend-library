import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Table extends Component {
  static get propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
    }
  }

  renderRow (asset) {
    if (!(asset instanceof Asset)) {
      return
    }
    return (
      <tr key={asset.id} className="assets-table-row">
        <td>{asset.id}</td>
        <td>{asset.source()}</td>
      </tr>
    )
  }

  render () {
    const { assets } = this.props
    if (!assets || !assets.length) {
      return (<div>No assets in table</div>)
    }
    return (
      <div className="assets-table-scroll">
        <table className="assets-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Source</th>
          </tr>
          </thead>
          <tbody>
          { assets.map(asset => (this.renderRow(asset))) }
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all
}))(Table)
