import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job, { JobFilter } from '../../models/Job'
import User from '../../models/User'
import ProgressBar from '../ProgressBar'
import {
  getJobs,
  markJobDownloaded,
  downloadFilesForJob
} from '../../actions/jobActions'
import { epochUTCString } from '../../services/jsUtil'

const SORT_NAME = 'name'
const SORT_DATE = 'date'
const SORT_STATUS = 'status'

class Jobs extends Component {
  static propTypes = {
    jobs: PropTypes.object,
    selectedJobIds: PropTypes.instanceOf(Set),
    jobType: PropTypes.string.isRequired,
    addButton: PropTypes.node,
    selectJob: PropTypes.func,
    isolateJob: PropTypes.func,
    user: PropTypes.instanceOf(User).isRequired,
    origin: PropTypes.string,
    actions: PropTypes.shape({
      getJobs: PropTypes.func.isRequired,
      markJobDownloaded: PropTypes.func.isRequired,
      downloadFilesForJob: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    filterString: '',
    sortField: SORT_NAME,
    sortAscending: true
  }

  monitorJobsInterval = null

  componentDidMount () {
    this.refreshJobs()
    this.monitorJobsInterval = setInterval(this.monitorJobs, 5000)
  }

  componentWillUnmount () {
    clearInterval(this.monitorJobsInterval)
    this.monitorJobsInterval = null
  }

  monitorJobs = () => {
    const { jobs, jobType } = this.props
    const hasNoJobs = !jobs
    const hasNoJobsForType = Object
      .keys(jobs)
      .some(jobKey => {
        const job = jobs[jobKey]
        job.type === jobType
      }) === false

    const containsActiveJob = Object.keys(jobs).some(jobId => {
      const job = jobs[jobId]
      return (job.type === jobType && job.state === Job.Active)
    }) === true

    if (hasNoJobs || hasNoJobsForType || containsActiveJob) {
      this.refreshJobs()
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
  }

  filterJobs = (event) => {
    const filterString = event.target.value
    this.setState({filterString})
  }

  cancelFilter = () => {
    this.setState({ filterString: '' })
  }

  sortJobs = field => {
    let { sortField, sortAscending } = this.state
    if (field === sortField) {
      sortAscending = !sortAscending
      this.setState({ sortAscending })
    } else {
      sortField = field
      this.setState({ sortField })
    }
  }

  sortOrderClassname = field => {
    const { sortField, sortAscending } = this.state
    const icon = field === sortField ? `icon-sort-${sortAscending ? 'asc' : 'desc'}` : 'icon-sort'
    return `Jobs-header-sort ${icon}`
  }

  downloadFilesForJob = job => {
    this.props.actions.downloadFilesForJob(job.id, this.props.origin)
  }

  renderStatus (job) {
    return (
      <div className="Jobs-status" style={{width: '25%', maxWidth: '25%'}}>
        { job.state === Job.Active && job.progress && (
          <div className="Jobs-progress">
            <ProgressBar forceIndeterminate={true}
                         successPct={job.progress.success}
                         errorPct={job.progress.failed}
                         warningPct={job.progress.skipped}
                         fast
                         pendingPct={job.progress.waiting}/>
          </div>
        )}
        { (job.state !== Job.Active || !job.progress) && (
          <div className="Job-counts">
            { job.warningCount() && <div className="Jobs-warning"><div className="Jobs-warning-icon icon-warning2"/>{job.warningCount()}</div> }
            { job.errorCount() && <div className="Jobs-error"><div className="Jobs-error-icon icon-spam"/> {job.errorCount()}</div> }
            { job.successCount() && <div className="Jobs-success"><div className="Jobs-success-icon icon-circle-check"/> {job.successCount()}</div> }
          </div>
        )}
        { (job.type === Job.Export && job.state !== Job.Active && (
          <button className={classnames('Jobs-download', 'icon-download2', {notDownloaded: job.notDownloaded})}
             onClick={() => this.downloadFilesForJob(job)}
             title="Download export"
          />
        ))}
      </div>
    )
  }

  render () {
    const { jobType, addButton, selectJob, isolateJob, selectedJobIds } = this.props
    const { filterString, sortAscending } = this.state
    const lcFilterString = filterString.toLowerCase()
    const _compare = (a, b) => {
      const { sortField } = this.state
      switch (sortField) {
        case SORT_NAME: return b.name.localeCompare(a.name, undefined, {numeric: true})
        case SORT_DATE: return a.timeStarted < b.timeStarted ? -1 : (a.timeStarted > b.timeStarted ? 1 : 0)
        case SORT_STATUS:
          if (a.state === b.state) {
            return a.progress < b.progress ? -1 : (a.progress > b.progress ? 1 : 0)
          } else {
            if (a.state === Job.Active) return -1
            if (b.state === Job.Active) return 1
            if (a.state === Job.Waiting) return -1
            if (b.state === Job.Waiting) return 1
            if (a.state === Job.Finished) return -1
            if (b.state === Job.Finished) return 1
            if (a.state === Job.Cancelled) return -1
            if (b.state === Job.Cancelled) return 1
          }
      }
    }
    const compare = (a, b) => (_compare(a, b) * (sortAscending ? -1 : 1))
    const jobs = Object.keys(this.props.jobs).map(jobId => this.props.jobs[jobId])
      .filter(job => job.type === jobType && job.name.toLowerCase().includes(lcFilterString))
      .sort(compare)
    return (
      <div className="Jobs">
        <div className="Jobs-controls">
          <div className="Jobs-filter-add">
            <div className="Jobs-filter">
              <input className="Jobs-filter-input" type="text" value={filterString}
                     onChange={this.filterJobs} placeholder={`Filter ${jobType}s`} />
                { filterString && filterString.length && (
                  <div onClick={this.cancelFilter} className="Jobs-cancel-filter icon-cancel-circle" />
                )}
                <div className="Jobs-filter-icon icon-search"/>
            </div>
            { addButton }
          </div>
        </div>
        <div className="Jobs-scroll">
          <div className="Jobs-header">
            <div className="Jobs-header-title" style={{width: '50%', maxWidth: '50%'}}>
              Name
              <div className={this.sortOrderClassname(SORT_NAME)} onClick={e => this.sortJobs(SORT_NAME, e)}/>
            </div>
            <div className="Jobs-header-title" style={{width: '25%', maxWidth: '25%'}}>
              Date
              <div className={this.sortOrderClassname(SORT_DATE)} onClick={e => this.sortJobs(SORT_DATE, e)}/>
            </div>
            <div className="Jobs-header-title" style={{width: '25%', maxWidth: '25%'}}>
              Status
              <div className={this.sortOrderClassname(SORT_STATUS)} onClick={e => this.sortJobs(SORT_STATUS, e)}/>
            </div>
          </div>
          <div className="Jobs-body">
            { jobs.map(job => (
              <div key={job.id}
                   className={classnames('Jobs-job', {isSelected: selectedJobIds.has(job.id), isSelectable: isolateJob || selectJob})}
                   onClick={e => selectJob && selectJob(job, e)}
                   onDoubleClick={_ => isolateJob && isolateJob(job)}>
                <div
                  title={job.name}
                  className="Jobs-job-name"
                  style={{width: '50%', maxWidth: '50%'}}
                >
                  {job.name}
                </div>
                <div
                  className="Jobs-job-date"
                  title={epochUTCString(job.timeStarted)}
                  style={{width: '25%', maxWidth: '25%'}}
                >{epochUTCString(job.timeStarted)}</div>
                { this.renderStatus(job) }
              </div>
            )) }
            { !jobs.length && (
              <div className="Jobs-empty">
                <div className="Jobs-empty-icon icon-emptybox"/>
                <div className="Jobs-empty-label">No {jobType}s</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  jobs: state.jobs.all,
  selectedJobIds: state.jobs.selectedIds,
  user: state.auth.user,
  origin: state.auth.origin
}), dispatch => ({
  actions: bindActionCreators({
    getJobs,
    markJobDownloaded,
    downloadFilesForJob
  }, dispatch)
}))(Jobs)
