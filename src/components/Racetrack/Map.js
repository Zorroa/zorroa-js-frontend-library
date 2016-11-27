import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl'

import Widget from './Widget'
import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { MAP_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showDisplayOptionsModal } from '../../actions/appActions'
import { unCamelCase } from '../../services/jsUtil'

const accessToken = 'pk.eyJ1IjoiZGFud2V4bGVyIiwiYSI6IldaWnNGM28ifQ.e18uSb539LjXseysIC7KSw'
const mapboxStyle = 'mapbox://styles/mapbox/streets-v8'

class Map extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(WidgetModel))
  }

  state = {
    locationField: '',
    searchField: '',
    term: undefined
  }

  // Store the map location as class properties, but not component state
  // because we don't want to update the map when these change. Instead
  // we simply need to retain the current values to use in the render JSX
  center = { lng: -122.268, lat: 37.872 }    // Zorroa Berkeley!
  zoom = 0

  componentWillMount () {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      const fieldRaw = widget.sliver.filter && widget.sliver.filter.terms.keys()[0]
      const field = fieldRaw && fieldRaw.slice(0, fieldRaw.length - 4)
      this.setState({field})
    } else {
      this.selectLocation()
    }
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

  onMove = (map, event) => {
    this.center = map.getCenter()
  }

  onZoom = (map, event) => {
    this.zoom = map.getZoom()
  }

  selectLocation = (event) => {
    const syncLabel = null
    const selectedFields = [this.state.locationField]
    const fieldTypes = ['point']
    const singleSelection = true
    this.props.actions.showDisplayOptionsModal('Map Location Field', syncLabel,
      selectedFields, singleSelection, fieldTypes, this.updateLocationField)
    event && event.stopPropagation()
  }

  selectSearch = (event) => {
    const syncLabel = null
    const selectedFields = [this.state.searchField]
    const fieldTypes = null
    const singleSelection = true
    this.props.actions.showDisplayOptionsModal('Map Search Field', syncLabel,
      selectedFields, singleSelection, fieldTypes, this.updateSearchField)
    event.stopPropagation()
  }

  updateLocationField = (event, state) => {
    const locationField = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    this.setState({locationField})
    this.modifySliver(this.state.term)
  }

  updateSearchField = (event, state) => {
    const searchField = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    this.setState({searchField})
    this.modifySliver(this.state.term)
  }

  selectAsset (asset) {
    const term = asset.value(this.state.searchField)
    this.setState({term})
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
    const { locationField, searchField } = this.state
    const title = Asset.lastNamespace(unCamelCase(searchField || locationField || '<Select Fields>'))
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
                  <div className="flexRow flexAlignItemsCenter">
                    <div onClick={this.selectSearch} className="Map-search icon-search" />
                    <div onClick={this.selectLocation} className="Map-settings icon-cog" />
                  </div>
                </div>
              )}
              isIconified={isIconified}
              onClose={this.removeFilter.bind(this)}>
        <ReactMapboxGl containerStyle={{height: '300px'}}
                       style={mapboxStyle}
                       center={[this.center.lng, this.center.lat]}
                       zoom={[this.zoom]}
                       onMove={this.onMove} onZoom={this.onZoom}
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
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showDisplayOptionsModal }, dispatch)
  })
)(Map)
