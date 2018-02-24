import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Job from '../../models/Job'
import Jobs from './Jobs'
import FieldList from '../../models/FieldList'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { exportAssets, getJob, markJobDownloaded } from '../../actions/jobActions'
import { showModal, dialogAlertPromise } from '../../actions/appActions'
import { updateExportInterface } from '../../actions/exportsAction'

class ExportJobs extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    origin: PropTypes.string,
    selectedAssetIds: PropTypes.instanceOf(Set),
    query: PropTypes.instanceOf(AssetSearch),
    selectedTableLayoutId: PropTypes.string,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    actions: PropTypes.object,
    jobs: PropTypes.object
  }

  exportAssets = () => {
    if (this.areExportsDisabled()) {
      return
    }

    this.props.actions.updateExportInterface({
      // TODO: implement the createExport -> waitForExportAndDownload logic: onCreate: this.createExport,
      shouldShow: true
    })
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedAssetIds, query, selectedTableLayoutId, tableLayouts } = this.props
    let search = query
    if (selectedAssetIds && selectedAssetIds.size) {
      search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [...selectedAssetIds]} }) })
    }
    const layout = tableLayouts.find(layout => layout.id === selectedTableLayoutId)
    const tableFields = layout && layout.fields
    const fields = exportTable && tableFields
    this.props.actions.exportAssets(name, search, fields, exportImages)
    .then(this.waitForExportAndDownload)
  }

  // duplicate code warning: keep this in sync with FolderItem.waitForExportAndDownload (TODO: share this code)
  waitForExportAndDownload = (exportId) => {
    const { actions } = this.props
    let timeout = 100
    return new Promise(resolve => {
      // wait until export job is done, then auto-download it
      // this code adapted from Jobs.refreshJobs()
      const waitForJob = (jobId) => {
        actions.getJob(exportId)
        .then(response => {
          // We'll watch the app state to see if our job is finished, rather
          // than checking the response from getJob()
          const job = this.props.jobs && this.props.jobs[jobId]
          if (job && job.isFinished()) {
            resolve(job)
          } else {
            timeout = Math.min(5000, timeout * 2) // try often at first, but back off for long jobs
            setTimeout(_ => waitForJob(jobId), timeout)
          }
        })
      }
      waitForJob(exportId)
    })
    .then(job => {
      const retval = window.open(job.exportStream(this.props.origin))
      if (!retval) {
        actions.dialogAlertPromise('Export complete',
          'Your export package is ready for download, using the Exports panel on the left. ' +
          'You can enable automatic downloads for future exports by allowing popus for this site.')
        return
      }
      actions.markJobDownloaded(job.id)
    })
  }

  areExportsDisabled () {
    const { selectedAssetIds } = this.props
    const disabled = !selectedAssetIds || selectedAssetIds.size === 0
    return disabled
  }

  render () {
    const addButton = (
      <div
        className={classnames(
          'Jobs-controls-add', {
            disabled: this.areExportsDisabled()
          })
        }
        title={`Export selected assets`}
        onClick={this.exportAssets}
      >
      <div className="icon-export"/>
      <div className="Jobs-controls-add-label">EXPORT</div>
      </div>
    )
    return (
      <Jobs jobType={Job.Export} addButton={addButton}/>
    )
  }
}

export default connect(state => ({
  query: state.assets.query,
  selectedAssetIds: state.assets.selectedIds,
  selectedTableLayoutId: state.app.selectedTableLayoutId,
  tableLayouts: state.app.tableLayouts,
  user: state.auth.user,
  origin: state.auth.origin,
  jobs: state.jobs.all
}), dispatch => ({
  actions: bindActionCreators({
    updateExportInterface,
    showModal,
    exportAssets,
    getJob,
    markJobDownloaded,
    dialogAlertPromise
  }, dispatch)
}))(ExportJobs)
