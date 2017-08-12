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
import ImportSet from './ImportSet'
import Multipage from './Multipage'
import { createFacetWidget, createMapWidget, createColorWidget,
  createDateRangeWidget, createRangeWidget, createSimilarityWidget,
  createFiletypeWidget, createExistsWidget, createSearchWidget,
  createCollectionsWidget, createSortOrderWidget,
  createMultipageWidget, createImportSetWidget
} from '../../models/Widget'

// Pick colors from the style guide
// https://projects.invisionapp.com/d/main#/console/8609824/184395417/preview

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Search',
  description: 'Fuzzy text search on keywords or specific fields',
  create: createSearchWidget,
  fieldTypes: [ 'string', 'keywords-auto' ],
  color: '#77804d'
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>,
  create: createFacetWidget,
  fieldTypes: [ 'string', 'keywords-auto', 'long', 'double', 'integer', 'date', 'boolean' ],
  color: '#824196'
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <Map/>,
  create: createMapWidget,
  fieldTypes: [ 'point' ],
  color: '#744E19'
}

export const ColorWidgetInfo = {
  type: 'COLOR',
  icon: 'icon-eyedropper',
  title: 'Colors',
  description: 'Search by color',
  fieldTypes: [ 'nested' ],
  element: <Color/>,
  create: createColorWidget,
  color: '#EE7F29'
}

export const ExistsWidgetInfo = {
  type: 'EXISTS',
  icon: 'custom-icon-exists',
  title: 'Exists',
  description: 'Match assets with specific fields that exist or are missing',
  element: <Exists/>,
  create: createExistsWidget,
  fieldTypes: null,
  color: '#579760'
}

export const RangeWidgetInfo = {
  type: 'RANGE',
  icon: 'icon-equalizer2',
  title: 'Range',
  description: 'Match a range of a specific (numeric) field',
  element: <Range/>,
  create: createRangeWidget,
  fieldTypes: [ 'long', 'integer', 'double' ],
  color: '#D63D41'
}

export const FiletypeWidgetInfo = {
  type: 'FILETYPE',
  icon: 'icon-file-empty',
  title: 'File Type',
  description: 'Select by file format',
  element: <Filetype/>,
  create: createFiletypeWidget,
  fieldTypes: [],
  color: '#A672B6'
}

export const DateRangeWidgetInfo = {
  type: 'DATERANGE',
  icon: 'icon-calendar',
  title: 'Dates',
  description: 'Match a range of a date field',
  element: <DateRange/>,
  create: createDateRangeWidget,
  fieldTypes: [ 'date' ],
  color: '#387CA3'
}

export const SimilarHashWidgetInfo = {
  type: 'SIMILARHASH',
  icon: 'icon-similarity',
  title: 'Similar',
  description: 'Search for images based on similarity',
  element: <SimilarHash/>,
  create: createSimilarityWidget,
  fieldTypes: [],
  fieldRegex: /^similarity\..+/i,
  color: '#39897E'
}

export const CollectionsWidgetInfo = {
  type: 'COLLECTIONS',
  icon: 'icon-folder-subfolders',
  title: 'Collections',
  description: 'Search within a folder',
  element: <Collections/>,
  create: createCollectionsWidget,
  fieldTypes: [],
  color: '#73B61C'
}

export const SortOrderWidgetInfo = {
  type: 'SORTORDER',
  icon: 'icon-sort',
  title: 'Sort Order',
  description: 'Sort matching assets',
  element: <SortOrder/>,
  create: createSortOrderWidget,
  fieldTypes: [],
  color: '#DCBA22'
}

export const ImportSetWidgetInfo = {
  type: 'IMPORTSET',
  icon: 'icon-import2',
  title: 'Import',
  description: 'Filter by import',
  element: <ImportSet/>,
  create: createImportSetWidget,
  fieldTypes: [],
  color: '#744E19'
}

export const MultipageWidgetInfo = {
  type: 'MULTIPAGE',
  icon: 'icon-stack-empty',
  title: 'Multipage',
  description: 'Restrict to a single document',
  element: <Multipage/>,
  create: createMultipageWidget,
  fieldTypes: [],
  color: '#579760'
}
