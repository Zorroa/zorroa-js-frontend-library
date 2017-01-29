import React from 'react'
import SimpleSearch from './SimpleSearch'
import Facet from './Facet'
import Map from './Map'
import Color from './Color'
import Exists from './Exists'
import Range from './Range'

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Simple Search',
  description: 'Fuzzy text search on keywords or specific fields',
  element: <SimpleSearch/>,
  color: '#74b618'
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet: Keyword',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>,
  color: '#a11d77'
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map: Location',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <Map/>,
  color: '#785549'
}

export const ColorWidgetInfo = {
  type: 'COLOR',
  icon: 'icon-eyedropper',
  title: 'Color Search',
  description: 'Search by color',
  element: <Color/>,
  color: '#fc6c2c'
}

export const ExistsWidgetInfo = {
  type: 'EXISTS',
  icon: 'custom-icon-exists', // special one-off defined in core-globals
  title: 'Exists',
  description: 'Match assets with specific fields that exist or are missing',
  element: <Exists/>,
  color: '#9062ff'
}

export const RangeWidgetInfo = {
  type: 'RANGE',
  icon: 'custom-icon-range', // special one-off defined in core-globals
  title: 'Range',
  description: 'Match a range of a specific (numeric) field',
  element: <Range/>,
  color: '#4287b1'
}
