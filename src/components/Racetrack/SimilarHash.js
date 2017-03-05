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
    hashType: '',
    hashVal: '',
    minScore: 4,
    maxScore: 16,
    selectedAsset: null
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

    this.syncWithAppState(nextProps)
  }

  syncWithAppState (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      // const field = widget.sliver.aggs.similarHash.terms.field
      // if (field !== this.state.field) {
      //   const fieldIsDate = field && this.fieldTypes && this.fieldTypes[field] === 'date'
      //   this.setState({field, fieldIsDate})
      // }
      // if (widget.sliver.filter) {
      //   const terms = widget.sliver.filter.hamming.hashes
      // } else {
      //   this.setState({terms: []})
      // }
      // const order = widget.sliver.aggs.similarHash.terms.order
      // if (order) this.setState({order})
    }
  }

  toggleEnabled = () => {
    new Promise(resolve => this.setState({isEnabled: !this.state.isEnabled}, resolve))
    .then(() => { this.modifySliver() })
  }

  modifySliver = () => {
    const { hashType, hashVal, minScore } = this.state
    const { isEnabled } = this.state
    const type = SimilarHashWidgetInfo.type
    // const aggs = { similarHash: { terms: { hashType, size: 100 } } }
    // let sliver = new AssetSearch({aggs})
    let sliver = new AssetSearch()
    if (hashType && hashVal) {
      sliver.filter = new AssetFilter({
        hamming: {
          field: `ImageHash.${hashType}.raw`,
          hashes: [ hashVal ],
          minScore
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
    let maxScore = this.state.maxScore
    let selectedAsset = this.state.selectedAsset

    const { assets, selectedAssetIds } = this.props

    if (selectedAssetIds && selectedAssetIds.size) {
      const firstSelectedAssetId = selectedAssetIds.values().next().value
      if (firstSelectedAssetId) {
        selectedAsset = assets.find(asset => { return firstSelectedAssetId === asset.id })
        hashVal = selectedAsset.document.ImageHash[hashType]
        maxScore = hashVal.length
      }
    }

    new Promise(resolve => this.setState({ hashType, hashVal, maxScore, selectedAsset }, resolve))
    .then(() => this.modifySliver())
  }

  deselectHashType = (event) => {
    const hashType = ''
    const hashVal = ''
    new Promise(resolve => this.setState({ hashType, hashVal, selectedAsset: null }, resolve))
    .then(() => this.modifySliver())
  }

  // aggBuckets (terms) {
  //   const { id, aggs } = this.props
  //   let buckets = aggs && (id in aggs) ? aggs[id].similarHash.buckets : []

  //   // Add in any selected terms that are not in the search agg
  //   terms && terms.forEach(key => {
  //     const index = buckets.findIndex(bucket => (bucket.key === key))
  //     if (index < 0) {
  //       buckets.unshift({key, doc_count: 1})  // FIXME: Arbitrary doc_count
  //     }
  //   })

  //   return buckets
  // }

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
            <div onClick={this.deselectHashType} className="SimilarHash-clear-selection-cancel icon-cancel-circle"/>
          )}
        </div>
      </div>
    )
  }

  renderChart () {
    const { hashTypes } = this.state

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
                <td className="SimilarHash-value-count">--</td>
              </tr>
            )) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  updateMinScore = (event) => {
    const minScore = event.target.value
    new Promise(resolve => this.setState({ minScore }, resolve))
    .then(() => this.modifySliver())
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
                     value={this.state.minScore}
                     onChange={this.updateMinScore}
                     min="0"
                     max={`${this.state.maxScore}`} />
            </div>
            <span className="SimilarHash-thresh-val">{`${Math.round(100 * this.state.minScore / this.state.maxScore)}%`}</span>
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
