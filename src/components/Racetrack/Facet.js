import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import WidgetModel from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FACET_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'
import DropdownMenu from '../DropdownMenu'

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
    chartType: BAR_CHART
  }

  modifySliver = this.modifySliver.bind(this)

  componentWillMount () {
    this.modifySliver()
  }

  modifySliver (term) {
    const type = FACET_WIDGET
    const aggs = { facet: { terms: { field: this.state.field } } }
    let sliver = new AssetSearch({aggs})
    if (term) {
      sliver.filter = new AssetFilter({terms: {[this.state.field]: [term]}})
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
    this.modifySliver(term)
  }

  render () {
    const { isIconified, buckets } = this.props
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })

    return (
      <Widget className="Facet"
              header={(<span>Facet: Keyword</span>)}
              isIconified={isIconified}
              icon='icon-bar-graph'
              onClose={this.removeFilter.bind(this)}>
        <div className="Facet-body flexCol">
          <div className="Facet-controls flexRow flexJustifySpaceBetween">
            <div className='Facet-sort'>
              <DropdownMenu label={this.state.field}>
                <div>Filename</div>
                <div>Film</div>
                <div>Character</div>
              </DropdownMenu>
            </div>
            <div className="flexOn" />
            <div className="Facet-value-range flexRow flexJustifySpaceBetween">
              <div>1</div>
              <input type="range" min="1" max={maxCount} style={{width: '60px'}} />
              <div>{maxCount}</div>
            </div>
          </div>
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
