import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'

class JobTable extends Component {
  static propTypes = {
    jobs: PropTypes.object,
    actions: PropTypes.object
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
  }

  epochUTCString (msec) {
    const d = new Date(msec)
    return d.toUTCString()
  }

  render () {
    const { jobs } = this.props
    const allJobs = Object.keys(jobs).map(jobId => jobs[jobId])
      .sort((a, b) => (a.timeUpdated < b.timeUpdated ? 1 : (a.timeUpdated === b.timeUpdated ? 0 : -1)))
    if (!allJobs || !allJobs.length) {
      return <div className="JobTable-empty">No Jobs</div>
    }
    return (
      <div className="JobTable">
        <div className="JobTable-header">
          <div className="JobTable-header-left">
            <div className="JobTable-header-icon icon-list"/>
            <div className="JobTable-header-title">All Jobs</div>
          </div>
          <div onClick={this.dismiss} className="JobTable-header-close icon-cross2"/>
        </div>
        <div className="JobTable-table-container">
          <table className="JobTable-table">
            <thead>
            <tr>
              <td>Id</td>
              <td>Name</td>
              <td>Type</td>
              <td>Username</td>
              <td>State</td>
              <td>Warnings</td>
              <td>Errors</td>
              <td>Started</td>
              <td className="flexRow flexAlignItemsCenter">Updated<div className="icon-sort-asc"/></td>
            </tr>
            </thead>
            <tbody>
            { allJobs.map(job => (
              <tr className="JobTable-job">
                <td className="JobTable-job-item">{job.id}</td>
                <td className="JobTable-job-item">{job.name}</td>
                <td className="JobTable-job-item">{job.type}</td>
                <td className="JobTable-job-item">{job.user.username}</td>
                <td className="JobTable-job-item">{job.state}</td>
                <td className="JobTable-job-item">{job.warningCount()}</td>
                <td className="JobTable-job-item">{job.errorCount()}</td>
                <td className="JobTable-job-item">{this.epochUTCString(job.timeStarted)}</td>
                <td className="JobTable-job-item">{this.epochUTCString(job.timeUpdated)}</td>
              </tr>
            )) }
            </tbody>
          </table>
        </div>
        <div className="JobTable-footer">
          <div className="JobTable-close" onClick={this.dismiss}>Close</div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  jobs: state.jobs && state.jobs.all
}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(JobTable)
