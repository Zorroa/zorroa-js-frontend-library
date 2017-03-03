import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { SimilarHashWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'

const HASH_TYPES = [
  'combined',
  'hhash',
  'hsv',
  'hsvHash',
  'perceptiveHash',
  'perceptual16',
  'phash',
  'phashSimple',
  'simplePerceptiveHash',
  'simplePerceptual16',
  'valueHash',
  'wavelet32',
  'waveletHash',
  'whash',
  'whashSimple'
]

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
    hashTypes: HASH_TYPES,
    hashType: '',
    hashVal: '',
    minScore: 4,
    maxScore: 16,
    selectedAsset: null
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!this.state.isEnabled) return

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
    let maxCount = 0
    // let minCount = Number.MAX_SAFE_INTEGER
    // Extract the buckets for this widget from the global query using id
    // const buckets = this.aggBuckets(terms)
    // buckets.forEach(bucket => {
    //   maxCount = Math.max(maxCount, bucket.doc_count)
    //   minCount = Math.min(minCount, bucket.doc_count)
    // })
    // this.buckets = buckets

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
                    <div className="SimilarHash-value-pct-bar" style={{width: `${100 * hashType.doc_count / maxCount}%`}} />
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
    const { isEnabled } = this.state
    return (
      <Widget className="SimilarHash"
              header={(
                <div className="SimilarHash-header">
                  <div className="SimilarHash-header-label">
                    <span className="SimilarHash-header-title">
                      {SimilarHashWidgetInfo.title}:
                    </span>
                    <span className="SimilarHash-header-field">{this.state.hashType}</span>
                  </div>
                </div>
              )}
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
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
  })
)(SimilarHash)
