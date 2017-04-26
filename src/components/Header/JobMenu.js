import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job, { JobFilter } from '../../models/Job'
import User from '../../models/User'
import { showModal, hideModal } from '../../actions/appActions'
import { getAssetFields, setAssetPermissions } from '../../actions/assetsAction'
import { getJobs, markJobDownloaded, cancelJobId, restartJobId } from '../../actions/jobActions'
import DropdownMenu from '../../components/DropdownMenu'
import Import from '../Import/Import'
import JobTable from './JobTable'
import AssetFilter from '../../models/AssetFilter'
import AssetSearch from '../../models/AssetSearch'
import AssetPermissions from '../AssetPermissions'

class JobMenu extends Component {
  static propTypes = {
    jobType: PropTypes.string.isRequired,
    jobs: PropTypes.object,
    user: PropTypes.instanceOf(User).isRequired,
    origin: PropTypes.string,
    onboarding: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    actions: PropTypes.object.isRequired
  }

  monitorJobsInterval = null

  componentDidMount () {
    this.monitorJobs()
  }

  componentWillUnmount () {
    clearInterval(this.monitorJobsInterval)
    this.monitorJobsInterval = null
  }

  componentWillReceiveProps (nextProps) {
    // Show the import menu after we finish onboarding
    this.show = this.props.onboarding && !nextProps.onboarding && nextProps.jobType === Job.Import
  }

  monitorJobs = () => {
    if (this.monitorJobsInterval) {
      clearInterval(this.monitorJobsInterval)
      this.monitorJobsInterval = null
    }
    const { jobs, jobType } = this.props
    if (!jobs || !Object.keys(jobs).length) {
      this.refreshJobs()
      return
    }
    const containsActiveJob = Object.keys(jobs).findIndex(jobId => {
      const job = jobs[jobId]
      return (job.type === jobType && job.state === Job.Active)
    }) >= 0
    if (containsActiveJob) {
      this.monitorJobsInterval = setInterval(this.refreshJobs, 5000)
    }
  }

  // Load the most recent jobs into full job list
  refreshJobs = () => {
    const { jobType, user, actions } = this.props
    const type = jobType
    const userId = user && user.id
    const jobFilter = new JobFilter({ type, userId })
    // We only get the top N jobs, irrespective of the filter.
    // FIXME: fix the server to return the top N filtered jobs
    actions.getJobs(jobFilter, 0, 30)
    actions.getAssetFields()
  }

  cancelJob (job) {
    this.props.actions.cancelJobId(job.id)
  }

  restartJob (job) {
    this.props.actions.restartJobId(job.id)
  }

  markDownloaded (job) {
    this.props.actions.markJobDownloaded(job.id)
  }

  setImportPermissions = (job, event) => {
    const width = '300px'
    const body = <AssetPermissions title="Import Asset Permissions"
                                   onApply={acl => this.setAssetPermissions(acl, job)}
                                   onCancel={this.props.actions.hideModal}/>
    this.props.actions.showModal({body, width})
  }

  setAssetPermissions = (acl, job) => {
    this.props.actions.hideModal()
    const filter = new AssetFilter({links: {import: [job.id]}})
    const search = new AssetSearch({filter})
    this.props.actions.setAssetPermissions(search, acl)
  }

  createImport = (event) => {
    const width = '65vw'
    const body = <Import/>
    this.props.actions.showModal({body, width})
  }

  viewAllJobs = (event) => {
    const width = '70%'
    const body = <JobTable/>
    this.props.actions.showModal({body, width})
  }

  renderJobStatus (job) {
    switch (job.state) {
      case Job.Active: {
        return <div className="JobMenu-timing">{job.timeRemaining() < 0 ? '' : `Time remaining: ${job.timeRemainingString()}`}</div>
      }
      case Job.Cancelled:
        return (
          <div className="JobMenu-cancelled">
            <div className="JobMenu-restart"
                 onClick={this.restartJob.bind(this, job)}>
              Restart
            </div>
            <div>Cancelled</div>
        </div>
        )
      case Job.Finished: {
        const {origin} = this.props
        return (
          <div className="JobMenu-finished">
            { job.warningCount() ? <div className="JobMenu-warning">{job.warningCount()}</div> : null }
            { job.errorCount() ? <div className="JobMenu-error">{job.errorCount()}</div> : null }
            { job.type === Job.Export && (
              <a key={job.id}
                 className={classnames('JobMenu-download', 'icon-download2', {notDownloaded: job.notDownloaded})}
                 onClick={this.markDownloaded.bind(this, job)}
                 href={job.exportStream(origin)} download={job.name}>
                <div className="JobMenu-download-text">Download</div>
              </a>
            )}
            { job.type === Job.Import && this.props.isAdministrator && (
              <div key={job.id}
                   className={classnames('JobMenu-permissions', 'icon-link2')}
                   onClick={e => this.setImportPermissions(job, e)}>
                <div className="JobMenu-permissions-text">Access</div>
              </div>
            )}
          </div>
        )
      }
      case Job.Expired:
        return <div className="JobMenu-expired">Expired</div>
    }
  }

  renderProgress (job) {
    if (job.state !== Job.Active) return
    const progress = job.percentCompleted()
    return (
      <div className="JobMenu-progress">
        <progress max={100} value={progress}/>
        <div onClick={this.cancelJob.bind(this, job)} className="JobMenu-cancel icon-cancel-circle"/>
      </div>
    )
  }

  renderJob (job) {
    return (
      <div className="JobMenu" key={job.id}>
        <div className="JobMenu-active">
          <div className="JobMenu-active-top">
            <div className="JobMenu-name">{job.name || '<Unnamed>'}</div>
            { this.renderJobStatus(job) }
          </div>
          { this.renderProgress(job)}
        </div>
      </div>
    )
  }

  renderJobs () {
    const { jobType, jobs } = this.props
    if (!jobs) return
    const allJobs = Object.keys(jobs).map(jobId => jobs[jobId])
      .filter(job => (job.type === jobType))
      .sort((a, b) => (a.timeUpdated < b.timeUpdated ? 1 : (a.timeUpdated === b.timeUpdated ? 0 : -1)))
    const lcJobType = jobType.toLowerCase()
    if (!allJobs || !allJobs.length) {
      if (jobType === Job.Import) return
      return (
        <div className="JobMenu-jobs-empty">
          <div className="JobMenu-jobs-empty-icon icon-emptybox"/>
          <div className="JobMenu-jobs-empty-line-1">No {lcJobType} packages</div>
          <div className="JobMenu-jobs-empty-line-2">Select assets or folders to create an {lcJobType} package.</div>
        </div>
      )
    }
    this.monitorJobs()
    const maxJobs = 5
    const filteredJobs = allJobs.slice(0, maxJobs)
    return (
      <div className="JobMenu-jobs">
        { filteredJobs.map(job => this.renderJob(job)) }
        { allJobs.length > filteredJobs.length ? (
          <div onClick={this.viewAllJobs} className="JobMenu-jobs-view-all">
            View all {lcJobType} packages
          </div>
        ) : null }
      </div>
    )
  }

  renderJobBadge () {
    const { jobType, jobs } = this.props
    let activeJobs = 0
    let undownloadedExports = 0
    jobs && Object.keys(jobs).forEach(jobId => {
      const job = jobs[jobId]
      if (job.type === jobType && jobType === Job.Export && job.state === Job.Finished && job.notDownloaded) undownloadedExports++
      if (job.type === jobType && job.state === Job.Active) activeJobs++
    })
    if (activeJobs) {
      const ellipsis = require('./ellipsis.svg')
      return <img className="JobMenu-active-badge" src={ellipsis}/>
    }
    if (undownloadedExports) {
      return <div className="JobMenu-badge">{undownloadedExports}</div>
    }
  }

  render () {
    const { jobType } = this.props
    return (
      <div className={classnames('header-menu', 'header-menu-jobs', `header-menu-${jobType}`)}>
        { this.renderJobBadge() }
        <DropdownMenu label={`${jobType}s`} onChange={this.refreshJobs} show={this.show}>
          { jobType === Job.Import ? (
            <div onClick={this.createImport} className="JobMenu-jobs-create-import">
              <div className="icon-import"/>
              <div>Import assets</div>
            </div>
          ) : null }
          { this.renderJobs() }
        </DropdownMenu>
      </div>
    )
  }
}

export default connect(state => ({
  user: state.auth.user,
  jobs: state.jobs && state.jobs.all,
  origin: state.auth.origin,
  onboarding: state.auth.onboarding,
  isAdministrator: state.auth.isAdministrator
}), dispatch => ({
  actions: bindActionCreators({
    getJobs,
    getAssetFields,
    markJobDownloaded,
    cancelJobId,
    restartJobId,
    setAssetPermissions,
    showModal,
    hideModal
  }, dispatch)
}))(JobMenu)
