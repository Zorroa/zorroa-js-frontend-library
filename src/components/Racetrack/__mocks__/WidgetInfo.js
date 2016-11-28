import React from 'react'

// Mock out the react components for each widget to avoid errors during testing.
// Mapbox-gl hits: TypeError: window.URL.createObjectURL is not a function
// Because createObjectURL is not mocked in the JSDom tools.
// Removing just <Map/> below fixes this, but results in null-element warnings.
// Removing all the React elements in these constants fixes all test warnings.

export const SimpleSearchWidgetInfo = {
  type: 'SIMPLE_SEARCH',
  icon: 'icon-search',
  title: 'Simple Search',
  description: 'Fuzzy text search on keywords or specific fields',
  element: <div/> /* <SimpleSearch/> */
}

export const FacetWidgetInfo = {
  type: 'FACET',
  icon: 'icon-bar-graph',
  title: 'Facet: Keyword',
  description: 'Match keywords and specific values for specific fields',
  element: <div/> /* <Facet/> */
}

export const MapWidgetInfo = {
  type: 'MAP',
  icon: 'icon-location',
  title: 'Map: Location',
  description: 'Map GPS locations on a map and select to search for matching fields',
  element: <div/> /* <Map/> */
}
