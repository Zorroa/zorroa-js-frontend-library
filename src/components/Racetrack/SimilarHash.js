import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { getAssetFields } from '../../actions/assetsAction'
import { SimilarHashWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import { equalSets } from '../../services/jsUtil'

class SimilarHash extends Component {
  static propTypes = {
    // state props
    aggs: PropTypes.object,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    fields: PropTypes.object,                         // state.assets.fields
    widgets: PropTypes.arrayOf(PropTypes.object),
    protocol: PropTypes.string,
    host: PropTypes.string,
    actions: PropTypes.object.isRequired,

    // input props
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  state = {
    isEnabled: true,
    // order: { '_count': 'desc' },
    hashTypes: null,
    hashLengths: {},
    hashType: '',
    hashVal: '',
    minScorePct: 50,
    selectedAsset: null,
    selectedAssetIds: null
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
    this.props.actions.getAssetFields()
  }

  componentWillReceiveProps = (nextProps) => {
    if (!this.state.isEnabled) return

    // initialize hashTypes first time through -- or maybe (TODO) later as well
    if (!this.state.hashTypes) {
      const { fields } = nextProps
      if (fields) {
        let hashTypes = []
        for (var s in fields.string) {
          const fieldParts = fields.string[s].split('.')
          if (fieldParts.length === 2 && fieldParts[0] === 'ImageHash') {
            hashTypes.push(fieldParts[1])
          }
        }
        hashTypes.sort()
        this.setState({ hashTypes })
      }
    }

    // If the selection changes, and we don't have something selected yet,
    // then do it now.
    const newSelectedAssetIds = nextProps.selectedAssetIds
    const oldSelectedAssetIds = this.state.selectedAssetIds

    const selectionChanged = !equalSets(newSelectedAssetIds, oldSelectedAssetIds)

    const { hashType, selectedAsset } = this.state
    if (!selectedAsset && hashType && newSelectedAssetIds && newSelectedAssetIds.size && selectionChanged) {
      requestAnimationFrame(() => this.selectHashType(hashType, {}))
    }

    this.setState({ selectedAssetIds: newSelectedAssetIds })
    this.syncWithAppState(nextProps)
  }

  syncWithAppState (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
    }
  }

  toggleEnabled = () => {
    new Promise(resolve => this.setState({isEnabled: !this.state.isEnabled}, resolve))
    .then(this.modifySliver)
  }

  modifySliver = () => {
    const { hashType, hashVal, hashLengths, minScorePct } = this.state
    const { isEnabled } = this.state
    const type = SimilarHashWidgetInfo.type
    const aggs = {}

    this.state.hashTypes.forEach(h => {
      aggs[`similarHash-${h}`] = {
        filter: {
          bool: {
            must: {
              script: {
                script: {
                  inline: 'hammingDistance',
                  lang: 'native',
                  params: {
                    field: `ImageHash.${h}.raw`,
                    hashes: [ hashVal ],
                    minScore: Math.round(hashLengths[h] / 2),
                    bitwise: true
                  }
                }
              }
            }
          }
        }
      }
    })

    let sliver = new AssetSearch({aggs})
    if (hashType && hashVal) {
      sliver.filter = new AssetFilter({
        hamming: {
          field: `ImageHash.${hashType}.raw`,
          hashes: [ hashVal ],
          minScore: Math.round((minScorePct / 100) * hashLengths[hashType]),
          bitwise: true
        }
      })
    }
    const widget = new WidgetModel({id: this.props.id, isEnabled, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectHashType (hashType, event) {
    let hashVal = null
    let selectedAsset = this.state.selectedAsset
    let hashLengths = this.state.hashLengths

    const { assets, selectedAssetIds } = this.props

    if (selectedAssetIds && selectedAssetIds.size) {
      const firstSelectedAssetId = selectedAssetIds.values().next().value
      if (firstSelectedAssetId) {
        selectedAsset = assets.find(asset => { return firstSelectedAssetId === asset.id })
        hashVal = selectedAsset.document.ImageHash[hashType]

        this.state.hashTypes.forEach(ht => {
          const hv = selectedAsset.document.ImageHash[ht]
          if (hv) hashLengths[ht] = hv.length
        })
      }
    }

    new Promise(resolve => requestAnimationFrame(resolve))
    .then(() => new Promise(resolve => this.setState({ hashType, hashVal, hashLengths, selectedAsset }, resolve)))
    .then(this.modifySliver)
  }

  deselectHash = (event) => {
    const hashVal = ''
    new Promise(resolve => this.setState({ hashVal, selectedAsset: null }, resolve))
    .then(this.modifySliver)
  }

  renderHeaderCell (column) {
    // const { order } = this.state
    // const sortField = { 'keyword': '_term', 'count': '_count' }
    // const dir = order[sortField[column]]
    // const icon = 'SimilarHash-table-header-count icon-sort' + (dir ? `-${dir}` : '')
    // <div onClick={/*this.sortBuckets.bind(this, column)*/} className="SimilarHash-table-header-cell">

    return (
      <div className="SimilarHash-table-header-cell">
        <div className="SimilarHash-table-header-title">{column}</div>
        {/* <div className={icon}/> */}
      </div>
    )
  }

  renderSelection () {
    const { host, protocol } = this.props
    const { selectedAsset } = this.state
    return (
      <div className="SimilarHash-selection flexRow">
        <div className="SimilarHash-asset-selection flexRowCenter flexOff">
          { selectedAsset && (
            <div className="SimilarHash-asset"
                 style={{backgroundImage: `url(${selectedAsset.smallestProxy().url(protocol, host)})`}}
          />)}
        </div>
        <div className="SimilarHash-selection-hash flexOn">
          { this.state.hashType && (
            <div className="SimilarHash-clear-selection-inner flexCol">
              <span>{this.state.hashType}</span>
              <div className="flexRowCenter fullWidth clampText">
                <span className="SimilarHash-selection-val">{this.state.hashVal}</span>
              </div>
            </div>
          )}
        </div>
        <div className="SimilarHash-clear-selection flexOff">
          { this.state.hashType && (
            <div onClick={this.deselectHash} className="SimilarHash-clear-selection-cancel icon-cancel-circle"/>
          )}
        </div>
      </div>
    )
  }

  renderChart () {
    const { hashTypes } = this.state
    const { id, aggs } = this.props
    return (
      <div className="SimilarHash-table">
        <div className="SimilarHash-table-header">
          { this.renderHeaderCell('hash') }
          { this.renderHeaderCell('count') }
        </div>
        <div className="SimilarHash-value-table">
          <table>
            <tbody>
            { hashTypes && hashTypes.map(hashType => (
              <tr className={classnames('SimilarHash-value-table-row',
                { selected: hashType === this.state.hashType })}
                  key={hashType} onClick={e => this.selectHashType(hashType, e)}>
                <td className="SimilarHash-value-cell">
                  <div className="SimilarHash-value-table-key">
                    <div className="SimilarHash-value-key">{hashType}</div>
                  </div>
                </td>
                <td className="SimilarHash-value-count">{
                  (() => {
                    try {
                      return aggs[id][`similarHash-${hashType}`].doc_count
                    } catch (e) {
                      return '--'
                    }
                  })()
                }</td>
              </tr>
            )) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  updateMinScore = (event) => {
    const minScorePct = Math.round(parseInt(event.target.value, 10))
    new Promise(resolve => this.setState({ minScorePct }, resolve))
    .then(this.modifySliver)
  }

  render () {
    const { isIconified } = this.props
    const { isEnabled, hashType } = this.state
    return (
      <Widget className="SimilarHash"
              title={SimilarHashWidgetInfo.title}
              field={hashType}
              backgroundColor={SimilarHashWidgetInfo.color}
              isEnabled={isEnabled}
              enableToggleFn={this.toggleEnabled}
              isIconified={isIconified}
              icon={SimilarHashWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="SimilarHash-body flexCol">
          <div className="SimilarHash-thresh-box flexRowCenter fullWidth">
            <span className="SimilarHash-thresh-label">Similarity</span>
            <div className="SimilarHash-thresh-slider-box">
              <div className="SimilarHash-thresh-slider-line-box">
                <div className="SimilarHash-thresh-slider-line"/>
              </div>
              <input className="SimilarHash-thresh-slider flexOn"
                     type="range"
                     value={this.state.minScorePct}
                     onChange={this.updateMinScore}
                     min="0"
                     max="100" />
            </div>
            <span className="SimilarHash-thresh-val">{`${this.state.minScorePct}%`}</span>
          </div>
          { this.renderChart() }
          { this.renderSelection() }
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    aggs: state.assets && state.assets.aggs,
    assets: state.assets.all,
    selectedAssetIds: state.assets.selectedIds,
    fields: state.assets && state.assets.fields,
    widgets: state.racetrack && state.racetrack.widgets,
    protocol: state.auth.protocol,
    host: state.auth.host
  }), dispatch => ({
    actions: bindActionCreators({
      modifyRacetrackWidget,
      removeRacetrackWidgetIds,
      showModal,
      getAssetFields
    }, dispatch)
  })
)(SimilarHash)
