import { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import User from '../../models/User'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import TrashedFolder from '../../models/TrashedFolder'
import { searchAssets, getAssetFields, requiredFields } from '../../actions/assetsAction'
import { countAssetsInFolderIds } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import { MapWidgetInfo } from './WidgetInfo'

// Searcher is a singleton. It combines AssetSearches from the Racetrack
// and Folders and submits a new query to the Archivist server.
class Searcher extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    folders: PropTypes.instanceOf(Map),
    selectedFolderIds: PropTypes.object,
    modifiedFolderIds: PropTypes.instanceOf(Set),
    folderCounts: PropTypes.instanceOf(Map),
    filteredFolderCounts: PropTypes.instanceOf(Map),
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    order: PropTypes.arrayOf(PropTypes.object),
    similarField: PropTypes.string,
    similarValues: PropTypes.arrayOf(PropTypes.string),
    fieldTypes: PropTypes.object,
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    lightbarFields: PropTypes.arrayOf(PropTypes.string),
    jobs: PropTypes.object,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  state = {
    importFinished: false
  }

  componentWillMount () {
    this.pendingQueryCountIds = new Set()
    this.pendingFullCountIds = new Set()
    this.props.actions.getAssetFields()
  }

  componentWillReceiveProps (nextProps) {
    this.updateImportFinished(nextProps)
  }

  updateImportFinished (nextProps) {
    const oldJobs = this.props.jobs && Object.values(this.props.jobs).filter(job => (job.type === Job.Import))
    const newJobs = nextProps.jobs && Object.values(nextProps.jobs).filter(job => (job.type === Job.Import))
    if (oldJobs && newJobs) {
      const oldFieldCount = this.props.fieldTypes && Object.keys(this.props.fieldTypes).length
      const newFieldCount = nextProps.fieldTypes && Object.keys(nextProps.fieldTypes).length
      let importFinished = oldJobs.length !== newJobs.length || oldFieldCount !== newFieldCount
      oldJobs.forEach(oldJob => {
        if (oldJob.state === Job.Active) {
          const newJob = newJobs.find(job => job.id === oldJob.id)
          if (newJob && newJob.state === Job.Finished) {
            importFinished = true
          }
        }
      })
      this.setState({importFinished})
      if (importFinished) {
        this.props.actions.getAssetFields()
      }
    }
  }

  isCounted (folderId) {
    const {folderCounts, filteredFolderCounts} = this.props
    return folderCounts && folderCounts.has(folderId) && filteredFolderCounts && filteredFolderCounts.has(folderId)
  }

  // Return a filter comprised of all widget filters except one
  allOtherFilters (widget) {
    const { widgets } = this.props
    let allOther = new AssetFilter()
    for (let w of widgets) {
      if (w !== widget && w.isEnabled && w.sliver && w.sliver.filter && w.sliver.aggs) {
        allOther.merge(w.sliver.filter)
      }
    }
    return allOther
  }

  // Manage a cache of pending count ids for both full and query counts.
  queueFolderCounts = (ids, query) => {
    if (this.pendingQuery && query && !this.pendingQuery.equals(query)) {
      this.pendingQueryCountIds = new Set()
    }
    if (query) this.pendingQuery = new AssetSearch(query)
    if (query) {
      this.pendingQueryCountIds = new Set([...this.pendingQueryCountIds, ...ids])
    } else {
      this.pendingFullCountIds = new Set([...this.pendingFullCountIds, ...ids])
    }
    this.resetFolderCountTimer()
  }

  resetFolderCountTimer = () => {
    if (this.folderCountTimer) clearTimeout(this.folderCountTimer)
    this.folderCountTimer = null
    if (this.pendingQueryCountIds.size || this.pendingFullCountIds.size) {
      this.folderCountTimer = setTimeout(this.runFolderCount, 100)
    }
  }

  runFolderCountBatch (ids, query) {
    if (!ids.size) return
    const maxBatchSize = 50
    const countIds = [...ids].slice(0, maxBatchSize)
    this.props.actions.countAssetsInFolderIds(countIds, query)
    countIds.forEach(id => ids.delete(id))
  }

  runFolderCount = () => {
    this.runFolderCountBatch(this.pendingQueryCountIds, this.pendingQuery)
    this.runFolderCountBatch(this.pendingFullCountIds)
    this.resetFolderCountTimer()
  }

  // The Searcher does not render any JSX, and is purely reactive.
  // Each query returns the assets and aggs for all search widgets.
  // The AsseSearch contains search and folders in the main query,
  // and a post-filter for all the racetrack facets. Aggs for each
  // facet are placed in a filter-bucket with the allOtherFilter so
  // they show the results that do not include their own filter.
  // Note that post-filter is less efficient than a standard filter.
  render () {
    const {
      widgets, actions, folders, selectedFolderIds, query,
      modifiedFolderIds, trashedFolders, order,
      similarField, similarValues,
      metadataFields, lightbarFields, fieldTypes } = this.props
    if (!fieldTypes) return null
    let assetSearch = new AssetSearch({order})
    if (widgets && widgets.length) {
      let postFilter = new AssetFilter()
      for (let widget of widgets) {
        if (!widget || !widget.sliver || !widget.isEnabled) {
          continue
        }
        let sliver = widget.sliver
        if (sliver.aggs) {
          postFilter.merge(widget.sliver.filter)
          const allOthers = widget.type === MapWidgetInfo.type ? new AssetFilter() : this.allOtherFilters(widget).convertToBool()
          let aggs = {[widget.id]: {filter: allOthers, aggs: sliver.aggs}}
          sliver = new AssetSearch({aggs})
        }
        assetSearch.merge(sliver)
      }
      assetSearch.postFilter = postFilter
    }

    // Add a filter for selected folders
    if (selectedFolderIds && selectedFolderIds.size) {
      // Server does not support searching of trashed folders
      let nonTrashedFolderIds
      if (trashedFolders && trashedFolders.length) {
        nonTrashedFolderIds = []
        selectedFolderIds.forEach(id => {
          const index = trashedFolders.findIndex(trashedFolder => (trashedFolder.folderId === id))
          if (index < 0) nonTrashedFolderIds.push(id)
        })
      } else {
        nonTrashedFolderIds = [...selectedFolderIds]
      }
      if (nonTrashedFolderIds && nonTrashedFolderIds.length) {
        const filter = new AssetFilter({links: {folder: nonTrashedFolderIds}})
        assetSearch.merge(new AssetSearch({filter}))
      }
    }

    // Force similar ordering
    if (similarField && similarValues && similarValues.length) {
      const minScore = 0
      assetSearch.order = undefined
      const filter = new AssetFilter({
        hamming: {
          field: similarField,
          hashes: similarValues,
          minScore
        }
      })
      assetSearch.merge(new AssetSearch({filter}))
    }

    // Limit results to favorited fields, since we only display values
    // in those fields in the Table and Lightbar
    if (metadataFields) {
      const fields = requiredFields([...metadataFields, ...lightbarFields], fieldTypes)
      assetSearch.fields = [...fields]
    }

    // Do not send the query unless it is different than the last returned query
    // FIXME: If assetSearch.empty() filtered counts == total, but tricky to flush cache
    // FIXME: Count trashed folders once the server adds support
    const skip = new Set(['fields', 'from', 'size', 'scroll'])
    const missingField = this.inflightQuery ? this.inflightQuery.missingField(assetSearch.fields) : (!query || query.missingField(assetSearch.fields))
    const searchModified = this.inflightQuery ? !this.inflightQuery.equals(assetSearch, skip) : (!query || !assetSearch.equals(query, skip))
    if (searchModified || missingField || this.state.importFinished) {
      assetSearch.size = AssetSearch.autoPageSize
      actions.searchAssets(assetSearch, query, this.state.importFinished)
      this.inflightQuery = assetSearch
      if (query) {
        // FIXME: Disable saving search to user settings to avoid conflicts
        // actions.saveUserSettings(user, { ...userSettings, search: assetSearch })
      }
      if (folders && folders.size > 1 && assetSearch && !assetSearch.empty()) {
        // New query, get all the filtered folder counts
        this.queueFolderCounts(new Set([...folders.keys()]), assetSearch)
        if (this.state.importFinished) {
          this.queueFolderCounts(new Set([...folders.keys()]))
        }
      }
    } else if (modifiedFolderIds && modifiedFolderIds.size) {
      this.queueFolderCounts(modifiedFolderIds)
      if (assetSearch && !assetSearch.empty()) {
        this.queueFolderCounts(modifiedFolderIds, assetSearch)
      }
    }

    if (this.inflightQuery && query && this.inflightQuery.equals(query)) this.inflightQuery = null
    return null   // Just reacting to new slivers
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    searchAssets,
    getAssetFields,
    countAssetsInFolderIds,
    saveUserSettings
  }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  order: state.assets.order,
  widgets: state.racetrack.widgets,
  folders: state.folders.all,
  folderCounts: state.folders.counts,
  filteredFolderCounts: state.folders.filteredCounts,
  selectedFolderIds: state.folders.selectedFolderIds,
  modifiedFolderIds: state.folders.modifiedIds,
  trashedFolders: state.folders.trashedFolders,
  similarField: state.racetrack.similarField,
  similarValues: state.racetrack.similarValues,
  fieldTypes: state.assets.types,
  metadataFields: state.app.metadataFields,
  lightbarFields: state.app.lightbarFields,
  jobs: state.jobs.all,
  user: state.auth.user,
  userSettings: state.app.userSettings
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searcher)
