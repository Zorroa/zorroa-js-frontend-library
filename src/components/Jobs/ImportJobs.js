import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import Jobs from './Jobs'
import { isolateJob } from '../../actions/jobActions'

class ImportJobs extends Component {
  static propTypes = {}
  state = {}

  createImport = () => {
    console.log('Create import')
  }

  isolateImport = (job) => {
    this.props.actions.isolateJob(job)
  }

  render () {
    return (
      <Jobs jobType={Job.Import}
            addJobEnabled={true} addJob={this.createImport}
            isolateJob={this.isolateImport}/>
    )
  }
}

export default connect(state => ({

}), dispatch => ({
  actions: bindActionCreators({
    isolateJob,
  }, dispatch)
}))(ImportJobs)
