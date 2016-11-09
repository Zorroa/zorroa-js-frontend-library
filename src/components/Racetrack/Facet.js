import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

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
    buckets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    field: 'Disney.film.name.raw',
    selectedIndexes: [],
    chartType: BAR_CHART,
    showDisplayOptions: false
  }

  modifySliver = this.modifySliver.bind(this)

  componentWillMount () {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  modifySliver (field, term) {
    const type = FACET_WIDGET
    const aggs = { facet: { terms: { field } } }
    let sliver = new AssetSearch({aggs})
    if (term) {
      sliver.filter = new AssetFilter({terms: {[field]: [term]}})
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
    console.log('Select term: ' + term)
    this.modifySliver(this.state.field, term)
  }

  selectField (event) {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  updateDisplayOptions (event, state) {
    console.log('Update facet fields:\n' + JSON.stringify(state.checkedNamespaces))
    const base = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (base && base.length) {
      const field = base + '.raw'
      this.setState({...this.state, field})
      this.modifySliver(field)
    }
  }

  dismissDisplayOptions () {
    this.setState({ showDisplayOptions: false })
  }

  render () {
    const { isIconified, buckets } = this.props
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
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
                <tr className="Facet-value-table-row" key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
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
    buckets: state.assets && state.assets.aggs && state.assets.aggs.facet ? state.assets.aggs.facet.buckets : []
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Facet)
