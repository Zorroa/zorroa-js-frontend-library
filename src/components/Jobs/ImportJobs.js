import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import Jobs from './Jobs'
import Import from '../Import'
import { isolateJob } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class ImportJobs extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  state = {}

  createImport = () => {
    const width = '65vw'
    const body = <Import/>
    this.props.actions.showModal({body, width})
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
    showModal
  }, dispatch)
}))(ImportJobs)
