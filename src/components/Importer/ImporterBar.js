import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import { isolateJob } from '../../actions/jobActions'
import { epochUTCString } from '../../services/jsUtil'

class ImporterBar extends Component {
  static propTypes = {
    job: PropTypes.instanceOf(Job),
    actions: PropTypes.object,
  }

  state = {}

  close = () => {
    this.props.actions.isolateJob()
  }

  render() {
    const { job } = this.props
    return (
      <div className="ImporterBar">
        <div className="ImporterBar-job">
          <div className="ImporterBar-job-info ImporterBar-job-name">
            {job.name}
          </div>
          <div className="ImporterBar-job-info ImporterBar-job-owner">
            {job.user.username}
          </div>
          <div className="ImporterBar-job-info ImporterBar-job-time">
            {epochUTCString(job.timeStarted)}
          </div>
          <div className="ImporterBar-job-info ImporterBar-job-time">
            {epochUTCString(job.timeUpdated)}
          </div>
        </div>
        <div className="ImporterBar-actions">
          <div className="ImporterBar-action">
            <div className="icon-play2" />
            <div>Run</div>
          </div>
          <div className="ImporterBar-action">
            <div className="icon-download2" />
            <div>Download</div>
          </div>
          <div className="ImporterBar-action">
            <div className="icon-envelope" />
            <div>Email</div>
          </div>
          <div className="ImporterBar-close icon-cross" onClick={this.close} />
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    job: state.jobs.isolated,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        isolateJob,
      },
      dispatch,
    ),
  }),
)(ImporterBar)
