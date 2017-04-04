import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { SimilarHashWidgetInfo } from './WidgetInfo'
import { removeRacetrackWidgetIds, similarField, similarValues } from '../../actions/racetrackAction'
import Widget from './Widget'
import Asset from '../../models/Asset'

const SCHEMA = 'Similarity'

class SimilarHash extends Component {
  static propTypes = {
    // state props
    fields: PropTypes.object,                         // state.assets.fields
    similarField: PropTypes.string,
    selectedAssetIds: PropTypes.instanceOf(Set),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    widgets: PropTypes.arrayOf(PropTypes.object),
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
    const hashName = nextProps.similarField && nextProps.similarField.split('.')[1]
    this.setState({ hashName })
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectHash (hashName) {
    const similarField = hashName ? `${SCHEMA}.${hashName}.${this.state.hashTypes[hashName]}` : null
    const { assets, selectedAssetIds } = this.props
    const similarValues = []
    selectedAssetIds.forEach(id => {
      const asset = assets.find(a => a.id === id)
      if (asset) {
        const hash = asset.value(similarField)
        if (hash) similarValues.push(hash)
      }
    })
    this.props.actions.similarValues(similarValues)
    this.props.actions.similarField(similarField)
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

  render () {
    const { isIconified } = this.props
    const { hashName } = this.state
    return (
      <Widget className="SimilarHash"
              title={SimilarHashWidgetInfo.title}
              field={hashName}
              backgroundColor={SimilarHashWidgetInfo.color}
              isIconified={isIconified}
              isEnabled={true}
              icon={SimilarHashWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="SimilarHash-body flexCol">
          { this.renderHashes() }
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    fields: state.assets && state.assets.fields,
    similarField: state.racetrack.similarField,
    selectedAssetIds: state.assets.selectedIds,
    assets: state.assets.all,
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({
      removeRacetrackWidgetIds,
      similarField,
      similarValues
    }, dispatch)
  })
)(SimilarHash)
