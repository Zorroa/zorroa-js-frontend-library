import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactMapboxGl, { Layer, Feature, GeoJSONLayer } from 'react-mapbox-gl'
import Geohash from 'latlon-geohash'

import geoJSON from './OGA_Licences_WGS84.geojson'

import Widget from './Widget'
import DisplayOptions from '../DisplayOptions'
import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { MapWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import { unCamelCase } from '../../services/jsUtil'

const accessToken = 'pk.eyJ1IjoiZGFud2V4bGVyIiwiYSI6IldaWnNGM28ifQ.e18uSb539LjXseysIC7KSw'
// const mapboxStyle = 'mapbox://styles/mapbox/streets-v8'
const mapboxStyle = 'mapbox://styles/mapbox/light-v9'

class Map extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    aggs: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    isEnabled: true,
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
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (props) {
    if (!this.state.isEnabled) return
    const { id, widgets } = props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    let locationField, searchField
    if (widget && widget.sliver) {
      if (widget.sliver.filter && widget.sliver.filter.terms) {
        const fieldRaw = widget.sliver.filter.terms.keys()[0]
        searchField = fieldRaw && fieldRaw.endsWith('.raw') ? fieldRaw.slice(0, fieldRaw.length - 4) : fieldRaw
      }
      if (widget.sliver.aggs) {
        locationField = widget.sliver.aggs.map.geohash_grid.field
      }
      this.setState({locationField, searchField})
    } else {
      this.selectLocation()
    }
  }

  toggleEnabled = () => {
    this.setState({isEnabled: !this.state.isEnabled},
      () => { this.modifySliver(this.state.term) })
  }

  modifySliver (locationField, searchField, term) {
    const { isEnabled } = this.state
    const type = MapWidgetInfo.type
    const aggs = { map: { geohash_grid: { field: locationField, precision: 7 } } }
    let sliver = new AssetSearch({aggs})
    if (term && term.length) {
      const terms = {[searchField + '.raw']: [term]}
      const bounds = { [locationField]: {top_left: 'hash', bottom_right: 'hash'} }
      sliver.filter = new AssetFilter({terms, geo_bounding_box: bounds})
      // Add this.bounds and set agg precision
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver, isEnabled})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  onMove = (map, event) => {
    this.center = map.getCenter()
    this.bounds = map.getBounds()
  }

  onZoom = (map, event) => {
    this.zoom = map.getZoom()
  }

  selectLocation = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Map Location Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={['point']}
                                 selectedFields={[this.state.locationField]}
                                 onUpdate={this.updateLocationField}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  selectSearch = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Map Search Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={null}
                                 selectedFields={[this.state.searchField]}
                                 onUpdate={this.updateSearchField}/>
    this.props.actions.showModal({body, width})
    event.stopPropagation()
  }

  updateLocationField = (event, state) => {
    const locationField = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    this.setState({locationField})
    const { searchField, term } = this.state
    this.modifySliver(locationField, searchField, term)
  }

  updateSearchField = (event, state) => {
    const searchField = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    this.setState({searchField})
    const { locationField, term } = this.state
    this.modifySliver(locationField, searchField, term)
  }

  selectAsset (asset) {
    const term = asset.value(this.state.searchField)
    this.setState({term})
    console.log('Select marker for asset ' + asset.id + ' with ' + term)
    const { locationField, searchField } = this.state
    this.modifySliver(locationField, searchField, term)
  }

  clearTerm = (event) => {
    this.setState({term: null})
    const { locationField, searchField } = this.state
    this.modifySliver(locationField, searchField, null)
  }

  removeFilter () {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  aggBuckets () {
    const { id, aggs } = this.props
    return aggs && (id in aggs) && aggs[id].map.buckets
  }

  render () {
    const { isIconified, assets, selectedAssetIds } = this.props
    const { locationField, searchField, term, isEnabled } = this.state
    const title = Asset.lastNamespace(unCamelCase(searchField || locationField || '<Select Fields>'))
    const locationAssets = assets && assets.filter(asset => (asset.value(locationField)))
    const selectedAssets = assets && selectedAssetIds && locationAssets.filter(asset => (selectedAssetIds.has(asset.id)))
    const geohashes = this.aggBuckets()
    const geohashCircleProperties = {
      'circle-color': '#82a626',
      'circle-blur': 0.5,
      'circle-opacity': 0.75,
      'circle-radius': 4
    }
    const locationCircleProperties = {
      'circle-color': '#d56f74',
      'circle-opacity': 0.5,
      'circle-blur': 0.95,
      'circle-radius': 6
    }
    const selectedCircleProperties = {
      'circle-color': '#ce2d3f',
      'circle-opacity': 1,
      'circle-blur': 0,
      'circle-radius': 7
    }
    return (
      <Widget className="Map"
              icon={MapWidgetInfo.icon}
              header={(
                <div className="Map-header">
                  <div className="Map-header-label">
                    <div className="Map-header-title">{MapWidgetInfo.title}:</div>
                    <div className="Map-header-field">{title}</div>
                  </div>
                  <div className="flexRow flexAlignItemsCenter">
                    <div onClick={this.selectSearch} className="Map-search icon-search"/>
                    <div onClick={this.selectLocation} className="Map-settings icon-cog"/>
                  </div>
                </div>
              )}
              backgroundColor={MapWidgetInfo.color}
              isEnabled={isEnabled}
              enableToggleFn={this.toggleEnabled}
              isIconified={isIconified}
              onClose={this.removeFilter.bind(this)}>
        <ReactMapboxGl containerStyle={{height: '500px'}}
                       style={mapboxStyle}
                       center={[this.center.lng, this.center.lat]}
                       zoom={[this.zoom]}
                       onMove={this.onMove} onZoom={this.onZoom}
                       accessToken={accessToken} >
          <GeoJSONLayer
            before="marker"
            data={geoJSON}
            circleLayout={{visibility: 'none'}}
            fillPaint={{
              'fill-opacity': 0.3,
              'fill-color': '#efd91b',
              'fill-antialias': true,
              'fill-outline-color': '#808080'
            }}
            lineLayout={{visibility: 'none'}}
            linePaint={{'line-opacity': 0.75}}/>
          { locationAssets && (
            <Layer type="circle" id="marker2" paint={locationCircleProperties} before="marker3">
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
          { selectedAssets && (
            <Layer type="circle" id="marker3" paint={selectedCircleProperties}>
              { selectedAssets.map(asset => {
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
          { geohashes && (
            <Layer type="circle" id="marker" paint={geohashCircleProperties} before="marker2">
              { geohashes.map(bucket => {
                const latlon = Geohash.decode(bucket.key)
                const coords = [latlon.lon, latlon.lat]
                return <Feature key={bucket.key} coordinates={coords}/>
              })}
            </Layer>
          )}
        </ReactMapboxGl>
        { term ? (
          <div onClick={this.clearTerm} className="selected-term">
            <div>{term} selected</div>
            <span className="icon-cancel-circle"/>
          </div>) : <div/>
        }
      </Widget>
    )
  }
}

export default connect(
  state => ({
    assets: state.assets.all,
    selectedAssetIds: state.assets.selectedIds,
    aggs: state.assets && state.assets.aggs,
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
  })
)(Map)
