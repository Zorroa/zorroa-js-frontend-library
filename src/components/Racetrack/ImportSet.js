import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from './Widget'
import { ImportSetWidgetInfo } from './WidgetInfo'
import { selectJobIds } from '../../actions/jobActions'
import Suggestions from '../Suggestions'

class ImportSet extends Component {
  static propTypes = {
    jobs: PropTypes.object,
    selectedJobIds: PropTypes.object,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    actions: PropTypes.object
  }

  state = {
    suggestions: [],
    suggestion: ''
  }

  closeJob = (job, event) => {
    console.log('Close job ' + job.name)
    const selectedIds = new Set([...this.props.selectedJobIds])
    selectedIds.delete(job.id)
    this.props.actions.selectJobIds(selectedIds)
    this.setState({ suggestions: [], suggestion: '' })
  }

  clearAll = (event) => {
    this.props.actions.selectJobIds()
    this.setState({ suggestions: [], suggestion: '' })
  }

  suggest = (suggestion, lastAction) => {
    const { jobs } = this.props
    console.log('Suggest ' + suggestion)
    let suggestions = []
    if (suggestion && suggestion.length && lastAction === 'type') {
      const key = suggestion.toLowerCase()
      for (let id in jobs) {
        const job = jobs[id]
        if (job.name.toLowerCase().includes(key)) suggestions.push({text: job.name, job: job})
      }
      this.setState({suggestions, suggestion})
    }
  }

  select = (text) => {
    if (!text) return
    const { suggestions } = this.state
    const suggestion = suggestions.find(suggestion => suggestion.text === text)
    const job = suggestion && suggestion.job
    const selectedJobIds = new Set([...this.props.selectedJobIds, job.id])
    this.props.actions.selectJobIds(selectedJobIds)
    console.log('Select ' + text)
    this.setState({suggestions: [], suggestion: ''})
    console.log('Select suggestion ' + text)
  }

  render () {
    const { jobs, selectedJobIds, id, floatBody, isOpen, onOpen, isIconified } = this.props
    const { suggestions, suggestion } = this.state
    const selectedJobs = [...selectedJobIds.values()].map(id => jobs[id])
    const title = 'Imports'
    const field = undefined
    const placeholder = selectedJobs.length ? '' : 'Search imports'
    return (
      <Widget className='ImportSet'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={title}
              field={field}
              backgroundColor={ImportSetWidgetInfo.color}
              isIconified={isIconified}
              icon={ImportSetWidgetInfo.icon}>
        <div className="ImportSet-body">
          { !selectedJobs.length && <div className="ImportSet-empty"><div className="icon-emptybox"/>No Imports Selected</div> }
          <div className="ImportSet-imports">
            { selectedJobs.map(job => (
              <div className="ImportSet-import" key={job.id}>
                <div className="ImportSet-import-name">{job.name}</div>
                <div className="ImportSet-import-close icon-cross" onClick={e => this.closeJob(job, e)}/>
              </div>
            ))}
          </div>
          <div className="ImportSet-suggestions">
            <Suggestions suggestions={suggestions} placeholder={placeholder} className="clear"
                         value={suggestion} onChange={this.suggest} onSelect={this.select}/>
          </div>
          { selectedJobs.length > 0 && (
            <div className="ImportSet-clear-all" key="clear-all">
              <div className="ImportSet-clear-all-label">
                {`${selectedJobs.length} imports selected`}
              </div>
              <div className="ImportSet-clear-all-icon icon-cancel-circle" onClick={this.clearAll}/>
            </div>
          )}
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    jobs: state.jobs.all,
    selectedJobIds: state.jobs.selectedIds
  }), dispatch => ({
    actions: bindActionCreators({
      selectJobIds
    }, dispatch)
  })
)(ImportSet)
