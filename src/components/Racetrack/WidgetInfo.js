import React from 'react'
import SimpleSearch from './SimpleSearch'
import Facet from './Facet'
import Map from './Map'
import Color from './Color'
import Exists from './Exists'
import Range from './Range'
import Filetype from './Filetype'
import DateRange from './DateRange'
import SimilarHash from './SimilarHash'

// Pick colors from the style guide
// https://projects.invisionapp.com/d/main#/console/8609824/184395417/preview

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Simple Search',
  description: 'Fuzzy text search on keywords or specific fields',
  element: <SimpleSearch/>,
  color: '#73b61c' // $zorroa-sickly-green
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet: Keyword',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>,
  color: '#a11d77' // zorroa-darkish-purple
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
  color: '#fc6c2c' // $zorroa-orangish
}

export const ExistsWidgetInfo = {
  type: 'EXISTS',
  icon: 'icon-map',
  title: 'Exists',
  description: 'Match assets with specific fields that exist or are missing',
  element: <Exists/>,
  color: '#a11e77' // $zorroa-darkish-purple
}

export const RangeWidgetInfo = {
  type: 'RANGE',
  icon: 'icon-equalizer2',
  title: 'Range',
  description: 'Match a range of a specific (numeric) field',
  element: <Range/>,
  color: '#1875d1' // $zorroa-water-blue
}

export const FiletypeWidgetInfo = {
  type: 'FILETYPE',
  icon: 'icon-file-empty',
  title: 'File Type',
  description: 'Select by file format',
  element: <Filetype/>,
  color: '#ef4487'
}

export const DateRangeWidgetInfo = {
  type: 'DATERANGE',
  icon: 'icon-calendar',
  title: 'Date Range',
  description: 'Match a range of a date field',
  element: <DateRange/>,
  color: '#1875d1' // $zorroa-water-blue
}

export const SimilarHashWidgetInfo = {
  type: 'SIMILARHASH',
  icon: 'icon-pictures',
  title: 'Similar Hash',
  description: 'Match images with similar hash values',
  element: <SimilarHash/>,
  color: '#fc6c2c' // $zorroa-orangish
}
