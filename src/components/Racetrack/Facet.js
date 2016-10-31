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
                onClose={props.onClose} isIconified={props.isIconified} />
)

FacetHeader.propTypes = {
  field: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  isIconified: PropTypes.bool.isRequired
}

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
    sliver.filter = new AssetFilter(term ? { terms: {[this.state.field]: [term]} } : {})
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

  selectTerm (term) {
    console.log('Select term: ' + term)
    this.modifySliver(term)
  }

  renderHeader (isIconified) {
    return (
      <FacetHeader field={this.state.field} isIconified={isIconified}
                   onClose={this.removeFilter.bind(this)}/>
    )
  }

  render () {
    const { isIconified, buckets } = this.props
    if (isIconified) {
      // Never render the body when iconified
      return this.renderHeader(isIconified)
    }
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })

    return (
      <Collapsible header={this.renderHeader(isIconified)} >
        <div className="facet flexCol">
          <div className="facet-controls flexRow flexJustifySpaceBetween">
            <DropdownMenu label={this.state.field}>
              <div>Filename</div>
              <div>Film</div>
              <div>Character</div>
            </DropdownMenu>
            <div className="facet-value-range flexRow flexJustifySpaceBetween">
              <div>1</div>
              <input type="range" min="1" max={maxCount} />
              <div>{maxCount}</div>
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
              { buckets && buckets.map(bucket => (
                <tr className="facet-value-table-row" key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
                  <td>{bucket.key}</td>
                  <td>{bucket.doc_count}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="facet-min-value flexRow flexJustifyCenter">
            {minCount !== maxCount ? `Search is limited to >${minCount} results per keyword` : '' }
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
    buckets: state.assets && state.assets.aggs && state.assets.aggs.facet ? state.assets.aggs.facet.buckets : []
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Facet)
