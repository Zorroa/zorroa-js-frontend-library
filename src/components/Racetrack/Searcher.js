import { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { searchAssets } from '../../actions/assetsAction'

// Searcher is a singleton. It combines AssetSearches from the Racetrack
// and Folders and submits a new query to the Archivist server.
class Searcher extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    pageSize: PropTypes.number.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    selectedFolderIds: PropTypes.object,
    actions: PropTypes.object.isRequired
  }

  // Return a filter comprised of all widget filters except one
  allOtherFilters (widget) {
    const { widgets } = this.props
    let allOther = new AssetFilter()
    for (let w of widgets) {
      if (w !== widget && w.sliver && w.sliver.filter) {
        allOther.merge(w.sliver.filter)
      }
    }
    return allOther
  }

  // The Searcher does not render any JSX, and is purely reactive.
  // Each query returns the assets and aggs for all search widgets.
  // The AsseSearch contains search and folders in the main query,
  // and a post-filter for all the racetrack facets. Aggs for each
  // facet are placed in a filter-bucket with the allOtherFilter so
  // they show the results that do not include their own filter.
  // Note that post-filter is less efficient than a standard filter.
  render () {
    const { widgets, actions, selectedFolderIds, query, pageSize } = this.props
    let assetSearch = new AssetSearch()
    let postFilter = new AssetFilter()
    for (let widget of widgets) {
      if (!widget || !widget.sliver) {
        continue
      }
      let sliver = widget.sliver
      if (sliver.aggs) {
        const allOthers = this.allOtherFilters(widget)
        let aggs = { [widget.id]: { filter: allOthers, aggs: sliver.aggs } }
        sliver = new AssetSearch({ aggs })
      }
      postFilter.merge(widget.sliver.filter)
      assetSearch.merge(sliver)
    }

    assetSearch.postFilter = postFilter

    if (selectedFolderIds && selectedFolderIds.size) {
      const filter = new AssetFilter({links: {folder: [...selectedFolderIds]}})
      assetSearch.merge(new AssetSearch({filter}))
    }

    // Do not send the query unless it is different than the last returned query
    if (!query || !assetSearch.equals(query)) {
      assetSearch.size = pageSize
      actions.searchAssets(assetSearch)
    }

    return null   // Just reacting to new slivers
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ searchAssets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  pageSize: state.assets.pageSize,
  widgets: state.racetrack.widgets,
  selectedFolderIds: state.folders.selectedFolderIds
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searcher)
