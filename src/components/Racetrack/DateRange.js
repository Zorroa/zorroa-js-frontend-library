import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'

import { createDateRangeWidget } from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { DateRangeWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'
import Resizer from '../../services/Resizer'

// https://jquense.github.io/react-widgets/docs/#/i18n?_k=quwfao
import moment from 'moment'
import momentLocalizer from 'react-widgets/lib/localizers/moment'
momentLocalizer(moment)
const format = 'Y/MM/DD'

class DateRange extends Component {
  static propTypes = {
    aggs: PropTypes.object,
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  resizer = null

  state = {
    field: '',
    min: null, // min threshold (greater than)
    max: null, // max threshold (less than)
    minStr: null,
    maxStr: null
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget) {
      const field = widget.field
      if (field && widget.sliver && widget.sliver.filter && widget.sliver.filter.range) {
        const range = widget.sliver.filter.range[field]
        if (range) {
          const minStr = range.gte
          const maxStr = range.lte
          const min = moment(minStr, format).toDate()
          const max = moment(maxStr, format).toDate()
          this.setState({field, min, max, minStr, maxStr})
        }
      } else if (!this.state.field || this.state.field !== field) {
        this.setState({field, min: null, max: null, minStr: null, maxStr: null})
      }
    } else if (nextProps.aggs) {
      const field = this.aggField(nextProps)
      if (field && (!this.state.field || field !== this.state.field)) {
        const range = this.aggRange(field)
        if (range) {
          const minStr = range.min
          const maxStr = range.max
          const min = moment(minStr, format).toDate()
          const max = moment(maxStr, format).toDate()
          this.setState({field, min, max, minStr, maxStr})
        }
      }
    }
  }

  aggField = (props) => {
    const { aggs, id } = props
    if (!aggs) return
    const agg = aggs[id]
    if (!agg) return
    const keys = Object.keys(agg)
    const idx = keys.findIndex(key => typeof agg[key] === 'object')
    return keys[idx]
  }

  aggRange = (field) => {
    const { aggs, id } = this.props
    if (!aggs) return
    const agg = aggs[id]
    if (!agg) return
    return agg[field]
  }

  componentWillReceiveProps (nextProps) {
    this.syncWithAppState(nextProps)
  }

  componentWillMount () {
    this.resizer = new Resizer()
    this.syncWithAppState(this.props)
  }

  componentWillUnmount () {
    this.resizer.release()
  }

  setMin = (optDate, dateStr) => {
    if (!optDate) return
    this.setStatePromise({ min: optDate, minStr: dateStr })
      .then(_ => this.modifySliver())
  }

  setMax = (optDate, dateStr) => {
    if (!optDate) return
    this.setStatePromise({ max: optDate, maxStr: dateStr })
      .then(_ => this.modifySliver())
  }

  setInterval = interval => {
    // Subtract 1 of $interval. For example if interval === 'month' this
    // will subtract 1 month from the current date
    const minStr = moment().subtract(1, interval).format(format)
    const maxStr = moment().format(format)
    const min = moment(minStr, format).toDate()
    const max = moment(maxStr, format).toDate()
    if (minStr !== this.state.minStr || maxStr !== this.state.maxStr) {
      this.setStatePromise({ min, max, minStr, maxStr })
        .then(_ => this.modifySliver())
    }
  }

  modifySliver = () => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const { field, min, max, minStr, maxStr } = this.state
    if (!field || !min || !max || !minStr || !maxStr) return
    const widget = createDateRangeWidget(field, 'date', minStr, maxStr, isEnabled, isPinned)
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  render () {
    const { isIconified, id, floatBody, isOpen, onOpen } = this.props
    const { field } = this.state
    const lastName = Asset.lastNamespace(unCamelCase(field))
    const title = lastName
    const label = undefined
    const intervals = ['day', 'week', 'month', 'year']

    return (
      <Widget className='DateRange'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={title}
              field={label}
              backgroundColor={DateRangeWidgetInfo.color}
              isIconified={isIconified}
              icon={DateRangeWidgetInfo.icon}>
        <div className="DateRange-body">
          <div className="DateRange-row flexRowCenter">
            <DateTimePicker
              className="DateRange-min"
              format={format}
              id={`DateRange-min-${id}`}
              time={false}
              onChange={this.setMin}
              value={this.state.min}
            />
            <span className="DateRange-label">-</span>
            <DateTimePicker
              className="DateRange-max"
              format={format}
              id={`DateRange-min-${id}`}
              time={false}
              onChange={this.setMax}
              value={this.state.max}
            />
            <div className="DateRange-go" onClick={this.modifySliver}>GO</div>
          </div>
        </div>
        <div className="DateRange-settings">
          <div className="DateRange-label">Last:</div>
          {intervals.map(interval => (
            <div
              className="DateRange-setting"
              key={interval}
              onClick={() => this.setInterval(interval)
            }>
              {interval}
            </div>))}
        </div>
      </Widget>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
})

const mapStateToProps = state => ({
  aggs: state.assets && state.assets.aggs,
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(DateRange)
