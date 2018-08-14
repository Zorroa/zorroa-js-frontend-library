import PropTypes from 'prop-types'
import { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job, { jobsOfType } from '../../models/Job'
import Widget from '../../models/Widget'
import FieldList from '../../models/FieldList'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import TrashedFolder from '../../models/TrashedFolder'
import {
  searchAssets,
  getAssetFields,
  requiredFields,
} from '../../actions/assetsAction'
import {
  CollectionsWidgetInfo,
  SortOrderWidgetInfo,
  ImportSetWidgetInfo,
} from './WidgetInfo'

// Searcher is a singleton. It combines AssetSearches from the Racetrack
// and Folders and submits a new query to the Archivist server.
class Searcher extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    selectedFolderIds: PropTypes.object,
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    selectedJobIds: PropTypes.instanceOf(Set),
    order: PropTypes.arrayOf(PropTypes.object),
    fieldTypes: PropTypes.object,
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    selectedTableLayoutId: PropTypes.string,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    lightbarFields: PropTypes.arrayOf(PropTypes.string),
    thumbFields: PropTypes.arrayOf(PropTypes.string),
    dragFields: PropTypes.arrayOf(PropTypes.string),
    jobs: PropTypes.object,
    actions: PropTypes.object.isRequired,
  }

  state = {
    importFinished: false,
  }

  componentWillMount() {
    this.props.actions.getAssetFields()
  }

  componentWillReceiveProps(nextProps) {
    this.updateImportFinished(nextProps)
  }

  updateImportFinished(nextProps) {
    const oldJobs = jobsOfType(this.props.jobs, Job.Import)
    const newJobs = jobsOfType(nextProps.jobs, Job.Import)
    if (oldJobs && newJobs) {
      const oldFieldCount =
        this.props.fieldTypes && Object.keys(this.props.fieldTypes).length
      const newFieldCount =
        nextProps.fieldTypes && Object.keys(nextProps.fieldTypes).length
      let importFinished =
        oldJobs.length &&
        (oldJobs.length !== newJobs.length || oldFieldCount !== newFieldCount)
      oldJobs.forEach(oldJob => {
        if (oldJob.state === Job.Active) {
          const newJob = newJobs.find(job => job.id === oldJob.id)
          if (newJob && newJob.state === Job.Finished) {
            importFinished = true
          }
        }
      })
      this.setState({ importFinished })
      if (importFinished) {
        this.props.actions.getAssetFields()
      }
    }
  }

  // The Searcher does not render any JSX, and is purely reactive.
  // Each query returns the assets and aggs for all search widgets.
  // The AsseSearch contains search and folders in the main query,
  // and a post-filter for all the racetrack facets. Aggs for each
  // facet are placed in a filter-bucket with the allOtherFilter so
  // they show the results that do not include their own filter.
  // Note that post-filter is less efficient than a standard filter.
  static build = (widgets, nonTrashedFolderIds, selectedJobIds, order) => {
    let foldersDisabled = false
    let importsDisabled = false
    let orderDisabled = false
    let assetSearch = new AssetSearch()
    if (widgets && widgets.length) {
      let postFilter = new AssetFilter()
      for (let widget of widgets) {
        if (!widget) continue
        if (widget.type === CollectionsWidgetInfo.type)
          foldersDisabled = !widget.isEnabled
        if (widget.type === SortOrderWidgetInfo.type)
          orderDisabled = !widget.isEnabled
        if (widget.type === ImportSetWidgetInfo.type)
          importsDisabled = !widget.isEnabled
        if (!widget.sliver) continue
        let sliver = widget.sliver
        if (sliver.aggs) {
          if (widget.isEnabled) postFilter.merge(widget.sliver.filter)
          // Return a filter comprised of all widget filters except one
          const allOtherFilters = widget => {
            let allOther = new AssetFilter()
            for (let w of widgets) {
              if (
                w !== widget &&
                w.isEnabled &&
                w.sliver &&
                w.sliver.filter &&
                w.sliver.aggs
              ) {
                allOther.merge(w.sliver.filter)
              }
            }
            return allOther
          }
          const allOthers = allOtherFilters(widget).convertToBool()
          let aggs = { [widget.id]: { filter: allOthers, aggs: sliver.aggs } }
          sliver = new AssetSearch({ aggs })
        }
        // Search for aggs even if widget is disabled to update contents, e.g. facets
        const search = widget.isEnabled
          ? sliver
          : new AssetSearch({ aggs: sliver.aggs })
        assetSearch.merge(search)
      }
      assetSearch.postFilter = postFilter
    }

    // Add sort order if not disabled
    if (!orderDisabled && order) assetSearch.order = order

    // Add a filter for selected folders
    if (!foldersDisabled && nonTrashedFolderIds && nonTrashedFolderIds.length) {
      const filter = new AssetFilter({ links: { folder: nonTrashedFolderIds } })
      assetSearch.merge(new AssetSearch({ filter }))
    }

    // Add a filter for the selected imports
    if (!importsDisabled && selectedJobIds.size) {
      const filter = new AssetFilter({ links: { import: [...selectedJobIds] } })
      assetSearch.merge(new AssetSearch({ filter }))
    }

    return assetSearch
  }

  static nonTrashedFolderIds = (selectedFolderIds, trashedFolders) => {
    let nonTrashedFolderIds
    if (trashedFolders && trashedFolders.length) {
      nonTrashedFolderIds = []
      selectedFolderIds.forEach(id => {
        const index = trashedFolders.findIndex(
          trashedFolder => trashedFolder.folderId === id,
        )
        if (index < 0) nonTrashedFolderIds.push(id)
      })
    } else {
      nonTrashedFolderIds = [...selectedFolderIds]
    }
    return nonTrashedFolderIds
  }

  render() {
    const {
      widgets,
      actions,
      selectedFolderIds,
      query,
      trashedFolders,
      order,
      selectedJobIds,
      metadataFields,
      lightbarFields,
      thumbFields,
      dragFields,
      fieldTypes,
      selectedTableLayoutId,
      tableLayouts,
    } = this.props
    if (!fieldTypes) return null

    // Server does not support searching of trashed folders
    const nonTrashedFolderIds = Searcher.nonTrashedFolderIds(
      selectedFolderIds,
      trashedFolders,
    )
    const assetSearch = Searcher.build(
      widgets,
      nonTrashedFolderIds,
      selectedJobIds,
      order,
    )

    // Limit results to favorited fields, since we only display values
    // in those fields in the Table and Lightbar
    const layout = tableLayouts.find(
      layout => layout.id === selectedTableLayoutId,
    )
    const tableFields = (layout && layout.fields) || []
    const fields = requiredFields(
      [
        ...metadataFields,
        ...tableFields,
        ...lightbarFields,
        ...thumbFields,
        ...dragFields,
      ],
      fieldTypes,
    )
    assetSearch.fields = [...fields]

    // Do not send the query unless it is different than the last returned query
    // FIXME: If assetSearch.empty() filtered counts == total, but tricky to flush cache
    // FIXME: Count trashed folders once the server adds support
    const skip = new Set(['fields', 'from', 'size', 'scroll'])
    const missingField = this.inflightQuery
      ? this.inflightQuery.missingField(assetSearch.fields)
      : !query || query.missingField(assetSearch.fields)
    const searchModified = this.inflightQuery
      ? !this.inflightQuery.equals(assetSearch, skip)
      : !query || !assetSearch.equals(query, skip)
    if (searchModified || missingField || this.state.importFinished) {
      assetSearch.size = AssetSearch.autoPageSize
      const force = this.state.importFinished
      const isFirstPage = true
      actions.searchAssets(assetSearch, query, force, isFirstPage, [])
      this.inflightQuery = assetSearch
      if (query) {
        // FIXME: Disable saving search to user settings to avoid conflicts
        // actions.saveUserSettings(user, { ...userSettings, search: assetSearch })
      }
    }

    if (this.inflightQuery && query && this.inflightQuery.equals(query))
      this.inflightQuery = null
    return null // Just reacting to new slivers
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      searchAssets,
      getAssetFields,
    },
    dispatch,
  ),
})

const mapStateToProps = state => ({
  query: state.assets.query,
  order: state.assets.order,
  widgets: state.racetrack.widgets,
  selectedFolderIds: state.folders.selectedFolderIds,
  trashedFolders: state.folders.trashedFolders,
  fieldTypes: state.assets.types,
  metadataFields: state.app.metadataFields,
  selectedTableLayoutId: state.app.selectedTableLayoutId,
  tableLayouts: state.app.tableLayouts,
  lightbarFields: state.app.lightbarFields,
  thumbFields: state.app.thumbFields,
  dragFields: state.app.dragFields,
  jobs: state.jobs.all,
  selectedJobIds: state.jobs.selectedIds,
})

export default connect(mapStateToProps, mapDispatchToProps)(Searcher)
