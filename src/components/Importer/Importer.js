import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job from '../../models/Job'
import ImporterBar from './ImporterBar'
import ImporterSection from './ImporterSection'

class Importer extends Component {
  static propTypes = {
    job: PropTypes.instanceOf(Job),
    actions: PropTypes.object
  }

  state = {}

  renderTimeseries () {
    return (
      <div className="ImporterSection Importer-timeseries">
      </div>
    )
  }

  render () {
    return (
      <div className="Importer">
        <ImporterBar/>
        <div className="Importer-body">
          { this.renderTimeseries() }
          <ImporterSection name="errors">
          </ImporterSection>
          <ImporterSection name="pipelines">
          </ImporterSection>
          <ImporterSection name="tasks">
          </ImporterSection>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  job: state.jobs.isolated,
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(Importer)
