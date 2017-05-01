import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import Slider from 'react-slick'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { removeRacetrackWidgetIds, similar } from '../../actions/racetrackAction'
import Widget from './Widget'
import Asset from '../../models/Asset'
import Thumb from '../Thumb'

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
    hashName: ''
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

  renderThumb (id) {
    const dim = { width: 160, height: 120 }
    const asset = new Asset({id, document: {}})
    const url = asset.closestProxyURL(this.props.origin, dim.width, dim.height)
    const backgroundColor = '#888'
    const page = { url, backgroundColor }
    return (
      <div className="SimilarHash-thumb" key={id}>
        <Thumb dim={dim} pages={[page]} onClick={e => this.selectAssetId(id)} onDoubleClick={e => {}}/>
      </div>
    )
  }

  render () {
    const { isIconified, similar } = this.props
    const { hashName } = this.state
    var settings = {
      // accessibility: true,
      // arrows: false,
      // centerMode: true,
      // draggable: true,
      // focusOnSelect: true,
      infinite: true,
      speed: 500,
      slidesToShow: Math.min(3, similar.ids.length),
      slidesToScroll: 1,
      // vertical: false,
      // afterChange: this.changeSlide
    };
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
          <Slider {...settings}>
            { similar.ids.map(id => this.renderThumb(id)) }
          </Slider>
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
