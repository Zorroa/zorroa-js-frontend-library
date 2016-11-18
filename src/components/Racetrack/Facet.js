import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Text } from 'recharts'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FACET_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'
import DisplayOptions from '../DisplayOptions'

const BAR_CHART = 'icon-list'
const PIE_CHART = 'icon-pie-chart'
const COL_CHART = 'icon-chart-growth'
const chartTypes = [ BAR_CHART, PIE_CHART, COL_CHART ]

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
    const aggs = { facet: { terms: { field } } }
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

  selectGraph (chartType) {
    this.setState({ chartType })
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

  selectField = (event) => {
    this.setState({ showDisplayOptions: true })
    event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const base = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (base && base.length) {
      const field = base + '.raw'
      const terms = []
      this.setState({ ...this.state, field, terms })
      this.modifySliver(field, terms)
    }
  }

  dismissDisplayOptions = () => {
    this.setState({ showDisplayOptions: false })
  }

  renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const RADIAN = Math.PI / 180
    const s = radius * Math.cos(-midAngle * RADIAN)
    const t = radius * Math.sin(-midAngle * RADIAN)
    const r0 = 0.9
    const x0 = cx + r0 * s
    const y0 = cy + r0 * t
    const r1 = 1.7
    const x1 = cx + r1 * s
    const y1 = cy + r1 * t
    return (
      <svg>
        <svg>
          {
            percent > 0.05 &&
            <text x={x0} y={y0} fill="white"
                  textAnchor={x0 > cx ? 'start' : 'end'}
                  className="Facet-pie-pct" dominantBaseline="central">
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          }
          {
            percent > 0.025 &&
            <text x={x1} y={y1} fill="black"
                  textAnchor={x1 > cx ? 'start' : 'end'}
                  className="Facet-pie-label" dominantBaseline="central">
              { name }
            </text>
          }
        </svg>
      </svg>
    )
  }

  renderChart () {
    const { aggs } = this.props
    const { field, terms, chartType } = this.state
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    // Extract the buckets for this widget from the global query using id
    const buckets = aggs && (this.props.id in aggs) ? aggs[this.props.id].facet.buckets : []
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })
    const data = buckets.map(bucket => ({name: bucket.key, value: bucket.doc_count}))
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042',
      '#ce2d3f', '#fc6c2c', ' #a11e77', '#b7df4d', '#1875d1' ]
    switch (chartType) {
      case BAR_CHART:
        return (
          <div className="Facet-value-table">
            <table>
              <thead>
              <tr>
                <td>Keyword</td>
                <td>Count</td>
              </tr>
              </thead>
              <tbody>
              { buckets && buckets.map(bucket => (
                <tr className={classnames('Facet-value-table-row',
                  { selected: terms.indexOf(bucket.key) >= 0 })}
                    key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
                  <td>{bucket.key}</td>
                  <td>{bucket.doc_count}</td>
                </tr>
              )) }
              </tbody>
            </table>
          </div>
        )

      case PIE_CHART:
        return (
          <div className="Facet-pie-chart">
            <ResponsiveContainer>
              <PieChart width={300} height={300}>
                <Pie innerRadius={40} outerRadius={80} paddingAngle={0}
                     animationBegin={100}
                     animationDuration={500}
                     label={this.renderPieLabel}
                     data={data} onClick={this.selectTerm.bind(this)}>
                  { data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>) }
                  <Tooltip/>
                </Pie>
                <Text>{field}</Text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )

      case COL_CHART:
        return (
          <div>Col</div>
        )
    }
  }

  renderChartIcon (type) {
    const { chartType } = this.state
    const selected = chartType === type
    return (
      <button className={classnames('Facet-icon', type, {selected})}
              key={type} onClick={this.selectGraph.bind(this, type)} />
    )
  }

  render () {
    const { isIconified } = this.props
    const { field, minCount, showDisplayOptions } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className="Facet"
              header={(
                <div className="Facet-header flexRow flexJustifySpaceBetween fullWidth">
                  <span>Facet: {title}</span>
                  <div onClick={this.selectField} className="icon-cog"></div>
                </div>
              )}
              isIconified={isIconified}
              icon='icon-bar-graph'
              onClose={this.removeFilter.bind(this)}>
        { showDisplayOptions && (
          <DisplayOptions selectedFields={[]}
                          title="Facet Fields"
                          singleSelection={true}
                          onUpdate={this.updateDisplayOptions}
                          onDismiss={this.dismissDisplayOptions}/>
        )}
        <div className="Facet-body flexCol">
          { this.renderChart() }
          <div className="Facet-min-value flexRow flexJustifyCenter">
            {minCount && `Search is limited to >${minCount} results per keyword` }
          </div>
          <div className="Facet-footer flexRow flexJustifyCenter">
            { chartTypes.map(type => this.renderChartIcon(type)) }
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
