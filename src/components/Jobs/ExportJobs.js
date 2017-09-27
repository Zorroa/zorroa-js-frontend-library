import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Job, { JobFilter } from '../../models/Job'
import Jobs from './Jobs'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from '../Folders/CreateExport'
import { exportAssets, getJobs, markJobDownloaded } from '../../actions/jobActions'
import { showModal, dialogAlertPromise } from '../../actions/appActions'

class ExportJobs extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    origin: PropTypes.string,
    selectedAssetIds: PropTypes.instanceOf(Set),
    query: PropTypes.instanceOf(AssetSearch),
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.object,
    jobs: PropTypes.object
  }

  exportAssets = () => {
    const width = '460px'
    const body = <CreateExport onCreate={this.createExport} />
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedAssetIds, query, metadataFields } = this.props
    let search = query
    if (selectedAssetIds && selectedAssetIds.size) {
      search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [...selectedAssetIds]} }) })
    }
    const fields = exportTable && metadataFields
    this.props.actions.exportAssets(name, search, fields, exportImages)
    .then(this.waitForExportAndDownload)
  }

  waitForExportAndDownload = (exportId) => {
    const { user, actions } = this.props
    const userId = user && user.id
    const type = Job.Export
    const jobFilter = new JobFilter({ type, userId })
    let timeout = 100
    return new Promise(resolve => {
      // wait until export job is done, then auto-download it
      // this code adapted from Jobs.refreshJobs()
      const waitForJob = (jobId) => {
        actions.getJobs(jobFilter)
        .then(response => {
          // const jobData = response.data.list.find(job => job.id == jobId)
          // We'll watch the app state to see if our job is finished, rather
          // than checking the response from getJobs()
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
        actions.dialogAlertPromise('Export blocked',
          'Your export package is ready for download, using the Exports panel on the left. ' +
          'Automatic download was blocked, you can fix this for future exports this by allowing popus.')
        return
      }
      actions.markJobDownloaded(job.id)
    })
  }

  render () {
    const { selectedAssetIds } = this.props
    const disabled = !selectedAssetIds || !selectedAssetIds.size
    const addButton = (
      <div className={classnames('Jobs-controls-add', {disabled})}
           title={`Export selected assets`} onClick={this.exportAssets}>
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
  metadataFields: state.app.metadataFields,
  user: state.auth.user,
  origin: state.auth.origin,
  jobs: state.jobs.all
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    exportAssets,
    getJobs,
    markJobDownloaded,
    dialogAlertPromise
  }, dispatch)
}))(ExportJobs)
