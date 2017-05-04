import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { removeRacetrackWidgetIds, similar } from '../../actions/racetrackAction'
import Widget from './Widget'
import Asset from '../../models/Asset'

const SCHEMA = 'Similarity'

class SimilarHash extends Component {
  static propTypes = {
    // state props
    fields: PropTypes.object,                         // state.assets.fields
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ids: PropTypes.arrayOf(PropTypes.string).isRequired
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
    similarity: 0.5
  }

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
    for (var s in fields.string) {
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
    const hashName = nextProps.similar.field && nextProps.similar.field.split('.')[1]
    this.setState({ hashName })
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectHash (hashName) {
    const field = hashName ? `${SCHEMA}.${hashName}.${this.state.hashTypes[hashName]}` : null
    const { assets, selectedAssetIds } = this.props
    const values = []
    selectedAssetIds.forEach(id => {
      const asset = assets.find(a => a.id === id)
      if (asset) {
        const hash = asset.value(field)
        if (hash) values.push(hash)
      }
    })
    const similar = { field, values, ids: selectedAssetIds }
    this.props.actions.similar(similar)
  }

  renderHashes () {
    const { assets, selectedAssetIds } = this.props
    const { hashTypes } = this.state
    if (!hashTypes) return null
    const hashNames = Object.keys(hashTypes).sort((a, b) => a.localeCompare(b))
    return (
      <table>
        <tbody className="SimilarHash-table">
        { hashNames.map(hashName => {
          let disabled = !selectedAssetIds || selectedAssetIds.size === 0
          selectedAssetIds && selectedAssetIds.forEach(id => {
            const asset = assets.find(a => (a.id === id))
            const similarField = hashName ? `${SCHEMA}.${hashName}.${this.state.hashTypes[hashName]}` : null
            if (!asset || !asset.rawValue(similarField)) disabled = true
          })
          return (
            <tr className={classnames('SimilarHash-value-table-row',
              { selected: hashName === this.state.hashName, disabled })}
                key={hashName} onClick={e => this.selectHash(hashName, e)}>
              <td className="SimilarHash-value-cell">{hashName}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }

  changeSlide = (num) => {
    console.log('Set slide ' + num)
  }

  changeSimilarity = (event) => {
    this.setState({similarity: event.target.value})
  }

  renderThumb (id) {
    const dim = { width: 160, height: 120 }
    const asset = new Asset({id, document: {}})
    const url = asset.closestProxyURL(this.props.origin, dim.width, dim.height)
    return (
      <div className="SimilarHash-thumb" key={id} style={{backgroundImage: `url(${url})`}}/>
    )
  }

  render () {
    const { isIconified, similar, selectedAssetIds } = this.props
    const { hashName, similarity } = this.state
    const disabled = !selectedAssetIds || !selectedAssetIds.size
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
            { similar.ids.map(id => this.renderThumb(id)) }
            { !similar.ids.length && (
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
                   min="-1" max="1" step="0.01" list="similarity_ticks"
                   value={similarity} onChange={this.changeSimilarity}/>
            <datalist id="similarity_ticks">
              <option>-1</option>
              <option>-0.5</option>
              <option>0</option>
              <option>0.5</option>
              <option>-1</option>
            </datalist>
            <div className="SimilarHash-slider-icon icon-similarity"/>
          </div>
          <div className="SimilarHash-slider-center-triangle"/>
          <div className={classnames('SimilarHash-snap-selected', {disabled})}>
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
      similar
    }, dispatch)
  })
)(SimilarHash)
