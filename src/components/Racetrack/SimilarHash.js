import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { createSimilarityWidget } from '../../models/Widget'
import { SimilarHashWidgetInfo } from './WidgetInfo'
import {
  modifyRacetrackWidget,
  similarMinScore,
} from '../../actions/racetrackAction'
import { equalSets } from '../../services/jsUtil'
import Widget from './Widget'
import Asset from '../../models/Asset'
import fieldNamespaceToName from '../../services/fieldNamespaceToName'

class SimilarHash extends Component {
  static propTypes = {
    widgets: PropTypes.arrayOf(PropTypes.object),
    selectedAssetIds: PropTypes.instanceOf(Set),
    origin: PropTypes.string,
    actions: PropTypes.object.isRequired,

    // input props
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
  }

  state = {
    minScore: 75,
    hashes: [],
  }

  adjustTimout = null

  componentWillMount() {
    // Restore saved state from widget
    const { id, widgets } = this.props
    const widget = widgets && widgets.find(widget => widget.id === id)
    if (widget && widget.state) this.setState(widget.state)
  }

  setStateProm = newState => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  changeMinScore = event => {
    const minScore = parseFloat(event.target.value)
    this.setStateProm({ minScore }).then(_ => {
      if (this.adjustTimout) clearTimeout(this.adjustTimout)
      this.adjustTimout = setTimeout(this.modifySliver, 500)
      const widget = this.props.widgets.find(
        widget => widget.id === this.props.id,
      )
      if (widget) this.props.actions.similarMinScore(widget.field, minScore)
    })
  }

  changeSimilarity = (id, weight) => {
    const hashes = [...this.state.hashes]
    const hash = hashes.find(hash => hash.hash === id)
    hash.weight = weight
    this.setStateProm({ hashes }).then(this.modifySliver)
  }

  modifySliver = () => {
    const { id, widgets } = this.props
    const { hashes, minScore } = this.state
    const index = widgets && widgets.findIndex(widget => id === widget.id)
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const widget = createSimilarityWidget(
      oldWidget.field,
      null,
      hashes,
      minScore,
      isEnabled,
      isPinned,
    )
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  addSelected = () => {
    const { selectedAssetIds } = this.props
    const hashes = [...this.state.hashes]
    selectedAssetIds.forEach(id => {
      const index = hashes.findIndex(hash => hash.hash === id)
      if (index < 0) hashes.push({ hash: id, weight: 1 })
    })
    this.setStateProm({ hashes }).then(this.modifySliver)
  }

  removeId = id => {
    const hashes = [...this.state.hashes]
    const index = hashes.findIndex(hash => hash.hash === id)
    if (index >= 0) {
      hashes.splice(index, 1)
      this.setStateProm({ hashes }).then(this.modifySliver)
    }
  }

  renderThumb(hash) {
    const id = hash.hash
    const weight = hash.weight
    const width = 120
    const height = 90
    const { origin } = this.props
    // Allow an optional ofsId in the hash for uploaded files that are not added as assets
    const url = hash.ofsId
      ? Asset.ofsURL(hash.ofsId, origin)
      : Asset._closestProxyURL(hash.hash, origin, width, height)
    const style = {
      backgroundImage: `url(${url})`,
      minWidth: width,
      minHeight: height,
    }
    return (
      <div className="SimilarHash-thumb" key={id} style={style}>
        <div
          className="SimilarHash-thumb-cancel icon-cancel-circle"
          onClick={_ => this.removeId(id)}
        />
        <div
          className={classnames(
            'SimilarHash-thumb-thumbs-up',
            'icon-thumbs-up',
            { selected: weight > 0 },
          )}
          onClick={_ => this.changeSimilarity(id, 1)}
        />
        <div
          className={classnames(
            'SimilarHash-thumb-thumbs-down',
            'icon-thumbs-up',
            { selected: weight < 0 },
          )}
          onClick={_ => this.changeSimilarity(id, -0.2)}
        />
      </div>
    )
  }

  render() {
    const {
      id,
      floatBody,
      isOpen,
      onOpen,
      isIconified,
      widgets,
      selectedAssetIds,
    } = this.props
    const { hashes, minScore } = this.state
    const adjustable = hashes.length
    const similarAssetsIds = hashes.map(hash => hash.hash)
    const disabled =
      !selectedAssetIds ||
      !selectedAssetIds.size ||
      equalSets(new Set([...similarAssetsIds]), selectedAssetIds)
    const widget = widgets && widgets.find(widget => widget.id === id)
    widget.state = this.state
    const field =
      widget && widget.field && fieldNamespaceToName(widget.field, false)

    return (
      <Widget
        className="SimilarHash"
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
            {hashes.map(hash => this.renderThumb(hash))}
            {!hashes.length && (
              <div className="SimilarHash-carousel-empty">
                <div className="SimilarHash-carousel-empty-icon icon-emptybox" />
                <div className="SimilarHash-carousel-empty-label">
                  No Similar Items
                </div>
              </div>
            )}
          </div>
          <input
            className="SimilarHash-minscore-input"
            disabled={!adjustable}
            value={minScore}
            onChange={this.changeMinScore}
          />
          <div className="SimilarHash-slider">
            <div className="SimilarHash-slider-icon icon-dissimilar" />
            <input
              className="SimilarHash-slider-input"
              type="range"
              disabled={!adjustable}
              min="50"
              max="100"
              step="0.1"
              list="similarity_ticks"
              value={minScore}
              onChange={this.changeMinScore}
            />
            <datalist id="similarity_ticks">
              <option>-1</option>
              <option>-0.5</option>
              <option>0</option>
              <option>0.5</option>
              <option>1</option>
            </datalist>
            <div className="SimilarHash-slider-icon icon-similarity" />
          </div>
          <div className="SimilarHash-slider-center-triangle" />
          <div
            onClick={!disabled && this.addSelected}
            className={classnames('SimilarHash-snap-selected', { disabled })}>
            Find Similar
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    widgets: state.racetrack && state.racetrack.widgets,
    selectedAssetIds: state.assets.selectedIds,
    origin: state.auth.origin,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        modifyRacetrackWidget,
        similarMinScore,
      },
      dispatch,
    ),
  }),
)(SimilarHash)
