import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import { isolateJob } from '../../actions/jobActions'

class ImporterBar extends Component {
  static propTypes = {
    job: PropTypes.instanceOf(Job),
    actions: PropTypes.object
  }

  state = {}

  close = () => {
    this.props.actions.isolateJob()
  }

  epochUTCString (msec) {
    const d = new Date(msec)
    return d.toUTCString()
  }

  render () {
    const { job } = this.props
    return (
      <div className="ImporterBar">
        <div className="ImporterBar-job">
          <div className="ImporterBar-job-info ImporterBar-job-name">{job.name}</div>
          <div className="ImporterBar-job-info ImporterBar-job-owner">{job.user.username}</div>
          <div className="ImporterBar-job-info ImporterBar-job-time">{this.epochUTCString(job.timeStarted)}</div>
          <div className="ImporterBar-job-info ImporterBar-job-time">{this.epochUTCString(job.timeUpdated)}</div>
        </div>
        <div className="ImporterBar-actions">
          <div className="ImporterBar-action">
            <div className="icon-play2"/>
            <div>Run</div>
          </div>
          <div className="ImporterBar-action">
            <div className="icon-download2"/>
            <div>Download</div>
          </div>
          <div className="ImporterBar-action">
            <div className="icon-envelope"/>
            <div>Email</div>
          </div>
          <div className="ImporterBar-close icon-cross2" onClick={this.close} />
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  job: state.jobs.isolated
}), dispatch => ({
  actions: bindActionCreators({
    isolateJob
  }, dispatch)
}))(ImporterBar)
