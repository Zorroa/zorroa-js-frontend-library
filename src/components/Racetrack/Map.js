import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl'
import DisplayOptions from '../DisplayOptions'

import Widget from './Widget'
import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { MAP_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { unCamelCase } from '../../services/jsUtil'

const accessToken = 'pk.eyJ1IjoiZGFud2V4bGVyIiwiYSI6IldaWnNGM28ifQ.e18uSb539LjXseysIC7KSw'
const mapboxStyle = 'mapbox://styles/mapbox/streets-v8'

class Map extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
  }

  state = {
    locationField: 'petrol.location.point',
    searchField: 'petrol.WellName',
    term: undefined,
    showDisplayOptions: false
  }

  componentWillMount () {
    this.setState({ showDisplayOptions: true })
  }

  modifySliver (term) {
    const { searchField } = this.state
    const type = MAP_WIDGET
    let sliver = new AssetSearch()
    if (term && term.length) {
      sliver.filter = new AssetFilter({terms: {[searchField + '.raw']: [term]}})
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  selectField (event) {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  updateDisplayOptions (event, state) {
    console.log('Update map fields:\n' + JSON.stringify(state.checkedNamespaces))
    const locationField = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    this.setState({ ...this.state, locationField })
    this.modifySliver(this.state.term)
  }

  dismissDisplayOptions () {
    this.setState({ showDisplayOptions: false })
  }

  selectAsset (asset) {
    const term = asset.value(this.state.searchField)
    this.setState({ ...this.state, term })
    console.log('Select marker for asset ' + asset.id + ' with ' + term)
    if (term) {
      this.modifySliver(term)
    }
  }

  removeFilter () {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  render () {
    const { isIconified, assets } = this.props
    const { locationField } = this.state
    const title = Asset.lastNamespace(unCamelCase(this.state.field))
    const locationAssets = assets.filter(asset => (asset.value(locationField)))
    const layoutProperties = {
      'symbol-spacing': 50,
      'icon-allow-overlap': true,
      'icon-size': 0.7,
      'icon-image': 'marker-11'
    }
    return (
      <Widget className="Map"
              icon="icon-location"
              header={(
                <div className="Map-header flexRow flexJustifySpaceBetween fullWidth">
                  <span>Map: {title}</span>
                  <div onClick={this.selectField.bind(this)} className="icon-cog"></div>
                </div>
              )}
              isIconified={isIconified}
              onClose={this.removeFilter.bind(this)}>
        { this.state.showDisplayOptions && (
          <DisplayOptions selectedFields={[]}
                          title="Facet Fields"
                          singleSelection={true}
                          fieldTypes={['point']}
                          onUpdate={this.updateDisplayOptions.bind(this)}
                          onDismiss={this.dismissDisplayOptions.bind(this)}/>
        )}
        <ReactMapboxGl containerStyle={{height: '300px'}}
                       style={mapboxStyle} zoom={[0]}
                       accessToken={accessToken} >
          { locationAssets && (
            <Layer type="symbol" id="marker" layout={layoutProperties}>
              { locationAssets.map(asset => {
                const location = asset.value(locationField)
                const coords = location && JSON.parse(location)
                return (
                  <Feature key={asset.id}
                           onClick={this.selectAsset.bind(this, asset)}
                           coordinates={coords}/>
                )
              })}
            </Layer>
          )}
        </ReactMapboxGl>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    assets: state.assets.all
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Map)
