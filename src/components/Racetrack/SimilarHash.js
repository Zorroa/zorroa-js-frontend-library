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
    hashBitwise: null,
    minScorePct: 50,
    bitwise: true,
    selectedAsset: null,
    selectedAssetIds: null,
    schema: 'ImageHash' // Temp test for Juan, TODO: remove
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
    this.props.actions.getAssetFields()
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  // recompute state.hashTypes based on give props & schema
  // return promise that resolves after setState is complete
  updateHashTypes = (props, schema) => {
    const { fields } = props
    if (!fields) return Promise.resolve()

    const testSchema = (schema === 'Similarity')

    let hashTypes = []
    let hashBitwise = {}
    for (var s in fields.string) {
      const fieldParts = fields.string[s].split('.')
      if (fieldParts.length >= 2 && fieldParts[0] === schema) {
        const hashType = fieldParts[1]
        hashTypes.push(hashType)
        if (testSchema) hashBitwise[hashType] = (fieldParts[2] === 'bit')
      }
    }
    hashTypes.sort()
    return this.setStatePromise({ hashTypes, hashBitwise })
  }

  componentWillReceiveProps = (nextProps) => {
    if (!this.state.isEnabled) return

    // initialize hashTypes first time through -- or maybe (TODO) later as well
    if (!this.state.hashTypes) this.updateHashTypes(nextProps, this.state.schema)

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
    this.setStatePromise({isEnabled: !this.state.isEnabled})
    .then(this.modifySliver)
  }

  modifySliver = () => {
    const { hashType, hashVal, hashLengths, hashBitwise, minScorePct } = this.state
    const { isEnabled, bitwise, schema } = this.state
    const type = SimilarHashWidgetInfo.type
    const aggs = {}

    const isTestSchema = (schema === 'Similarity')

    this.state.hashTypes.forEach(h => {
      const t = hashBitwise[h] ? 'bit' : 'byte'
      aggs[`similarHash-${h}`] = {
        filter: {
          bool: {
            must: {
              script: {
                script: {
                  inline: 'hammingDistance',
                  lang: 'native',
                  params: {
                    field: isTestSchema ? `${schema}.${h}.${t}.raw` : `${schema}.${h}.raw`,
                    hashes: [ hashVal ],
                    minScore: Math.round(hashLengths[h] / 2) * (bitwise ? 4 : 1),
                    bitwise
                  }
                }
              }
            }
          }
        }
      }
    })

    let sliver = new AssetSearch(/*{aggs}*/) // NB aggs break the search!
    if (hashType && hashVal) {
      const t = hashBitwise[hashType] ? 'bit' : 'byte'
      sliver.filter = new AssetFilter({
        hamming: {
          field: isTestSchema ? `${schema}.${hashType}.${t}.raw` : `${schema}.${hashType}.raw`,
          hashes: [ hashVal ],
          minScore: Math.round((minScorePct / 100) * hashLengths[hashType]) * (bitwise ? 4 : 1),
          bitwise
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
    const { schema } = this.state
    let { bitwise } = this.state

    if (selectedAssetIds && selectedAssetIds.size) {
      const firstSelectedAssetId = selectedAssetIds.values().next().value
      if (firstSelectedAssetId) {
        selectedAsset = assets.find(asset => { return firstSelectedAssetId === asset.id })
        const hashObj = selectedAsset.document[schema]
        const isTestSchema = (schema === 'Similarity')
        hashVal = isTestSchema ? Object.values(hashObj[hashType])[0] : hashObj[hashType]

        if (isTestSchema) bitwise = this.state.hashBitwise[hashType]

        // compute hashLengths. simple & harmless to do every time, but cbb
        this.state.hashTypes.forEach(ht => {
          const hashObj = selectedAsset.document[schema]
          if (!(ht in hashObj)) return // skip missing data
          const hv = isTestSchema ? Object.values(hashObj[ht])[0] : hashObj[ht]
          if (hv) hashLengths[ht] = hv.length
        })
      }
    }

    new Promise(resolve => requestAnimationFrame(resolve))
    .then(() => this.setStatePromise({ hashType, hashVal, hashLengths, bitwise, selectedAsset }))
    .then(this.modifySliver)
  }

  deselectHash = (event) => {
    this.setStatePromise({ hashVal: '', selectedAsset: null })
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
    this.setStatePromise({ minScorePct })
    .then(this.modifySliver)
  }

  updateBitwise = (event) => {
    const { bitwise } = this.state
    return this.setStatePromise({ bitwise: !bitwise })
    .then(this.modifySliver)
  }

  // TODO: remove this asap [Sat Mar 11 08:14:57 2017]
  // This is throwaway test code for Juan
  updateSchema = (event) => {
    let { schema } = this.state
    if (schema === 'ImageHash') schema = 'Similarity'
    else schema = 'ImageHash'

    this.setStatePromise({ hashType: '', hashVal: '', selectedAsset: null })
    .then(() => this.updateHashTypes(this.props, schema))
    .then(() => this.setStatePromise({ schema }))
    .then(this.modifySliver)
  }

  render () {
    const { isIconified } = this.props
    const { isEnabled, hashType, bitwise, schema } = this.state
    const isTestSchema = (schema === 'Similarity')
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
          <div className="SimilarHash-options-box">
            <label className="SimilarHash-bitwise-label" style={{color: isTestSchema ? '#bbb' : '#000'}}>Bit-wise
              <input className="SimilarHash-bitwise-toggle"
                     type="checkbox"
                     checked={bitwise}
                     disabled={isTestSchema}
                     onChange={this.updateBitwise}/>
            </label>
            <div className='flexOn'/>
            <label className="SimilarHash-schema-label">test schema
              <input className="SimilarHash-schema-toggle"
                     type="checkbox"
                     checked={isTestSchema}
                     onChange={this.updateSchema}/>
            </label>
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
