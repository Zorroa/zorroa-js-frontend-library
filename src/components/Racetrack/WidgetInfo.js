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
import { createFacetWidget, createMapWidget, createColorWidget,
  createDateRangeWidget, createRangeWidget, createSimilarityWidget,
  createFiletypeWidget, createExistsWidget, createSearchWidget } from '../../models/Widget'

// Pick colors from the style guide
// https://projects.invisionapp.com/d/main#/console/8609824/184395417/preview

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Search',
  description: 'Fuzzy text search on keywords or specific fields',
  element: <SimpleSearch/>,
  create: createSearchWidget,
  fieldTypes: [ 'string' ],
  color: '#73b61c' // $zorroa-sickly-green
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>,
  create: createFacetWidget,
  fieldTypes: [ 'string', 'long', 'double', 'integer', 'date', 'boolean' ],
  color: '#a11d77' // zorroa-darkish-purple
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <Map/>,
  create: createMapWidget,
  fieldTypes: [ 'point' ],
  color: '#785549'
}

export const ColorWidgetInfo = {
  type: 'COLOR',
  icon: 'icon-eyedropper',
  title: 'Color Search',
  description: 'Search by color',
  fieldTypes: [ 'nested' ],
  element: <Color/>,
  create: createColorWidget,
  color: '#fc6c2c' // $zorroa-orangish
}

export const ExistsWidgetInfo = {
  type: 'EXISTS',
  icon: 'custom-icon-exists',
  title: 'Exists',
  description: 'Match assets with specific fields that exist or are missing',
  element: <Exists/>,
  create: createExistsWidget,
  fieldTypes: null,
  color: '#a11e77' // $zorroa-darkish-purple
}

export const RangeWidgetInfo = {
  type: 'RANGE',
  icon: 'icon-equalizer2',
  title: 'Range',
  description: 'Match a range of a specific (numeric) field',
  element: <Range/>,
  create: createRangeWidget,
  fieldTypes: [ 'long', 'integer', 'double' ],
  color: '#1875d1' // $zorroa-water-blue
}

export const FiletypeWidgetInfo = {
  type: 'FILETYPE',
  icon: 'icon-file-empty',
  title: 'File Type',
  description: 'Select by file format',
  element: <Filetype/>,
  create: createFiletypeWidget,
  fieldTypes: [],
  color: '#ef4487'
}

export const DateRangeWidgetInfo = {
  type: 'DATERANGE',
  icon: 'icon-calendar',
  title: 'Dates',
  description: 'Match a range of a date field',
  element: <DateRange/>,
  create: createDateRangeWidget,
  fieldTypes: [ 'date' ],
  color: '#1875d1' // $zorroa-water-blue
}

export const SimilarHashWidgetInfo = {
  type: 'SIMILARHASH',
  icon: 'icon-similarity',
  title: 'Similar',
  description: 'Search for images based on similarity',
  element: <SimilarHash/>,
  create: createSimilarityWidget,
  fieldTypes: [],
  color: '#a11e77' // $zorroa-darkish-purple
}
