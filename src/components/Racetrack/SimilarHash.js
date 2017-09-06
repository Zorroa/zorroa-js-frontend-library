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

export function weights (ofsIds) {
  return ofsIds.map(id => similarityCache.has(id) ? parseFloat(similarityCache.get(id)) : DEFAULT_WEIGHT)
}

class SimilarHash extends Component {
  static propTypes = {
    // state props
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ofsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    minScore: this.props.similar.minScore || 75
  }

  adjustTimout = null

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps = (nextProps) => {
    // initialize hashTypes first time through -- or maybe (TODO) later as well
    const ofsIds = nextProps.similar.ofsIds
    ofsIds && ofsIds.forEach(id => {
      if (!similarityCache.has(id)) similarityCache.set(id, DEFAULT_WEIGHT)
    })
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
      weights: weights(this.props.similar.ofsIds),
      minScore: this.state.minScore
    }
    this.props.actions.similar(similar)
  }

  selectedSimilar = () => {
    const ofsIds = [...this.props.similar.ofsIds]
    const values = [...this.props.similar.values]
    for (var i = 0; i < this.props.similarAssets.length; ++i) {
      const asset = this.props.similarAssets[i]
      const ofsId = asset.closestProxy(256, 256).id
      const exists = ofsIds.findIndex(id => (id === ofsId)) >= 0
      if (!exists) {
        ofsIds.push(ofsId)
        values.push(asset.rawValue(this.props.similar.field))
      }
    }
    return { values, ofsIds, weights: weights(ofsIds) }
  }

  addSelected = () => {
    const similar = this.selectedSimilar()
    this.props.actions.similar(similar)
  }

  removeOfsId = (id) => {
    const ofsIds = [...this.props.similar.ofsIds]
    const index = ofsIds.findIndex(i => i === id)
    if (index >= 0) {
      ofsIds.splice(index, 1)
      const values = [...this.props.similar.values]
      values.splice(index, 1)
      const similar = { values, ofsIds, weights: weights(ofsIds) }
      this.props.actions.similar(similar)
    }
  }

  renderThumb (id) {
    const { origin } = this.props
    const url = Asset.ofsURL(id, origin)
    const width = 120
    const height = 90
    const style = { backgroundImage: `url(${url})`, minWidth: width, minHeight: height }
    return (
      <div className="SimilarHash-thumb" key={id} style={style}>
        <div className="SimilarHash-thumb-cancel icon-cancel-circle" onClick={_ => this.removeOfsId(id)}/>
        <div className={classnames('SimilarHash-thumb-thumbs-up', 'icon-thumbs-up', {selected: similarityCache.get(id) > 0})}
             onClick={_ => this.changeSimilarity(id, 1)}/>
        <div className={classnames('SimilarHash-thumb-thumbs-down', 'icon-thumbs-up', {selected: similarityCache.get(id) < 0})}
             onClick={_ => this.changeSimilarity(id, -0.2)}/>
      </div>
    )
  }

  render () {
    const { id, floatBody, isOpen, onOpen, isIconified, similar } = this.props
    const { minScore } = this.state
    const adjustable = similar && similar.ofsIds
    const selectedSimilar = this.selectedSimilar()
    const disabled = !selectedSimilar.values || !selectedSimilar.values.length || selectedSimilar.values.length > 10 ||
        !similar.field || !similar.field.length ||
        equalSets(new Set([...similar.values]), new Set([...selectedSimilar.values]))
    const field = similar && similar.field && similar.field.replace(/^similarity\./, '').replace(/^Similarity\./, '').replace(/\.raw$/, '')
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
            { similar.ofsIds.map(id => this.renderThumb(id)) }
            { !similar.ofsIds.length && (
              <div className="SimilarHash-carousel-empty">
                <div className="SimilarHash-carousel-empty-icon icon-emptybox"/>
                <div className="SimilarHash-carousel-empty-label">
                  No Similar Items
                </div>
              </div>
            ) }
          </div>
          <input className="SimilarHash-minscore-input"
                 disabled={!adjustable}
                 value={minScore} onChange={this.changeMinScore}/>
          <div className="SimilarHash-slider">
            <div className="SimilarHash-slider-icon icon-dissimilar"/>
            <input className="SimilarHash-slider-input" type="range"
                   disabled={!adjustable}
                   min="50" max="100" step="0.1" list="similarity_ticks"
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
