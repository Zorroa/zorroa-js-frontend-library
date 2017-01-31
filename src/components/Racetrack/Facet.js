import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Text, Sector } from 'recharts'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FacetWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'
import DisplayOptions from '../DisplayOptions'

const BAR_CHART = 'icon-list'
const PIE_CHART = 'icon-pie-chart'
const chartTypes = [ BAR_CHART, PIE_CHART ]
const OTHER_BUCKET = 'Other'

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
    order: { '_count': 'desc' },
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
      const order = widget.sliver.aggs.facet.terms.order
      this.setState({order})
    } else {
      this.selectField()
    }
  }

  modifySliver = (field, terms, order) => {
    const type = FacetWidgetInfo.type
    const aggs = { facet: { terms: { field, order, size: 100 } } }
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

  selectTerm (term, event) {
    let terms = []
    if (term === OTHER_BUCKET) {
      const buckets = this.aggBuckets()
      const merged = this.mergeOtherBuckets(buckets, 9)
      let otherTerms = []
      buckets.forEach(bucket => {
        if (merged.findIndex(b => (b.key === bucket.key)) < 0) {
          otherTerms.push(bucket.key)
        }
      })
      terms = event.metaKey || event.shiftKey ? [...this.state.terms] : []
      let isOtherEnabled = false
      for (let i = 0; i < this.state.terms.length; ++i) {
        const term = this.state.terms[i]
        const index = merged.findIndex(bucket => (bucket.key === term))
        if (index < 0) {
          isOtherEnabled = true
          break
        }
      }
      otherTerms.forEach(term => {
        const index = terms.findIndex(t => (t === term))
        if (isOtherEnabled) {
          if (index >= 0) terms.splice(index, 1)
        } else {
          if (index < 0) terms.push(term)
        }
      })
    } else if (event.shiftKey) {
      const buckets = this.aggBuckets()
      const firstSelectedIndex = buckets.findIndex(b => (this.state.terms.findIndex(t => (t === b.key)) >= 0))
      if (firstSelectedIndex >= 0) {
        const selectedIndex = buckets.findIndex(b => (b.key === term))
        const minIndex = Math.min(selectedIndex, firstSelectedIndex)
        const maxIndex = Math.max(selectedIndex, firstSelectedIndex)
        terms = buckets.slice(minIndex, maxIndex + 1).map(bucket => bucket.key)
        // prevent shift-click term selection from natively selecting text
        window.getSelection().removeAllRanges()
      }
    } else if (event.metaKey) {
      const index = this.state.terms.findIndex(t => (t === term))
      if (index >= 0) {
        terms = [...this.state.terms]
        terms.splice(index, 1)
      } else {
        terms = [...this.state.terms]
        terms.push(term)
      }
    } else {
      // single click on a single selected term will deselect, otherwise select the clicked term
      if (!(this.state.terms && this.state.terms.length === 1 && this.state.terms[0] === term)) {
        terms = [term]
      }
    }
    this.modifySliver(this.state.field, terms, this.state.order)
  }

  selectPieSection = ({ name }, i, event) => {
    this.selectTerm(name, event)
  }

  selectField = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Facet Fields'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={null}
                                 selectedFields={[]}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
  }

  deselectAllTerms = (event) => {
    this.modifySliver(this.state.field, [], this.state.order)
  }

  rotateOrder (order, field, dir) {
    if (order[field] === 'asc') return { [field]: 'desc' }
    if (order[field] === 'desc') return { [field]: 'asc' }
    return { [field]: dir }
  }

  sortBuckets (column) {
    const { field, terms, order } = this.state
    const sortField = { 'keyword': '_term', 'count': '_count' }
    const dir = { 'keyword': 'asc', 'count': 'desc' }
    let newOrder = this.rotateOrder(order, sortField[column], dir[column])
    this.setState({ order: newOrder })
    this.modifySliver(field, terms, newOrder)
  }

  updateDisplayOptions = (event, state) => {
    const base = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (base && base.length) {
      const field = base + '.raw'
      const terms = []
      this.modifySliver(field, terms, this.state.order)
    }
  }

  aggBuckets () {
    const { id, aggs } = this.props
    let buckets = aggs && (id in aggs) ? aggs[id].facet.buckets : []

    // Add in any selected terms that are not in the search agg
    const { terms } = this.state
    terms && terms.forEach(key => {
      const index = buckets.findIndex(bucket => (bucket.key === key))
      if (index < 0) {
        buckets.unshift({key, doc_count: 1})  // FIXME: Arbitrary doc_count
      }
    })

    return buckets
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
                { name || '(none)' }
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

  renderHeaderCell (column) {
    const { order } = this.state
    const sortField = { 'keyword': '_term', 'count': '_count' }
    const dir = order[sortField[column]]
    const icon = 'Facet-table-header-count icon-sort' + (dir ? `-${dir}` : '')
    return (
      <td onClick={this.sortBuckets.bind(this, column)} className="Facet-table-header-cell">
        <div className="Facet-table-header-title">{column}</div>
        <div className={icon}/>
      </td>
    )
  }

  renderClearSelection () {
    const { terms } = this.state
    if (!terms || terms.length === 0) return <div className="Facet-clear-selection"/>
    return (
      <div className="Facet-clear-selection">
        { `${terms.length} facets selected` }
        <div onClick={this.deselectAllTerms} className="Facet-clear-selection-cancel icon-cancel-circle"/>
      </div>
    )
  }

  mergeOtherBuckets (buckets, maxCount) {
    if (buckets.length <= maxCount || this.state.chartType === BAR_CHART) return buckets
    // Keep the order, but group the smallest ones into "Other"
    const sorted = buckets.sort((a, b) => (a.doc_count < b.doc_count ? 1 : (a.doc_count > b.doc_count ? -1 : 0)))
    let otherCount = 0
    for (let i = maxCount; i < buckets.length; ++i) otherCount += sorted[i].doc_count
    let merged = []
    buckets.forEach(bucket => {
      if (sorted.findIndex(b => (bucket.key === b.key)) < maxCount) {
        merged.push(bucket)
      }
    })
    merged.push({ key: OTHER_BUCKET, doc_count: otherCount })
    return merged
  }

  renderChart () {
    const { field, terms, chartType } = this.state
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    // Extract the buckets for this widget from the global query using id
    const buckets = this.mergeOtherBuckets(this.aggBuckets(), chartType === BAR_CHART ? 100 : 9)
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })
    // Only animate when the buckets change, cached in class variable, not state
    const animate = JSON.stringify(buckets) !== JSON.stringify(this.buckets)
    this.buckets = buckets
    const mergedTerms = terms.filter(t => (buckets.findIndex(b => (b.key === t)) >= 0))
    if (mergedTerms.length < terms.length) mergedTerms.push(OTHER_BUCKET)
    const data = buckets.map(bucket => ({name: bucket.key, value: bucket.doc_count}))
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042',
      '#ce2d3f', '#fc6c2c', ' #a11e77', '#b7df4d', '#1875d1' ]
    switch (chartType) {
      case BAR_CHART:
        return (
          <div className="Facet-table">
            <div className="Facet-table-header">
              { this.renderHeaderCell('keyword') }
              { this.renderHeaderCell('count') }
            </div>
            <div className="Facet-value-table">
              <table>
                <tbody>
                { buckets && buckets.map(bucket => (
                  <tr className={classnames('Facet-value-table-row',
                    { selected: mergedTerms.indexOf(bucket.key) >= 0 })}
                      key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
                    <td className="Facet-value-cell">
                      <div className="Facet-value-table-key">
                        <div className="Facet-value-pct-bar" style={{width: `${100 * bucket.doc_count / maxCount}%`}} />
                        <div className="Facet-value-key">{bucket.key || '(none)'}</div>
                      </div>
                    </td>
                    <td className="Facet-value-count">{bucket.doc_count}</td>
                  </tr>
                )) }
                </tbody>
              </table>
            </div>
          </div>
        )

      case PIE_CHART:
        const activeIndex = mergedTerms.map((term, index) => (buckets.findIndex(bucket => (bucket.key === term))))
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
    const { field } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className="Facet"
              header={(
                <div className="Facet-header">
                  <div className="Facet-header-label">
                    <span className="Facet-header-title">Facet:</span>
                    <span className="Facet-header-field">{title}</span>
                  </div>
                  <div onClick={this.selectField} className="Facet-settings icon-cog"/>
                </div>
              )}
              backgroundColor={FacetWidgetInfo.color}
              isIconified={isIconified}
              icon={FacetWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Facet-body flexCol">
          { this.renderChart() }
          { this.renderClearSelection() }
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
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
  })
)(Facet)
