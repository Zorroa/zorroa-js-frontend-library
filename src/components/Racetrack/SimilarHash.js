import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import LRUCache from 'lru-cache'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { similar } from '../../actions/racetrackAction'
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
      assetIds: PropTypes.arrayOf(PropTypes.string).isRequired,
      minScore: PropTypes.number
    }).isRequired,
    similarAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    origin: PropTypes.string,
    actions: PropTypes.object.isRequired,

    // input props
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired
  }

  state = {
    minScore: this.props.similar.minScore
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

  changeMinScore = (event) => {
    this.setState({ minScore: event.target.value })
    if (this.adjustTimout) clearTimeout(this.adjustTimout)
    this.adjustTimout = setTimeout(this.adjustSimilarity, 500)
  }

  changeSimilarity = (id, weight) => {
    similarityCache.set(id, weight)
    if (this.adjustTimout) clearTimeout(this.adjustTimout)
    this.adjustTimout = setTimeout(this.adjustSimilarity, 500)
  }

  adjustSimilarity = () => {
    const similar = {
      ...this.props.similar,
      weights: weights(this.props.similar.assetIds),
      minScore: this.state.minScore
    }
    this.props.actions.similar(similar)
  }

  addSelected = () => {
    const assetIds = this.props.similarAssets.map(asset => asset.id)
    const values = this.selectedValues()
    const similar = { values, assetIds, weights: weights(assetIds) }
    this.props.actions.similar(similar)
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
    }
  }

  renderThumb (id) {
    const { similarAssets } = this.props
    const asset = similarAssets.find(asset => asset.id === id)
    let style
    if (asset) {
      const height = 120
      const aspect = asset.aspect() || asset.proxyAspect() || 1
      const width = aspect * height
      const url = asset.closestProxyURL(this.props.origin, width, height)
      style = { backgroundImage: `url(${url})`, minWidth: width, minHeight: height }
    }
    return (
      <div className="SimilarHash-thumb" key={id} style={style}>
        <div className="SimilarHash-thumb-cancel icon-cancel-circle" onClick={_ => this.removeAssetId(id)}/>
        <div className={classnames('SimilarHash-thumb-thumbs-up', 'icon-thumbs-up', {selected: similarityCache.get(id) > 0})}
             onClick={_ => this.changeSimilarity(id, 1)}/>
        <div className={classnames('SimilarHash-thumb-thumbs-down', 'icon-thumbs-up', {selected: similarityCache.get(id) < 0})}
             onClick={_ => this.changeSimilarity(id, -0.2)}/>
      </div>
    )
  }

  render () {
    const { id, floatBody, isOpen, onOpen, isIconified, similar, selectedAssetIds } = this.props
    const { minScore } = this.state
    const adjustable = similar && similar.assetIds
    const disabled = !selectedAssetIds || !selectedAssetIds.size ||
        (similar.values && similar.values.length >= 10) ||
        !similar.field || !similar.field.length ||
        !SimilarHash.canSortSimilar(selectedAssetIds, similar.field,
          this.selectedValues(), similar.values)
    const field = similar.field.replace(/^similarity\./, '').replace(/^Similarity\./, '').replace(/\.raw$/, '')
    return (
      <Widget className="SimilarHash"
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={SimilarHashWidgetInfo.title}
              field={field}
              backgroundColor={SimilarHashWidgetInfo.color}
              isIconified={isIconified}
              icon={SimilarHashWidgetInfo.icon}>
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
                   min="60" max="90" step="0.1" list="similarity_ticks"
                   value={minScore} onChange={this.changeMinScore}/>
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
    origin: state.auth.origin
  }), dispatch => ({
    actions: bindActionCreators({
      similar
    }, dispatch)
  })
)(SimilarHash)
