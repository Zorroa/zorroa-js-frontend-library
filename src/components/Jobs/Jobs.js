import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { selectJobId, selectJobIds } from '../../actions/jobActions'

const SORT_ALPHABETICAL = 'alpha'
const SORT_TIME = 'time'

class Jobs extends Component {
  static propTypes = {
    jobs: PropTypes.object,
    selectedJobIds: PropTypes.instanceOf(Set),
    jobType: PropTypes.string.isRequired,
    addJob: PropTypes.func,
    addJobEnabled: PropTypes.bool,
    isolateJob: PropTypes.func,
    actions: PropTypes.object
  }

  state = {
    filterString: '',
    sort: 'alpha-asc'
  }

  filterJobs = (event) => {
    const filterString = event.target.value
    this.setState({filterString})
  }

  cancelFilter = () => {
    this.setState({ filterString: '' })
  }

  searchJob = (job, event) => {
    const { jobType, selectedJobIds } = this.props
    console.log('Search job ' + job.name)
    const jobs = Object.keys(this.props.jobs).map(jobId => this.props.jobs[jobId])
      .filter(job => job.type === jobType)
      .sort((a, b) => (a.timeUpdated < b.timeUpdated ? 1 : (a.timeUpdated === b.timeUpdated ? 0 : -1)))
    this.props.actions.selectJobId(job.id, event.shiftKey, event.metaKey, jobs, selectedJobIds, this.props.jobs)
  }

  sortJobs = (field) => {
    const { sort } = this.state
    let newSort = sort
    switch (field) {
      case SORT_ALPHABETICAL:
        if (sort === 'alpha-asc') {
          newSort = 'alpha-desc'
        } else {
          newSort = 'alpha-asc'
        }
        break
      case SORT_TIME:
        if (sort === 'time-asc') {
          newSort = 'time-desc'
        } else {
          newSort = 'time-asc'
        }
        break
    }
    this.setState({ sort: newSort })
  }

  renderSortButton (field) {
    const { sort } = this.state
    const enabled = sort.match(field) != null
    const icon = enabled ? `icon-sort-${sort}` : `icon-sort-${field}-asc`
    return (
      <div onClick={this.sortJobs.bind(this, field)} className={classnames('Jobs-sort-button', icon, {enabled})}/>
    )
  }

  renderJobsDeselector (count) {
    if (!count) return null
    return (
      <div className="Jobs-selected">
        { `${count} ${this.props.jobType} selected` }
        <div onClick={_ => this.props.actions.selectJobIds()} className="Jobs-deselect-all icon-cancel-circle"/>
      </div>
    )
  }

  render () {
    const { jobType, addJob, addJobEnabled, isolateJob, selectedJobIds } = this.props
    const { filterString } = this.state
    const lcFilterString = filterString.toLowerCase()
    const jobs = Object.keys(this.props.jobs).map(jobId => this.props.jobs[jobId])
      .filter(job => job.type === jobType && job.name.toLowerCase().includes(lcFilterString))
      .sort((a, b) => (a.timeUpdated < b.timeUpdated ? 1 : (a.timeUpdated === b.timeUpdated ? 0 : -1)))
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
            { addJob && (
              <div className={classnames('Jobs-controls-add', {disabled: !addJobEnabled})}
                   title={`Create a new ${jobType}`} onClick={addJobEnabled && addJob}>
                <div className="icon-plus2"/>
              </div>
            )}
          </div>
          <div className="Jobs-sort-selected">
            <div className="Jobs-sort">
              { this.renderSortButton(SORT_ALPHABETICAL) }
              { this.renderSortButton(SORT_TIME) }
            </div>
            { this.renderJobsDeselector(selectedJobIds.size) }
          </div>
        </div>
        <div className="Jobs-scroll">
          <div className="Jobs-body">
            { jobs.map(job => (
              <div className={classnames('Jobs-job', {isSelected: selectedJobIds.has(job.id)})} key={job.id} onClick={e => this.searchJob(job, e)}
                   onDoubleClick={_ => isolateJob && isolateJob(job)}>
                <div className="Jobs-job-name">{job.name}</div>
                <div className="Jobs-status">
                  { job.warningCount() ? <div className="Jobs-warning">{job.warningCount()}</div> : null }
                  { job.errorCount() ? <div className="Jobs-error">{job.errorCount()}</div> : null }
                </div>
              </div>
            )) }
            { !jobs.length && (
              <div className="Jobs-empty">
                <div className="Jobs-empty-icon icon-emptybox"/>
                <div className="Jobs-empty-label">No {jobType}</div>
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
  selectedJobIds: state.jobs.selectedIds
}), dispatch => ({
  actions: bindActionCreators({
    selectJobId,
    selectJobIds
  }, dispatch)
}))(Jobs)
