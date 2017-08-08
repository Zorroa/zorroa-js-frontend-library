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
    jobs: [],
    suggestions: [],
    suggestion: ''
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.selectedJobIds && nextProps.selectedJobIds.size) {
      const jobs = [...this.state.jobs]
      nextProps.selectedJobIds.forEach(id => {
        if (jobs.findIndex(job => job.id === id) < 0) {
          const job = nextProps.jobs[id]
          if (job) jobs.push(job)
        }
      })
      this.setState({ jobs })
    }
  }

  toggleJob = (job, event) => {
    const selectedIds = new Set([...this.props.selectedJobIds])
    if (selectedIds.has(job.id)) {
      selectedIds.delete(job.id)
    } else {
      selectedIds.add(job.id)
    }
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
        if (job.name.toLowerCase().includes(key) && this.state.jobs.findIndex(j => j.id === id) < 0) suggestions.push({text: job.name, job: job})
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
          <div className="ImportSet-suggestions">
            <Suggestions suggestions={suggestions} placeholder="Search Imports" className="clear"
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
          { this.state.jobs.length <= 0 && <div className="ImportSet-clear-all" key="clear-all"/> }
          { !this.state.jobs.length && <div className="ImportSet-empty"><div className="icon-emptybox"/>No Imports Selected</div> }
          <div className="ImportSet-imports">
            { this.state.jobs.map(job => (
              <div className="ImportSet-import" key={job.id}>
                <div className={`ImportSet-import-selected icon-checkbox-${selectedJobIds.has(job.id) ? 'checked' : 'empty'}`} onClick={e => this.toggleJob(job, e)}/>
                <div className="ImportSet-import-name">{job.name}</div>
              </div>
            ))}
          </div>
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
