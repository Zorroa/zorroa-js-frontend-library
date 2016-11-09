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

  render () {
    const { widgets, actions, selectedFolderIds, query, pageSize } = this.props
    let assetSearch = new AssetSearch()
    for (let widget of widgets) {
      assetSearch.merge(widget.sliver)
    }

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
