import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import JSONTree from 'react-json-tree'
import copy from 'copy-to-clipboard'

import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { hideModal } from '../../actions/appActions'
import { searchAssetsRequestProm } from '../../actions/assetsAction'

const theme = {
  scheme: 'bright',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#000000',
  base01: '#303030',
  base02: '#505050',
  base03: '#b0b0b0',
  base04: '#d0d0d0',
  base05: '#e0e0e0',
  base06: '#f5f5f5',
  base07: '#ffffff',
  base08: '#fb0120',
  base09: '#fc6d24',
  base0A: '#fda331',
  base0B: '#a1c659',
  base0C: '#76c7b7',
  base0D: '#6fb3d2',
  base0E: '#d381c3',
  base0F: '#be643c',
}

class Developer extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    actions: PropTypes.object.isRequired,
  }

  state = {
    selectedAssets: [],
    copyingAssets: false,
    copyingQuery: false,
  }

  componentWillMount() {
    this.updateAssets()
  }

  updateAssets = () => {
    const { query, selectedAssetIds } = this.props
    if (!selectedAssetIds || !selectedAssetIds.size) return
    const search = new AssetSearch(query)
    const filter = new AssetFilter({ terms: { _id: [...selectedAssetIds] } })
    search.filter = search.filter ? search.filter.merge(filter) : filter
    search.from = 0
    search.size = selectedAssetIds.size
    const dummyDispatch = () => {}
    searchAssetsRequestProm(dummyDispatch, search).then(response => {
      const selectedAssets = response.data.list.map(json => new Asset(json))
      this.setState({ selectedAssets })
    })
  }

  dismiss = event => {
    this.props.actions.hideModal()
  }

  copyQueryToClipboard = event => {
    copy(JSON.stringify(this.props.query))
    this.setState({ copyingQuery: true })
    if (this.copyQueryTimeout) clearTimeout(this.copyQueryTimeout)
    this.copyQueryTimeout = setTimeout(() => {
      this.setState({ copyingQuery: false })
      this.copyQueryTimeout = null
    }, 3000)
  }

  copyAssetsToClipboard = event => {
    copy(JSON.stringify(this.state.selectedAssets))
    this.setState({ copyingAssets: true })
    if (this.copyAssetsTimeout) clearTimeout(this.copyAssetsTimeout)
    this.copyAssetsTimeout = setTimeout(() => {
      this.setState({ copyingAssets: false })
      this.copyAssetsTimeout = null
    }, 3000)
  }

  renderQuery() {
    const { query } = this.props
    const { copyingQuery } = this.state
    const data = JSON.parse(JSON.stringify(query), (key, value) => value) // remove undefined
    return (
      <div className="Developer-query">
        <div className="Developer-query-title">
          <div className="Developer-query-label">Current Search</div>
          <div
            onClick={this.copyQueryToClipboard}
            className="Developer-query-copy">
            <div>Copy</div>
            {copyingQuery && (
              <div className="Developer-query-copying">Copied to Clipboard</div>
            )}
          </div>
        </div>
        <div className="Developer-query-body">
          <JSONTree data={data} theme={theme} invertTheme hideRoot />
        </div>
      </div>
    )
  }

  renderSelectedAssets() {
    const { selectedAssetIds } = this.props
    const { selectedAssets, copyingAssets } = this.state
    const loading = require('../Assets/ellipsis.svg')
    return (
      <div className="Developer-assets">
        <div className="Developer-assets-title">
          <div className="Developer-assets-label">Selected Assets</div>
          <div
            onClick={this.copyAssetsToClipboard}
            className="Developer-assets-copy">
            <div>Copy</div>
            {copyingAssets && (
              <div className="Developer-assets-copying">
                Copied to Clipboard
              </div>
            )}
          </div>
        </div>
        <div className="Developer-assets-json">
          <JSONTree data={selectedAssets} theme={theme} invertTheme hideRoot />
          {(!selectedAssetIds || !selectedAssetIds.size) && (
            <div className="Developer-assets-empty">No assets selected</div>
          )}
          {selectedAssetIds &&
            selectedAssetIds.size > 0 &&
            (!selectedAssets || !selectedAssets.length) && (
              <div className="fullWidth flexRowCenter">
                <img src={loading} />
              </div>
            )}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="Developer">
        <div className="Developer-title">
          <div className="flexRowCenter">
            <div className="Developer-title-icon icon-script" />
            <div className="Developer-title-text">Developer</div>
          </div>
          <div
            onClick={this.dismiss}
            className="Developer-title-close icon-cross"
          />
        </div>
        {this.renderQuery()}
        {this.renderSelectedAssets()}
        <div className="Developer-controls">
          <div className="Developer-done" onClick={this.dismiss}>
            Done
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    query: state.assets.query,
    assets: state.assets.all,
    selectedAssetIds: state.assets.selectedIds,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        hideModal,
      },
      dispatch,
    ),
  }),
)(Developer)
