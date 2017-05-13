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

const SCHEMA = 'Similarity'
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
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    widgets: PropTypes.arrayOf(PropTypes.object),
    origin: PropTypes.string,
    actions: PropTypes.object.isRequired,

    // input props
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  state = {
    hashTypes: null,
    hashName: '',
    similarity: DEFAULT_WEIGHT,
    selectedAssetId: ''
  }

  adjustTimout = null

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
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
    for (let s in fields.string) {
      const fieldParts = fields.string[s].split('.')
      if (fieldParts.length >= 3 && fieldParts[0] === SCHEMA) {
        hashTypes[fieldParts[1]] = fieldParts[2]
      }
    }
    return this.setStatePromise({ hashTypes })
  }

  componentWillReceiveProps = (nextProps) => {
    // initialize hashTypes first time through -- or maybe (TODO) later as well
    if (!this.state.hashTypes) this.updateHashTypes(nextProps)
    const assetIds = nextProps.similar && nextProps.similar.assetIds
    assetIds && assetIds.forEach(id => {
      if (!similarityCache.has(id)) similarityCache.set(id, DEFAULT_WEIGHT)
    })
    const hashName = nextProps.similar.field && nextProps.similar.field.split('.')[1]
    this.setState({ hashName })
  }

  removeFilter = () => {
    this.props.actions.sortAssets()
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  hashField = (name) => (name ? `${SCHEMA}.${name}.${this.state.hashTypes[name]}` : null)

  values = (assetIds, field) => {
    const { assets } = this.props
    const values = []
    assetIds.forEach(id => {
      const asset = assets.find(a => a.id === id)
      if (asset) {
        const hash = asset.value(field)
        if (hash) values.push(hash)
      }
    })
    return values
  }

  selectedValues = () => {
    const { hashName } = this.state
    return this.values(this.props.selectedAssetIds, this.hashField(hashName))
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

  snapSelected = () => {
    const values = this.selectedValues()
    const assetIds = [...this.props.selectedAssetIds]
    const similar = { values, assetIds, weights: weights(assetIds) }
    this.props.actions.similar(similar)
    console.log('Sort by similar: ' + JSON.stringify(similar))
  }

  renderThumb (id) {
    const { selectedAssetId } = this.state
    const dim = { width: 160, height: 120 }
    const asset = new Asset({id, document: {}})
    const url = asset.closestProxyURL(this.props.origin, dim.width, dim.height)
    return (
      <div className={classnames('SimilarHash-thumb', {selected: id === selectedAssetId})} key={id}
           style={{backgroundImage: `url(${url})`}}
           onClick={_ => this.selectAsset(id)}/>
    )
  }

  render () {
    const { isIconified, similar, selectedAssetIds } = this.props
    const { hashName, similarity, selectedAssetId } = this.state
    const adjustable = similar && similar.assetIds && similar.assetIds.findIndex(id => (id === selectedAssetId)) >= 0
    const disabled = !selectedAssetIds || !selectedAssetIds.size ||
        !hashName || !hashName.length ||
        !SimilarHash.canSortSimilar(selectedAssetIds, similar.field,
          this.selectedValues(), similar.values)
    return (
      <Widget className="SimilarHash"
              title={SimilarHashWidgetInfo.title}
              field={hashName}
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
          <div onClick={!disabled && this.snapSelected}
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
    assets: state.assets.all,
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
