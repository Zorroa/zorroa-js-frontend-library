import { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetSearch from '../../models/AssetSearch'
import { searchAssets } from '../../actions/assetsAction'

// Searcher is a singleton. It combines AssetSearches from the Racetrack
// and Folders and submits a new query to the Archivist server.
class Searcher extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    slivers: PropTypes.object,
    actions: PropTypes.object.isRequired
  }

  render () {
    const { slivers, actions, query } = this.props
    let assetSearch = new AssetSearch()
    if (slivers) {
      for (let id in slivers) {
        if (!slivers.hasOwnProperty(id)) continue
        let sliver = slivers[id]
        assetSearch.merge(sliver)
      }
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
  slivers: state.slivers
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searcher)
