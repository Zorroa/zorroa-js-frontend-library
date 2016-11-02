import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'

class Table extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
  }

  renderRow (asset) {
    if (!(asset instanceof Asset)) {
      return
    }
    return (
      <tr key={asset.id} className="assets-table-row">
        <td className='assets-table-col-id'>{asset.id}</td>
        <td className='assets-table-col-source'>{asset.source()}</td>
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
                <th className='assets-table-col-id'>ID</th>
                <th className='assets-table-col-source'>Source</th>
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
