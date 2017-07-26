import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job, { JobTasks } from '../../models/Job'
import Processor from '../../models/Processor'
import ImporterBar from './ImporterBar'
import ImporterSection from './ImporterSection'
import PieChart from '../PieChart'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#ce2d3f', '#fc6c2c', ' #a11e77', '#b7df4d', '#1875d1' ]

const generateTimeSlots = () => {
  const tasks = []
  let cur = new JobTasks({
    total: 1000,
    completed: 0,
    waiting: 0,
    queued: 0,
    running: 0,
    success: 0,
    failure: 0,
    skipped: 0
  })
  for (let i = 0; i < 100; ++i) {
    const t = new JobTasks(cur)
    const k = Math.round(t.running * Math.random())
    const e = Math.floor((t.running - k) * Math.random())
    const s = Math.floor((t.running - k - e) * Math.random())
    t.success += k
    t.failure += e
    t.skipped += s
    t.completed += k + e + s
    if (t.completed < t.total) {
      const r = Math.floor(t.queued * Math.random())
      t.running += r
      const n = Math.round(Math.random() * 5)
      t.queued += n
    }
    tasks.push(t)
    cur = t
  }
  return tasks
}

const slots = generateTimeSlots()

const pipeline = [
  new Processor({id: 1, description: 'Boom bam', name: 'Fireworks'}),
  new Processor({id: 2, description: 'Higgly piggly', name: 'Barn'}),
  new Processor({id: 3, description: 'Oingo Boingo', name: 'Transcriptor'})
]

const errors = {
  UnholyPointerAccess: [ '/foo/fam/foom', '/bin/bam/boom' ],
  MitigatedNegativeDeclaration: [ '/zip/pow', '/zoom/zip/zap', '/goo/goo/gai/pan' ],
  ZitherMaster: [ '/how/what/where' ]
}

const tasks = [
  { id: 1, name: 'Foo' },
  { id: 2, name: 'Bam' },
  { id: 3, name: 'Boom' }
]

class Importer extends Component {
  static propTypes = {
    job: PropTypes.instanceOf(Job),
    actions: PropTypes.object
  }

  state = {
    errorFilter: '',
    pipelineFilter: '',
    taskFilter: ''
  }

  toggle = (exception) => {
    console.log('Toggle ' + exception)
  }

  retry = () => {
    console.log('Retry')
  }

  selectError = ({ name }, i, event) => {
    console.log('Select exception ' + name)
  }

  renderTimeseries () {
    return (
      <div className="ImporterSection Importer-timeseries">
      </div>
    )
  }

  render () {
    const { errorFilter, pipelineFilter, taskFilter } = this.state
    const compareErrors = (a, b) => (a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
    const lcErrorFilter = errorFilter.toLowerCase()
    const filteredErrors = Object.keys(errors).filter(error => error.toLowerCase().includes(lcErrorFilter)).sort(compareErrors)
    const errorData = filteredErrors.map(exception => ({name: exception, value: errors[exception].length}))
    const compareProcessors = (a, b) => (a.name.localeCompare(b.name))
    const lcPipelineFilter = pipelineFilter.toLowerCase()
    const filteredPipeline = pipeline.filter(pipeline => pipeline.name.toLowerCase().includes(lcPipelineFilter)).sort(compareProcessors)
    const compareTasks = (a, b) => (a.name.localeCompare(b.name))
    const lcTaskFilter = taskFilter.toLowerCase()
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(lcTaskFilter)).sort(compareTasks)
    return (
      <div className="Importer">
        <ImporterBar/>
        <div className="Importer-body">
          { this.renderTimeseries() }
          <ImporterSection name="errors">
            <div className="Importer-error-pie">
              <PieChart field="Errors" terms={filteredErrors} data={errorData} activeIndex={undefined} COLORS={COLORS} animate={true} onSelectPieSection={this.selectError}/>
            </div>
            <div className="Importer-error-list">
              <div className="Importer-controls">
                <div className="Importer-filter">
                  <input className="Importer-filter-input" value={errorFilter} onChange={e => this.setState({errorFilter: e.target.value})} />
                  <div className="Importer-filter-icon icon-search"/>
                </div>
                <div className="Importer-retry" onClick={this.retry}>
                  <div className="Importer-retry-icon icon-playall"/><div>Retry</div>
                </div>
              </div>
              { filteredErrors.map(exception => (
                <div key={exception} className="Importer-zebra Importer-error">
                  <div className={classnames('Importer-opener', 'icon-triangle-down', {isOpen: false, isSelected: false})} onClick={_ => this.toggle(exception)}/>
                  <div className="Importer-error-exception">{exception}</div>
                </div>
              ))}
            </div>
            <div className="Importer-error-description">
              <div className="Importer-error-description-title">Description</div>
              <div className="Importer-error-description-body">
                Fee fie foo fum
              </div>
            </div>
          </ImporterSection>
          <ImporterSection name="pipelines">
            <div className="Importer-processors">
              <div className="Importer-controls">
                <div className="Importer-filter">
                  <input className="Importer-filter-input" value={pipelineFilter} onChange={e => this.setState({pipelineFilter: e.target.value})} />
                  <div className="Importer-filter-icon icon-search"/>
                </div>
                <div className="Importer-add-processor" onClick={this.addProcessor}>
                  <div className="Importer-add-processor-icon icon-plus"/>
                </div>
              </div>
              { filteredPipeline.map(processor => (
                <div key={processor.id} className="Importer-zebra Importer-processor">
                  <div className={classnames('Importer-opener', 'icon-triangle-down', {isOpen: false, isSelected: false})} onClick={_ => this.toggle(processor.name)}/>
                  <div className="Importer-processor-name">{processor.name}</div>
                </div>
              ))}
            </div>
            <div className="Importer-processor-args">
              <div className="Importer-processor-args-controls">
                <div className="Importer-processor-args-title">Arguments</div>
                <div className="Importer-processor-args-save">
                  Save
                </div>
              </div>
              <div className="Importer-processor-args-body">
                { JSON.stringify({foo: 'bar', bim: 'bam'})}
              </div>
            </div>
          </ImporterSection>
          <ImporterSection name="tasks">
            <div className="Importer-controls">
              <div className="Importer-filter">
                <input className="Importer-filter-input" value={taskFilter} onChange={e => this.setState({taskFilter: e.target.value})} />
                <div className="Importer-filter-icon icon-search"/>
              </div>
              <div className="Importer-retry" onClick={this.retry} style={{marginRight: '40px'}}>
                <div className="Importer-retry-icon icon-playall"/><div>Retry</div>
              </div>
            </div>
            { filteredTasks.map(task => (
              <div key={task.id} className="Importer-zebra Importer-task">
                <div className="Importer-processor-name">{task.name}</div>
              </div>
            ))}
          </ImporterSection>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  job: state.jobs.isolated
}), dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
}))(Importer)
