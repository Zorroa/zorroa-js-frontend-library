import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { RangeWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import Toggle from '../Toggle'
import DisplayOptions from '../DisplayOptions'
import { unCamelCase } from '../../services/jsUtil'

class Range extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    field: '',
    gt: null, // min threshold (greater than)
    lt: null, // max threshold (less than)
    isGte: false, // whether min is inclusive (greater than or equal to)
    isLte: false // whether max is inclusive (less than or equal to)
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps, selectFieldIfEmpty) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    let range = null
    try { range = widget.sliver.filter.range } catch (e) { }
    if (range) {
      const keys = Object.keys(range)
      assert.ok(keys.length === 1) // there should only be one entry here
      const field = keys[0]
      const isLte = 'lte' in range[field]
      const isGte = 'gte' in range[field]
      const gt = (isGte) ? range[field].gte : range[field].gt // ok if null (neither gt,gte exists)
      const lt = (isLte) ? range[field].lte : range[field].lt // ok if null (neither lt,lte exists)
      this.setState({ field, isGte, isLte, gt, lt })
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
    this.syncWithAppState(this.props, true)
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  modifySliver = () => {
    const { field, gt, lt, isGte, isLte } = this.state
    if (!field) return
    const type = RangeWidgetInfo.type
    const sliver = new AssetSearch()
    if (field && (gt || lt)) {
      let range = { [field]: {} }
      if (gt) range[field][ isGte ? 'gte' : 'gt' ] = gt
      if (lt) range[field][ isLte ? 'lte' : 'lt' ] = lt
      sliver.filter = new AssetFilter({ range })
    }
    const widget = new WidgetModel({ id: this.props.id, type, sliver })
    this.props.actions.modifyRacetrackWidget(widget)
  }

  selectField = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={['integer', 'double', 'long']}
                                 selectedFields={[]}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const field = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (field && field.length) {
      this.setState({ field })
    }
  }

  inputUpdate = (event) => {
    var input = event.target
    var value = input.value
    var key = input.dataset.range
    this.setState({ [key]: value })
  }

  render () {
    const { isIconified, id } = this.props
    const { field, gt, lt } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))

    // If both values gt & lt are set, then provide a default step size
    // that is the closest single digit to ~10% of the difference,
    const step = (gt && lt)
      ? Math.pow(10, Math.round(Math.log10(Math.max(lt, gt) - Math.min(lt, gt)) - 1))
      : 0

    return (
      <Widget className='Range'
              header={(
                <div className="Range-header">
                  <div className="Range-header-label">
                    <span className="Range-header-title">{RangeWidgetInfo.title}{field.length ? ':' : ''}</span>
                    <span className="Range-header-field">{title}</span>
                  </div>
                  <div onClick={this.selectField} className="Range-settings icon-cog"/>
                </div>
              )}
              backgroundColor={RangeWidgetInfo.color}
              isIconified={isIconified}
              icon={RangeWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Range-body">
          <div className="Range-row flexRowCenter">
            <span className="Range-label">&gt;</span>
            <Toggle checked={this.state.isGte} onChange={event => this.setState({isGte: event.target.checked}, this.modifySliver)} />
            <span className="Range-label">&gt;=</span>
            <input id={`Range-gt-${id}`}
                   type="number"
                   step={step}
                   placeholder={this.state.isGte ? '>=' : '>'}
                   value={this.state.gt}
                   onKeyPress={event => { if (event.key === 'Enter') { this.modifySliver() } }}
                   onBlur={this.modifySliver}
                   data-range="gt"
                   onChange={this.inputUpdate} />
          </div>

          <div className="Range-row flexRowCenter">
            <span className="Range-label">&lt;</span>
            <Toggle checked={this.state.isLte} onChange={event => this.setState({isLte: event.target.checked}, this.modifySliver)} />
            <span className="Range-label">&lt;=</span>
            <input id={`Range-gt-${id}`}
                   type="number"
                   step={step}
                   placeholder={this.state.isLte ? '<=' : '<'}
                   value={this.state.lt}
                   onKeyPress={event => { if (event.key === 'Enter') { this.modifySliver() } }}
                   onBlur={this.modifySliver}
                   data-range="lt"
                   onChange={this.inputUpdate} />
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
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Range)
