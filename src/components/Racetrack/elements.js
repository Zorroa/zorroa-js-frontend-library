import React from 'react'

import Facet from './Facet'
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
import * as WidgetInfo from './WidgetInfo'

export default {
  [WidgetInfo.FacetWidgetInfo.type]: <Facet />,
  [WidgetInfo.ColorWidgetInfo.type]: <Color />,
  [WidgetInfo.ExistsWidgetInfo.type]: <Exists />,
  [WidgetInfo.RangeWidgetInfo.type]: <Range />,
  [WidgetInfo.FiletypeWidgetInfo.type]: <Filetype />,
  [WidgetInfo.DateRangeWidgetInfo.type]: <DateRange />,
  [WidgetInfo.SimilarHashWidgetInfo.type]: <SimilarHash />,
  [WidgetInfo.CollectionsWidgetInfo.type]: <Collections />,
  [WidgetInfo.SortOrderWidgetInfo.type]: <SortOrder />,
  [WidgetInfo.ImportSetWidgetInfo.type]: <ImportSet />,
  [WidgetInfo.MultipageWidgetInfo.type]: <Multipage />,
}
