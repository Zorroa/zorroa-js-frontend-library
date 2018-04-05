import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job from '../../models/Job'
import Jobs from './Jobs'
import Import from '../Import'
import { isolateJob, selectJobId } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class ImportJobs extends Component {
  static propTypes = {
    jobs: PropTypes.object,
    selectedJobIds: PropTypes.instanceOf(Set),
    actions: PropTypes.object,
  }

  createImport = () => {
    const width = '65vw'
    const body = <Import />
    this.props.actions.showModal({ body, width })
  }

  isolateImport = job => {
    this.props.actions.isolateJob(job)
  }

  searchJob = (job, event) => {
    const { selectedJobIds } = this.props
    console.log('Search job ' + job.name)
    const jobs = Object.keys(this.props.jobs)
      .map(jobId => this.props.jobs[jobId])
      .filter(job => job.type === Job.Import)
      .sort(
        (a, b) =>
          a.timeUpdated < b.timeUpdated
            ? 1
            : a.timeUpdated === b.timeUpdated ? 0 : -1,
      )
    this.props.actions.selectJobId(
      job.id,
      event.shiftKey,
      event.metaKey,
      jobs,
      selectedJobIds,
      this.props.jobs,
    )
  }

  render() {
    const disabled = false
    const addButton = (
      <div
        className={classnames('Jobs-controls-add', { disabled })}
        title={`Create a new Import`}
        onClick={this.createImport}>
        <div className="icon-import2" />
        <div className="Jobs-controls-add-label">NEW</div>
      </div>
    )
    return (
      <Jobs
        jobType={Job.Import}
        addButton={addButton}
        selectJob={this.searchJob}
        isolateJob={this.isolateImport}
      />
    )
  }
}

export default connect(
  state => ({
    jobs: state.jobs.all,
    selectedJobIds: state.jobs.selectedIds,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateJob,
        selectJobId,
        showModal,
      },
      dispatch,
    ),
  }),
)(ImportJobs)
