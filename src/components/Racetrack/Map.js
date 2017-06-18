import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactMapboxGl, { Layer, Feature, GeoJSONLayer } from 'react-mapbox-gl'
import Geohash from 'latlon-geohash'

import geoJSON from './OGA_Licences_WGS84.geojson'

import Widget from './Widget'
import { createMapWidget } from '../../models/Widget'
import Asset from '../../models/Asset'
import { MapWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { unCamelCase } from '../../services/jsUtil'

const accessToken = 'pk.eyJ1IjoiZGFud2V4bGVyIiwiYSI6IldaWnNGM28ifQ.e18uSb539LjXseysIC7KSw'
// const mapboxStyle = 'mapbox://styles/mapbox/streets-v8'
const mapboxStyle = 'mapbox://styles/mapbox/light-v9'

class Map extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    aggs: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object)
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
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (props) {
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
    }
  }

  modifySliver (locationField, searchField, term) {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const widget = createMapWidget(locationField, 'point', term, isEnabled, isPinned)
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  onMove = (map, event) => {
    this.center = map.getCenter()
    this.bounds = map.getBounds()
  }

  onZoom = (map, event) => {
    this.zoom = map.getZoom()
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

  aggBuckets () {
    const { id, aggs } = this.props
    return aggs && (id in aggs) && aggs[id].map.buckets
  }

  render () {
    const { id, floatBody, isOpen, onOpen, isIconified, assets, selectedAssetIds } = this.props
    const { locationField, searchField, term } = this.state
    const field = Asset.lastNamespace(unCamelCase(searchField || locationField || '<Select Fields>'))
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
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              icon={MapWidgetInfo.icon}
              field={field}
              backgroundColor={MapWidgetInfo.color}
              isIconified={isIconified}>
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
    actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
  })
)(Map)
