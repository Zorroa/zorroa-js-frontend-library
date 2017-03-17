import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import * as assert from 'assert'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { getAssetFields, searchAssetsRequestProm } from '../../actions/assetsAction'
import { SimilarHashWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import { equalSets, makePromiseQueue } from '../../services/jsUtil'

const SCHEMA = 'Similarity'

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
    hashTypes: null,
    hashName: '',
    hashVal: '',
    minScore: 50,
    aggs: {},
    selectedAsset: null,
    selectedAssetIds: null
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
    this.props.actions.getAssetFields()
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  // recompute state.hashNames based on give props
  // return promise that resolves after setState is complete
  updateHashTypes = (props) => {
    const { fields } = props
    if (!fields) return Promise.resolve()

    let hashTypes = {}
    for (var s in fields.string) {
      const fieldParts = fields.string[s].split('.')
      if (fieldParts.length >= 3 && fieldParts[0] === SCHEMA) {
        hashTypes[fieldParts[1]] = fieldParts[2]
      }
    }
    return this.setStatePromise({ hashTypes })
  }

  componentWillReceiveProps = (nextProps) => {
    if (!this.state.isEnabled) return

    // initialize hashTypes first time through -- or maybe (TODO) later as well
    if (!this.state.hashTypes) this.updateHashTypes(nextProps)

    // If the selection changes, and we don't have something selected yet,
    // then do it now.
    const newSelectedAssetIds = nextProps.selectedAssetIds
    const oldSelectedAssetIds = this.state.selectedAssetIds

    const selectionChanged = !equalSets(newSelectedAssetIds, oldSelectedAssetIds)

    if (newSelectedAssetIds && newSelectedAssetIds.size && selectionChanged) {
      this.updateCounts(newSelectedAssetIds)
    }

    this.setState({ selectedAssetIds: newSelectedAssetIds })
    this.syncWithAppState(nextProps)
  }

  syncWithAppState (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver && widget.sliver.filter && widget.sliver.filter.hamming) {
      const newHamming = widget.sliver.filter.hamming
      let doUpdate = false
      if (newHamming.field !== this.state.field) doUpdate = true
      if (JSON.stringify(newHamming.hashes) !== JSON.stringify(this.state.hashes)) doUpdate = true
      if (newHamming.minScore !== this.state.minScore) doUpdate = true

      if (doUpdate) {
        const fieldSplit = newHamming.field.split('.')
        const hashName = fieldSplit[1]
        const hashVal = newHamming.hashes[0]
        const minScore = newHamming.minScore

        this.setState({ hashName, hashVal, minScore })
      }
    }
  }

  toggleEnabled = () => {
    this.setStatePromise({isEnabled: !this.state.isEnabled})
    .then(this.modifySliver)
  }

  modifySliver = () => {
    const { hashName, hashVal, minScore, hashTypes } = this.state
    const { isEnabled } = this.state
    const type = SimilarHashWidgetInfo.type

    let sliver = new AssetSearch(/*{aggs}*/) // NB aggs break the search!
    if (hashName && hashVal) {
      assert.ok(hashTypes[hashName])
      sliver.filter = new AssetFilter({
        hamming: {
          field: `${SCHEMA}.${hashName}.${hashTypes[hashName]}.raw`,
          hashes: [ hashVal ],
          minScore
        }
      })
    }
    const widget = new WidgetModel({id: this.props.id, isEnabled, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  updateCounts = (selectedAssetIds) => {
    if (!selectedAssetIds || selectedAssetIds.size === 0) {
      // Deselect: clear counts
      return this.setStatePromise({ aggs: {} })
    }

    const { isEnabled } = this.state
    if (!isEnabled) return

    const firstSelectedAssetId = selectedAssetIds.values().next().value
    const { assets } = this.props
    const selectedAsset = assets.find(asset => { return firstSelectedAssetId === asset.id })
    if (!selectedAsset) return

    let aggData = []
    const queryAggs = {}
    const dummyDispatch = () => {}
    const { minScore } = this.state
    const assetHashes = selectedAsset.document[SCHEMA]
    const hashNames = Object.keys(assetHashes)
    hashNames.forEach(hashName => {
      const hashObj = assetHashes[hashName]
      for (let hashType in hashObj) {
        const hashVal = hashObj[hashType]
        queryAggs[hashName] = {
          [`similarHash-${hashName}`]: {
            filter: {
              bool: {
                must: {
                  script: {
                    script: {
                      inline: 'hammingDistance',
                      lang: 'native',
                      params: {
                        field: `${SCHEMA}.${hashName}.${hashType}.raw`,
                        hashes: [ hashVal ],
                        minScore
                      }
                    }
                  }
                }
              }
            }
          }
        }
        aggData.push({ aggs: queryAggs[hashName], size: 1 })
      }
    })

    const mkProm = (aggDatum) => {
      return searchAssetsRequestProm(dummyDispatch, new AssetSearch(aggDatum))
      .catch(error => error) // this catch ensures one error doesn't spoil the batch
    }

    return makePromiseQueue(aggData, mkProm, -1 /* optQueueSize: use a positive number to rate-limit requests */)
    .then(responses => {
      let resultAggs = {}
      responses.forEach((response, i, a) => {
        if (!response || !response.data || !response.data.aggregations) return
        const hashName = hashNames[i]
        resultAggs[hashName] = Object.values(response.data.aggregations)[0]
      })
      return this.setStatePromise({ aggs: resultAggs })
    })
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectHash (hashName, event) {
    let hashVal = null
    let selectedAsset = this.state.selectedAsset

    const { assets, selectedAssetIds } = this.props

    if (selectedAssetIds && selectedAssetIds.size) {
      const firstSelectedAssetId = selectedAssetIds.values().next().value
      if (firstSelectedAssetId) {
        selectedAsset = assets.find(asset => { return firstSelectedAssetId === asset.id }) || selectedAsset
        const hashObj = selectedAsset.document[SCHEMA]
        const hashTypeObj = hashObj[hashName]
        assert.ok(hashTypeObj)
        hashVal = Object.values(hashObj[hashName])[0]
      }
    }

    new Promise(resolve => requestAnimationFrame(resolve))
    .then(() => this.setStatePromise({ hashName, hashVal, selectedAsset }))
    .then(this.modifySliver)
  }

  deselectHash = (event) => {
    this.setStatePromise({ hashName: '', hashVal: '', selectedAsset: null })
    .then(this.modifySliver)
  }

  renderHeaderCell (column) {
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
          { this.state.hashName && (
            <div className="SimilarHash-clear-selection-inner flexCol">
              <span>{this.state.hashName}</span>
              <div className="flexRowCenter fullWidth clampText">
                <span className="SimilarHash-selection-val">{this.state.hashVal}</span>
              </div>
            </div>
          )}
        </div>
        <div className="SimilarHash-clear-selection flexOff">
          { this.state.hashName && (
            <div onClick={this.deselectHash} className="SimilarHash-clear-selection-cancel icon-cancel-circle"/>
          )}
        </div>
      </div>
    )
  }

  renderChart () {
    const { hashTypes, aggs } = this.state
    return (
      <div className="SimilarHash-table">
        <div className="SimilarHash-table-header">
          { this.renderHeaderCell('hash') }
          { this.renderHeaderCell('count') }
        </div>
        <div className="SimilarHash-value-table">
          <table>
            <thead>
              <tr>
                <td style={{width: '80%'}}/>
                <td style={{width: '20%'}}/>
              </tr>
            </thead>
            <tbody>
            { (() => {
              if (!hashTypes) return null
              const hashNames = Object.keys(hashTypes).sort()
              return hashNames.map(hashName => (
                <tr className={classnames('SimilarHash-value-table-row',
                  { selected: hashName === this.state.hashName })}
                    key={hashName} onClick={e => this.selectHash(hashName, e)}>
                  <td className="SimilarHash-value-cell">
                    <div className="SimilarHash-value-table-key">
                      <div className="SimilarHash-value-key">{hashName}</div>
                    </div>
                  </td>
                  <td className="SimilarHash-value-count">
                    {(aggs && aggs[hashName] && aggs[hashName].doc_count) || '--'}
                  </td>
                </tr>
              ))
            })() }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  doUpdateMinScore = true
  minScoreAtStart = 50
  startMinScoreChange = (event) => {
    this.doUpdateMinScore = false
    this.minScoreAtStart = this.state.minScore
  }
  stopMinScoreChange = (event) => {
    this.doUpdateMinScore = true
    if (this.state.minScore !== this.minScoreAtStart) this.onMinScoreChanged()
  }
  onMinScoreChanged = () => {
    return this.updateCounts(this.props.selectedAssetIds)
    .then(() => { this.modifySliver() })
  }
  updateMinScore = (event) => {
    const minScore = event && parseInt(event.target.value, 10)
    this.setStatePromise({ minScore })
    .then(() => { return this.doUpdateMinScore && this.onMinScoreChanged() })
  }

  render () {
    const { isIconified } = this.props
    const { isEnabled, hashName } = this.state
    return (
      <Widget className="SimilarHash"
              title={SimilarHashWidgetInfo.title}
              field={hashName}
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
                     value={this.state.minScore}
                     onChange={this.updateMinScore}
                     onMouseDown={this.startMinScoreChange}
                     onMouseUp={this.stopMinScoreChange}
                     min="0"
                     max="100" />
            </div>
            <span className="SimilarHash-thresh-val">{`${this.state.minScore}%`}</span>
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
