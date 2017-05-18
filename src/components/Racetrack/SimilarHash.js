import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import LRUCache from 'lru-cache'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { removeRacetrackWidgetIds, similar } from '../../actions/racetrackAction'
import { sortAssets } from '../../actions/assetsAction'
import { equalSets } from '../../services/jsUtil'
import Widget from './Widget'
import Asset from '../../models/Asset'

const DEFAULT_WEIGHT = 1

const similarityCache = new LRUCache({ max: 1000 })

export function weights (assetIds) {
  return assetIds.map(id => similarityCache.has(id) ? parseFloat(similarityCache.get(id)) : DEFAULT_WEIGHT)
}

class SimilarHash extends Component {
  static propTypes = {
    // state props
    fields: PropTypes.object,                         // state.assets.fields
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      assetIds: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    similarAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    widgets: PropTypes.arrayOf(PropTypes.object),
    origin: PropTypes.string,
    actions: PropTypes.object.isRequired,

    // input props
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  state = {
    similarity: DEFAULT_WEIGHT,
    selectedAssetId: ''
  }

  adjustTimout = null

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps = (nextProps) => {
    // initialize hashTypes first time through -- or maybe (TODO) later as well
    const assetIds = nextProps.similar.assetIds
    assetIds && assetIds.forEach(id => {
      if (!similarityCache.has(id)) similarityCache.set(id, DEFAULT_WEIGHT)
    })

    // Select one of the assets, if none match
    let selectedAssetId = this.state.selectedAssetId
    if (!assetIds.length) {
      selectedAssetId = ''
    } else if (!selectedAssetId || !selectedAssetId.length ||
      assetIds.findIndex(id => (id === selectedAssetId)) < 0) {
      selectedAssetId = assetIds[0]
    }
    if (selectedAssetId !== this.state.selectedAssetId) this.setState({selectedAssetId})
  }

  removeFilter = () => {
    this.props.actions.sortAssets()
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectedValues = () => {
    const { similarAssets } = this.props
    if (!similarAssets) return
    return similarAssets.map(asset => asset.rawValue(this.props.similar.field))
  }

  static canSortSimilar = (selectedAssetIds, field, values, curHashes) => {
    if (!curHashes.length && selectedAssetIds.size) return true
    // Only enable similar button if selected assets have a different hash
    const similarValuesSelected = values && curHashes && equalSets(new Set([...values]), new Set([...curHashes]))
    return selectedAssetIds && selectedAssetIds.size && field && field.length && !similarValuesSelected && curHashes && curHashes.length > 0
  }

  changeSimilarity = (event) => {
    const similarity = event.target.value
    this.setState({similarity})
    similarityCache.set(this.state.selectedAssetId, similarity)
    if (this.adjustTimout) clearTimeout(this.adjustTimout)
    this.adjustTimout = setTimeout(this.adjustSimilarity, 500)
  }

  adjustSimilarity = () => {
    const similar = { ...this.props.similar, weights: weights(this.props.similar.assetIds) }
    this.props.actions.similar(similar)
    console.log('Adjust similar: ' + JSON.stringify(similar))
  }

  selectAsset = (id) => {
    this.setState({selectedAssetId: id, similarity: parseFloat(similarityCache.get(id))})
  }

  addSelected = () => {
    const assetIds = this.props.similarAssets.map(asset => asset.id)
    const values = this.selectedValues()
    const similar = { values, assetIds, weights: weights(assetIds) }
    this.props.actions.similar(similar)
    console.log('Add similar: ' + JSON.stringify(similar))
  }

  removeAssetId = (id) => {
    const assetIds = [...this.props.similar.assetIds]
    const index = assetIds.findIndex(i => i === id)
    if (index >= 0) {
      assetIds.splice(index, 1)
      const values = [...this.props.similar.values]
      values.splice(index, 1)
      const similar = { values, assetIds, weights: weights(assetIds) }
      this.props.actions.similar(similar)
      console.log('Remove similar: ' + JSON.stringify())
    }
  }

  renderThumb (id) {
    const { similarAssets } = this.props
    const { selectedAssetId } = this.state
    const asset = similarAssets.find(asset => asset.id === id)
    const height = 120
    const aspect = asset.aspect() || asset.proxyAspect() || 1
    const width = aspect * height
    const url = asset.closestProxyURL(this.props.origin, width, height)
    const style = { backgroundImage: `url(${url})`, minWidth: width, minHeight: height }
    return (
      <div className={classnames('SimilarHash-thumb', {selected: id === selectedAssetId})} key={id}
           style={style}
           onClick={_ => this.selectAsset(id)}>
        <div className="SimilarHash-thumb-cancel icon-cancel-circle" onClick={_ => this.removeAssetId(id)}/>
      </div>
    )
  }

  render () {
    const { isIconified, similar, selectedAssetIds } = this.props
    const { similarity, selectedAssetId } = this.state
    const adjustable = similar && similar.assetIds && similar.assetIds.findIndex(id => (id === selectedAssetId)) >= 0
    const disabled = !selectedAssetIds || !selectedAssetIds.size ||
        !similar.field || !similar.field.length ||
        !SimilarHash.canSortSimilar(selectedAssetIds, similar.field,
          this.selectedValues(), similar.values)
    return (
      <Widget className="SimilarHash"
              title={SimilarHashWidgetInfo.title}
              backgroundColor={SimilarHashWidgetInfo.color}
              isIconified={isIconified}
              isEnabled={true}
              icon={SimilarHashWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="SimilarHash-body">
          <div className="SimilarHash-carousel">
            { similar.assetIds.map(id => this.renderThumb(id)) }
            { !similar.assetIds.length && (
              <div className="SimilarHash-carousel-empty">
                <div className="SimilarHash-carousel-empty-icon icon-emptybox"/>
                <div className="SimilarHash-carousel-empty-label">
                  No Similar Items
                </div>
              </div>
            ) }
          </div>
          <div className="SimilarHash-slider">
            <div className="SimilarHash-slider-icon icon-dissimilar"/>
            <input className="SimilarHash-slider-input" type="range"
                   disabled={!adjustable}
                   min="-1.5" max="1.5" step="0.01" list="similarity_ticks"
                   value={similarity} onChange={this.changeSimilarity}/>
            <datalist id="similarity_ticks">
              <option>-1</option>
              <option>-0.5</option>
              <option>0</option>
              <option>0.5</option>
              <option>1</option>
            </datalist>
            <div className="SimilarHash-slider-icon icon-similarity"/>
          </div>
          <div className="SimilarHash-slider-center-triangle"/>
          <div onClick={!disabled && this.addSelected}
               className={classnames('SimilarHash-snap-selected', {disabled})}>
            Find Similar
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    fields: state.assets && state.assets.fields,
    similar: state.racetrack.similar,
    similarAssets: state.assets.similar,
    selectedAssetIds: state.assets.selectedIds,
    widgets: state.racetrack && state.racetrack.widgets,
    origin: state.auth.origin
  }), dispatch => ({
    actions: bindActionCreators({
      removeRacetrackWidgetIds,
      sortAssets,
      similar
    }, dispatch)
  })
)(SimilarHash)
