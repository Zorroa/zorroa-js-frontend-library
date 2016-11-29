import React from 'react'
import SimpleSearch from './SimpleSearch'
import Facet from './Facet'
import Map from './Map'

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Simple Search',
  description: 'Fuzzy text search on keywords or specific fields',
  element: <SimpleSearch/>
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet: Keyword',
  description: 'Match keywords and specific values for specific fields',
  element: <Facet/>
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map: Location',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <Map/>
}
