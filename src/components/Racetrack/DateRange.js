import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { DateRangeWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import DisplayOptions from '../DisplayOptions'
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
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  resizer = null
  minLeft = null
  minRight = null

  state = {
    field: '',
    min: null, // min threshold (greater than)
    max: null, // max threshold (less than)
    minStr: null,
    maxStr: null
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps, selectFieldIfEmpty) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      if (widget.sliver.filter && widget.sliver.filter.range) {
        const range = widget.sliver.filter.range
        const keys = Object.keys(range)
        assert.ok(keys.length === 1) // there should only be one entry here
        const field = keys[0]
        const minStr = range[field].gte
        const maxStr = range[field].lte
        const min = moment(minStr, format).toDate()
        const max = moment(maxStr, format).toDate()
        if (minStr !== this.state.minStr && maxStr !== this.state.maxStr) {
          this.setState({ min, max, minStr, maxStr }, () => { requestAnimationFrame(this.modifySliver) })
        }
      }
    } else {
      if (selectFieldIfEmpty) {
        this.selectField()
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    this.syncWithAppState(nextProps)
  }

  componentWillMount () {
    this.resizer = new Resizer()
    this.syncWithAppState(this.props, true)
  }

  componentWillUnmount () {
    this.resizer.release()
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectField = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={['date']}
                                 selectedFields={[]}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const field = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    let { usePrefix } = this.state
    if (field && field.length) {
      if (field === 'source.fileSize') usePrefix = 'bin'
      this.setState({ field, usePrefix })
    }
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
    const { field, min, max, minStr, maxStr } = this.state
    if (!field || !min || !max || !minStr || !maxStr) return
    const type = DateRangeWidgetInfo.type

    let sliver = new AssetSearch({ })
    if (field) {
      const range = { [field]: { 'gte': minStr, 'lte': maxStr } }
      sliver.filter = new AssetFilter({ range })
    }
    const widget = new WidgetModel({ id: this.props.id, type, sliver })
    this.props.actions.modifyRacetrackWidget(widget)
  }

  render () {
    const { isIconified, id } = this.props
    const { field } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))

    return (
      <Widget className='DateRange'
              header={(
                <div className="DateRange-header">
                  <div className="DateRange-header-label">
                    <span className="DateRange-header-title">{DateRangeWidgetInfo.title}{field.length ? ':' : ''}</span>
                    <span className="DateRange-header-field">{title}</span>
                  </div>
                  <div onClick={this.selectField} className="DateRange-settings icon-cog"/>
                </div>
              )}
              backgroundColor={DateRangeWidgetInfo.color}
              isIconified={isIconified}
              icon={DateRangeWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
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
  actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
})

const mapStateToProps = state => ({
  aggs: state.assets && state.assets.aggs,
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(DateRange)
