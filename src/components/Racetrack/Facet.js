import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Text, Sector } from 'recharts'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FACET_WIDGET } from '../../constants/widgetTypes'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showDisplayOptionsModal } from '../../actions/appActions'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'

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
    chartType: BAR_CHART
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      const field = widget.sliver.aggs.facet.terms.field
      if (field !== this.state.field) {
        this.setState({field})
      }
      if (widget.sliver.filter) {
        const terms = widget.sliver.filter.terms[field]
        if (terms !== this.state.terms) {
          this.setState({terms})
        }
      } else {
        this.setState({terms: []})
      }
    } else {
      this.selectField()
    }
  }

  modifySliver = (field, terms) => {
    const type = FACET_WIDGET
    const aggs = { facet: { terms: { field, size: 100 } } }
    let sliver = new AssetSearch({aggs})
    if (terms && terms.length) {
      sliver.filter = new AssetFilter({terms: {[field]: terms}})
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectGraph (chartType) {
    if (chartType !== this.state.chartType) {
      this.setState({chartType})
      this.buckets = null
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
    this.modifySliver(this.state.field, terms)
  }

  selectPieSection = ({ name }) => {
    this.selectTerm(name)
  }

  selectField = (event) => {
    const syncLabel = null
    const singleSelection = true
    const selectedFields = []
    const fieldTypes = null
    this.props.actions.showDisplayOptionsModal('Facet Fields', syncLabel,
      selectedFields, singleSelection, fieldTypes, this.updateDisplayOptions)
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const base = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (base && base.length) {
      const field = base + '.raw'
      const terms = []
      this.modifySliver(field, terms)
    }
  }

  renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }) => {
    const { terms } = this.state
    const RADIAN = Math.PI / 180
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const r0 = 15
    const r1 = 10
    const r2 = 20
    const x0 = cx + (innerRadius + r0) * cos
    const y0 = cy + (innerRadius + r0) * sin
    const sx = cx + (outerRadius + r1) * cos
    const sy = cy + (outerRadius + r1) * sin
    const mx = cx + (outerRadius + r2) * cos
    const my = cy + (outerRadius + r2) * sin
    const ox = 5
    const ex = mx + (cos >= 0 ? 1 : -1) * ox
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <svg>
        <svg>
          {
            percent > 0.05 &&
            <text x={x0} y={y0}
                  textAnchor="middle"
                  className="Facet-pie-pct" dominantBaseline="central">
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          }
          {
            percent > 0.025 && terms.indexOf(name) < 0 &&
            <svg>
              <text x={ex} y={ey}
                    textAnchor={textAnchor}
                    className="Facet-pie-label" dominantBaseline="central">
                { name }
              </text>
              <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
            </svg>
          }
        </svg>
      </svg>
    )
  }

  renderActivePieSectionShape = ({ cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name }) => {
    const RADIAN = Math.PI / 180
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const r0 = 10
    const r1 = 20
    const ox = 5
    const sx = cx + (outerRadius + r0) * cos
    const sy = cy + (outerRadius + r0) * sin
    const mx = cx + (outerRadius + r1) * cos
    const my = cy + (outerRadius + r1) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * ox
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} className="Facet-pie-label active" dominantBaseline="central">{name}</text>
      </g>
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
    // Only animate when the buckets change, cached in class variable, not state
    const animate = JSON.stringify(buckets) !== JSON.stringify(this.buckets)
    this.buckets = buckets
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
        const activeIndex = terms.map((term, index) => (buckets.findIndex(bucket => (bucket.key === term))))
        return (
          <div className="Facet-pie-chart">
            <ResponsiveContainer>
              <PieChart width={300} height={300}>
                <Pie innerRadius={30} outerRadius={60} paddingAngle={0}
                     isAnimationActive={animate}
                     animationBegin={100}
                     animationDuration={500}
                     activeIndex={activeIndex} activeShape={this.renderActivePieSectionShape}
                     label={this.renderPieLabel} labelLine={false}
                     data={data} onClick={this.selectPieSection}>
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
    const { field, minCount } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className="Facet"
              header={(
                <div className="Facet-header flexRow flexJustifySpaceBetween fullWidth">
                  <span>Facet: {title}</span>
                  <div onClick={this.selectField} className="Facet-settings icon-cog"></div>
                </div>
              )}
              isIconified={isIconified}
              icon='icon-bar-graph'
              onClose={this.removeFilter.bind(this)}>
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
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showDisplayOptionsModal }, dispatch)
  })
)(Facet)
