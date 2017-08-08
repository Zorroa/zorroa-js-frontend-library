import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job from '../../models/Job'
import Jobs from './Jobs'
import Import from '../Import'
import { isolateJob } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class ImportJobs extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  createImport = () => {
    const width = '65vw'
    const body = <Import/>
    this.props.actions.showModal({body, width})
  }

  isolateImport = (job) => {
    this.props.actions.isolateJob(job)
  }

  render () {
    const disabled = false
    const addButton = (
      <div className={classnames('Jobs-controls-add', {disabled})}
           title={`Create a new Import`} onClick={this.createImport}>
        <div className="icon-import2"/>
        <div className="Jobs-controls-add-label">NEW</div>
      </div>
    )
    return (
      <Jobs jobType={Job.Import} addButton={addButton}
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
