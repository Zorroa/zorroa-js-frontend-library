import React from 'react'
import Facet from './Facet'
import Map from './Map'
import Color from './Color'
import Exists from './Exists'
import Range from './Range'
import Filetype from './Filetype'
import DateRange from './DateRange'
import SimilarHash from './SimilarHash'
import Collections from './Collections'
import SortOrder from './SortOrder'
import { createFacetWidget, createMapWidget, createColorWidget,
  createDateRangeWidget, createRangeWidget, createSimilarityWidget,
  createFiletypeWidget, createExistsWidget, createSearchWidget,
  createCollectionsWidget, createSortOrderWidget
} from '../../models/Widget'

// Pick colors from the style guide
// https://projects.invisionapp.com/d/main#/console/8609824/184395417/preview

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Search',
  description: 'Fuzzy text search on keywords or specific fields',
  create: createSearchWidget,
  fieldTypes: [ 'string' ],
  color: '#77804d'
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>,
  create: createFacetWidget,
  fieldTypes: [ 'string', 'long', 'double', 'integer', 'date', 'boolean' ],
  color: '#786974'
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <Map/>,
  create: createMapWidget,
  fieldTypes: [ 'point' ],
  color: '#7b5f52'
}

export const ColorWidgetInfo = {
  type: 'COLOR',
  icon: 'icon-eyedropper',
  title: 'Color Search',
  description: 'Search by color',
  fieldTypes: [ 'nested' ],
  element: <Color/>,
  create: createColorWidget,
  color: '#7d6358'
}

export const ExistsWidgetInfo = {
  type: 'EXISTS',
  icon: 'custom-icon-exists',
  title: 'Exists',
  description: 'Match assets with specific fields that exist or are missing',
  element: <Exists/>,
  create: createExistsWidget,
  fieldTypes: null,
  color: '#5a7a7e'
}

export const RangeWidgetInfo = {
  type: 'RANGE',
  icon: 'icon-equalizer2',
  title: 'Range',
  description: 'Match a range of a specific (numeric) field',
  element: <Range/>,
  create: createRangeWidget,
  fieldTypes: [ 'long', 'integer', 'double' ],
  color: '#5a7a7e'
}

export const FiletypeWidgetInfo = {
  type: 'FILETYPE',
  icon: 'icon-file-empty',
  title: 'File Type',
  description: 'Select by file format',
  element: <Filetype/>,
  create: createFiletypeWidget,
  fieldTypes: [],
  color: '#7b5f52'
}

export const DateRangeWidgetInfo = {
  type: 'DATERANGE',
  icon: 'icon-calendar',
  title: 'Dates',
  description: 'Match a range of a date field',
  element: <DateRange/>,
  create: createDateRangeWidget,
  fieldTypes: [ 'date' ],
  color: '#5a7a7e'
}

export const SimilarHashWidgetInfo = {
  type: 'SIMILARHASH',
  icon: 'icon-similarity',
  title: 'Similar',
  description: 'Search for images based on similarity',
  element: <SimilarHash/>,
  create: createSimilarityWidget,
  fieldTypes: [],
  fieldRegex: /^Similarity\..+/,
  color: '#77804d'
}

export const CollectionsWidgetInfo = {
  type: 'COLLECTIONS',
  icon: 'icon-folder-subfolders',
  title: 'Collections',
  description: 'Search within a folder',
  element: <Collections/>,
  create: createCollectionsWidget,
  fieldTypes: [],
  color: '#77804d'
}

export const SortOrderWidgetInfo = {
  type: 'SORTORDER',
  icon: 'icon-sort',
  title: 'Sort Order',
  description: 'Sort matching assets',
  element: <SortOrder/>,
  create: createSortOrderWidget,
  fieldTypes: [],
  color: '#5a7a7e'
}
