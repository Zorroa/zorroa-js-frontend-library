import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FACET_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'
import DisplayOptions from '../DisplayOptions'

const BAR_CHART = 'BAR'
const PIE_CHART = 'PIE'
const COL_CHART = 'COL'

// Manage a single term facet
class Facet extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    aggs: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(WidgetModel))
  }

  state = {
    field: '',
    terms: [],
    chartType: BAR_CHART,
    showDisplayOptions: false
  }

  componentWillMount () {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets[index]
    if (widget && widget.sliver) {
      const field = widget.sliver.aggs.facet.terms.field
      this.setState({field})
      if (widget.sliver.filter) {
        const terms = widget.sliver.filter.terms[field]
        this.setState({terms})
      }
    } else {
      this.setState({showDisplayOptions: true})
    }
  }

  modifySliver = (field, terms) => {
    const type = FACET_WIDGET
    const aggs = { facet: { terms: { field, size: 100 } } }
    let sliver = new AssetSearch({aggs})
    if (terms.length) {
      sliver.filter = new AssetFilter({terms: {[field]: terms}})
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  removeFilter () {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectGraph (type) {
    console.log('Selected facet graph type ' + type)
    switch (type) {
      case BAR_CHART:
        break
      case PIE_CHART:
        break
      case COL_CHART:
        break
    }
  }

  selectTerm (term) {
    let terms = [ ...this.state.terms ]
    const index = terms.indexOf(term)
    if (index >= 0) {
      terms.splice(index, 1)
    } else {
      terms.push(term)
    }
    this.setState({ ...this.state, terms })
    this.modifySliver(this.state.field, terms)
  }

  selectField (event) {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  updateDisplayOptions (event, state) {
    const base = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (base && base.length) {
      const field = base + '.raw'
      const terms = []
      this.setState({ ...this.state, field, terms })
      this.modifySliver(field, terms)
    }
  }

  dismissDisplayOptions () {
    this.setState({ showDisplayOptions: false })
  }

  render () {
    const { isIconified, aggs } = this.props
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    // Extract the buckets for this widget from the global query using id
    const buckets = aggs && (this.props.id in aggs) ? aggs[this.props.id].facet.buckets : []
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })
    const title = Asset.lastNamespace(unCamelCase(this.state.field))
    return (
      <Widget className="Facet"
              header={(
                <div className="Facet-header flexRow flexJustifySpaceBetween fullWidth">
                  <span>Facet: {title}</span>
                  <div onClick={this.selectField.bind(this)} className="icon-cog"></div>
                </div>
              )}
              isIconified={isIconified}
              icon='icon-bar-graph'
              onClose={this.removeFilter.bind(this)}>
        { this.state.showDisplayOptions && (
          <DisplayOptions selectedFields={[]}
                          title="Facet Fields"
                          singleSelection={true}
                          onUpdate={this.updateDisplayOptions.bind(this)}
                          onDismiss={this.dismissDisplayOptions.bind(this)}/>
        )}
        <div className="Facet-body flexCol">
        <div className="Facet-value-table flexOn">
            <table>
              <thead>
              <tr>
                <td>Keyword</td>
                <td>Count</td>
              </tr>
              </thead>
              <tbody>
              { buckets && buckets.map(bucket => (
                <tr className={classnames('Facet-value-table-row', {selected: this.state.terms.indexOf(bucket.key) >= 0})} key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
                  <td>{bucket.key}</td>
                  <td>{bucket.doc_count}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="Facet-min-value flexRow flexJustifyCenter">
            {minCount !== maxCount ? `Search is limited to >${minCount} results per keyword` : '' }
          </div>
          <div className="Facet-footer flexRow flexJustifyCenter">
            <button style={{color: this.state.chartType === BAR_CHART ? '#fff' : '#808080', background: this.state.chartType === BAR_CHART ? '#a11d77' : '#fff'}} className="Facet-icon icon-list" onClick={this.selectGraph.bind(this, 1)} />
            <button style={{color: this.state.chartType === PIE_CHART ? '#fff' : '#808080', background: this.state.chartType === PIE_CHART ? '#a11d77' : '#fff'}} className="Facet-icon icon-pie-chart" onClick={this.selectGraph.bind(this, 2)} />
            <button style={{color: this.state.chartType === COL_CHART ? '#fff' : '#808080', background: this.state.chartType === COL_CHART ? '#a11d77' : '#fff'}} className="Facet-icon icon-chart-growth" onClick={this.selectGraph.bind(this, 3)} />
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    aggs: state.assets && state.assets.aggs,
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Facet)
