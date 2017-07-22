import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Job from '../../models/Job'
import Jobs from './Jobs'

class ExportJobs extends Component {
  static propTypes = {}
  state = {}

  render () {
    return (
      <Jobs jobType={Job.Export}/>
    )
  }
}

export default connect(state => ({

}), dispatch => ({
  actions: bindActionCreators({

  }, dispatch)
}))(ExportJobs)
