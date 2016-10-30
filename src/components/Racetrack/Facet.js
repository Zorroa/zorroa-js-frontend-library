import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FACET_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import FilterHeader from './FilterHeader'
import Collapsible from '../Collapsible'
import DropdownMenu from '../DropdownMenu'

export const FacetHeader = (props) => (
  <FilterHeader icon="icon-bar-graph rotN90Flip" label={`Facet: ${props.field}`}
                onClose={props.onClose} />
)

FacetHeader.propTypes = {
  field: PropTypes.string.isRequired,
  onClose: PropTypes.func
}

const BAR_CHART = 'BAR'
const PIE_CHART = 'PIE'
const COL_CHART = 'COL'

// Manage a single term facet
class Facet extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired
  }

  state = {
    field: 'Disney.film.name.raw',
    buckets: [],
    selectedIndexes: [],
    maxValue: 0,
    minValue: 0,
    chartType: BAR_CHART
  }

  modifySliver = this.modifySliver.bind(this)

  modifySliver (event) {
    const type = FACET_WIDGET
    let sliver = new AssetSearch()
    sliver.filter = new AssetFilter({ terms: [this.state.field] })
    const widget = new Widget({id: this.props.id, type, sliver})
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

  render () {
    return (
      <Collapsible header={<FacetHeader field={this.state.field} onClose={this.removeFilter.bind(this)}/>} >
        <div className="facet flexCol">
          <div className="facet-controls flexRow flexJustifySpaceBetween">
            <DropdownMenu>
              <div>Filename</div>
              <div>Film</div>
              <div>Character</div>
            </DropdownMenu>
            <div className="facet-value-range flexRow flexJustifySpaceBetween">
              <div>1</div>
              <input type="range" min="1" max={this.state.maxValue} />
              <div>{this.state.maxValue}</div>
            </div>
          </div>
          <div className="facet-value-table flexOn">
            <table>
              <thead>
              <tr>
                <td>Keyword</td>
                <td>Count</td>
              </tr>
              </thead>
              <tbody>
              { this.state.buckets.map(bucket => (
                <tr>
                  <td>{bucket.name}</td>
                  <td>{bucket.value}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="facet-min-value">
            {this.state.minValue !== this.state.maxValue ? `Search is limited to >${this.state.minValue} results per keyword` : '' }
          </div>
          <div className="facet-footer flexRow flexJustifyCenter">
            <button style={{color: this.state.chartType === BAR_CHART ? '#fff' : '#808080', background: this.state.chartType === BAR_CHART ? '#a11d77' : '#fff'}} className="facet-icon icon-list" onClick={this.selectGraph.bind(this, 1)} />
            <button style={{color: this.state.chartType === PIE_CHART ? '#fff' : '#808080', background: this.state.chartType === PIE_CHART ? '#a11d77' : '#fff'}} className="facet-icon icon-pie-chart" onClick={this.selectGraph.bind(this, 2)} />
            <button style={{color: this.state.chartType === COL_CHART ? '#fff' : '#808080', background: this.state.chartType === COL_CHART ? '#a11d77' : '#fff'}} className="facet-icon icon-chart-growth" onClick={this.selectGraph.bind(this, 3)} />
          </div>
        </div>
      </Collapsible>
    )
  }
}

export default connect(
  state => ({

  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Facet)
