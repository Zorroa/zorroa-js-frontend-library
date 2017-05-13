import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import LRUCache from 'lru-cache'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { removeRacetrackWidgetIds, similar } from '../../actions/racetrackAction'
import { sortAssets, assetsForIds } from '../../actions/assetsAction'
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
    selectedAssetId: '',
    cachedSelectedIds: null,
    cachedSelectedHashes: null
  }

  adjustTimout = null

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  updateSelectedHashes = (similarField, selectedIds) => {
    if (similarField && similarField.length && selectedIds && selectedIds.size) {
      const { cachedSelectedIds } = this.state
      if (cachedSelectedIds && equalSets(selectedIds, new Set(cachedSelectedIds))) return
      assetsForIds(selectedIds, [similarField])
        .then(assets => {
          const cachedSelectedHashes = assets.map(asset => asset.rawValue(similarField))
          const cachedSelectedIds = assets.map(asset => asset.id)
          return this.setState({cachedSelectedHashes, cachedSelectedIds})
        })
        .catch(error => {
          console.log('Cannot get similarity hashes: ' + error)
        })

      // Update state now to avoid re-sending
      this.setState({cachedSelectedIds: [...selectedIds]})
    } else {
      // Clear the cache
      const cachedSelectedIds = null
      const cachedSelectedHashes = null
      this.setState({cachedSelectedIds, cachedSelectedHashes})
    }
  }

  componentWillReceiveProps = (nextProps) => {
    // initialize hashTypes first time through -- or maybe (TODO) later as well
    const field = nextProps.similar.field
    const ids = new Set([...nextProps.similar.assetIds, ...nextProps.selectedAssetIds])
    const assetIds = [...ids]
    this.updateSelectedHashes(field, ids)
    assetIds && assetIds.forEach(id => {
      if (!similarityCache.has(id)) similarityCache.set(id, DEFAULT_WEIGHT)
    })
  }

  removeFilter = () => {
    this.props.actions.sortAssets()
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectedValues = () => {
    return this.state.cachedSelectedHashes
  }

  static canSortSimilar = (selectedAssetIds, field, values, curHashes) => {
    // Only enable similar button if selected assets have a different hash
    const similarValuesSelected = values && curHashes && equalSets(new Set([...values]), new Set([...curHashes]))
    return selectedAssetIds && selectedAssetIds.size > 0 && field && field.length > 0 && !similarValuesSelected && curHashes && curHashes.length > 0
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
    const assetIds = this.state.cachedSelectedIds
    const values = this.state.cachedSelectedHashes
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
    const { selectedAssetId } = this.state
    const dim = { width: 160, height: 120 }
    const asset = new Asset({id, document: {}})
    const url = asset.closestProxyURL(this.props.origin, dim.width, dim.height)
    return (
      <div className={classnames('SimilarHash-thumb', {selected: id === selectedAssetId})} key={id}
           style={{backgroundImage: `url(${url})`}}
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
              field={similar.field}
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
            <div className="SimilarHash-slider-icon icon-blocked"/>
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
