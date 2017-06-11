import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'
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
    if (widget && widget.sliver) {
      if (widget.sliver.filter && widget.sliver.filter.range) {
        const range = widget.sliver.filter.range
        const keys = Object.keys(range)
        assert.ok(keys.length === 1) // there should only be one entry here
        const field = keys[0]
        const minStr = range[field].gte || moment().subtract(1, 'days').format(format)
        const maxStr = range[field].lte || moment().format(format)
        const min = moment(minStr, format).toDate()
        const max = moment(maxStr, format).toDate()
        if (minStr !== this.state.minStr && maxStr !== this.state.maxStr) {
          this.setStatePromise({ min, max, minStr, maxStr })
            .then(() => requestAnimationFrame(this.modifySliver))
        }
        if (field !== this.state.field) {
          this.setStatePromise({ field })
            .then(() => requestAnimationFrame(this.modifySliver))
        }
      }
    }
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
    this.setState({ min: optDate, minStr: dateStr })
  }

  setMax = (optDate, dateStr) => {
    if (!optDate) return
    this.setState({ max: optDate, maxStr: dateStr })
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
    const title = Asset.lastNamespace(unCamelCase(field))

    return (
      <Widget className='DateRange'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={DateRangeWidgetInfo.title}
              field={title}
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
