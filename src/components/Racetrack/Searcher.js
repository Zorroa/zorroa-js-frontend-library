import { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import { searchAssets } from '../../actions/assetsAction'

// Searcher is a singleton. It combines AssetSearches from the Racetrack
// and Folders and submits a new query to the Archivist server.
class Searcher extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    actions: PropTypes.object.isRequired
  }

  render () {
    const { widgets, actions, query } = this.props
    let assetSearch = new AssetSearch()
    for (let widget of widgets) {
      assetSearch.merge(widget.sliver)
    }

    // Do not send the query unless it is different than the last returned query
    if (!query || !assetSearch.equals(query)) {
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
  widgets: state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searcher)
