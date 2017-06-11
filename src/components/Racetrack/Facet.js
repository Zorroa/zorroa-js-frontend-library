import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Text, Sector } from 'recharts'

import { createFacetWidget, aggField } from '../../models/Widget'
import Asset from '../../models/Asset'
import { FacetWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'

const BAR_CHART = 'icon-list'
const PIE_CHART = 'icon-pie-chart'
const chartTypes = [ BAR_CHART, PIE_CHART ]
const OTHER_BUCKET = 'Other'
const MAX_BAR_BUCKETS = 100
const MAX_PIE_BUCKETS = 9

// Manage a single term facet
class Facet extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    aggs: PropTypes.object,
    fieldTypes: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    otherIsSelected: false,
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
      const f = widget.sliver.aggs.facet.terms.field
      const fraw = f && f.length && f.replace(/\.raw/, '')
      const fieldType = fraw && this.props.fieldTypes && this.props.fieldTypes[fraw]
      const field = aggField(f, fieldType)
      if (field !== this.state.field) {
        this.setState({field})
      }
      if (widget.sliver.filter) {
        const terms = widget.sliver.filter.terms[field]
        if (terms !== this.state.terms) {
          // determine whether any of the current terms are in the "other" bucket
          let otherIsSelected = false
          const buckets = this.aggBuckets(this.state.terms)
          const merged = this.mergeOtherBuckets(buckets, MAX_PIE_BUCKETS)
          let otherTerms = new Set()
          buckets.forEach(bucket => {
            if (merged.findIndex(b => (b.key === bucket.key)) < 0) {
              otherTerms.add(bucket.key)
            }
          })
          for (let i = 0; i < terms.length; i++) {
            if (otherTerms.has(terms[i])) {
              otherIsSelected = true
              break
            }
          }
          if (widget.isEnabled) this.setState({terms, otherIsSelected})
        }
      } else if (widget.isEnabled) {
        this.setState({terms: [], otherIsSelected: false})
      }
      if (widget.isEnabled) {
        const order = widget.sliver.aggs.facet.terms.order
        if (order) this.setState({order})
      }
    }
  }

  modifySliver = (field, terms, order) => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const fieldType = this.props.fieldTypes[field.replace(/\.raw$/, '')]
    const widget = createFacetWidget(field, fieldType, terms, order, isEnabled, isPinned)
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  selectGraph (chartType) {
    if (chartType !== this.state.chartType) {
      this.setState({chartType})
      this.buckets = null
    }
  }

  selectTerm = (term, event) => {
    let terms = []
    if (term === OTHER_BUCKET) {
      const buckets = this.aggBuckets(this.state.terms)
      const merged = this.mergeOtherBuckets(buckets, MAX_PIE_BUCKETS)
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
      const buckets = this.aggBuckets(this.state.terms)
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

  deselectAllTerms = () => {
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

  baseBuckets () {
    const { id, aggs } = this.props
    return aggs && (id in aggs) ? aggs[id].facet.buckets : []
  }

  aggBuckets (terms) {
    const buckets = this.baseBuckets()

    // Add in any selected terms that are not in the search agg
    terms && terms.forEach(key => {
      const index = buckets.findIndex(bucket => (bucket.key === key))
      if (index < 0) {
        buckets.unshift({key, doc_count: 1})  // FIXME: Arbitrary doc_count
      }
    })

    return buckets
  }

  renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }) => {
    const { terms, otherIsSelected } = this.state
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
            percent > 0.025 && terms.indexOf(name) < 0 && !(name === OTHER_BUCKET && otherIsSelected) &&
            <svg>
              <text x={ex} y={ey}
                    textAnchor={textAnchor}
                    className="Facet-pie-label" dominantBaseline="central">
                { this.renderBucketKey(name) }
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
        <text x={ex + (cos >= 0 ? 1 : -1) * 12}
              y={ey}
              textAnchor={textAnchor}
              className="Facet-pie-label active"
              dominantBaseline="central">
          {this.renderBucketKey(name)}
        </text>
      </g>
    )
  }

  renderHeaderCell (column) {
    const { order } = this.state
    const sortField = { 'keyword': '_term', 'count': '_count' }
    const dir = order[sortField[column]]
    const icon = 'Facet-table-header-count icon-sort' + (dir ? `-${dir}` : '')
    return (
      <div onClick={this.sortBuckets.bind(this, column)} className="Facet-table-header-cell">
        <div className="Facet-table-header-title">{column}</div>
        <div className={icon}/>
      </div>
    )
  }

  renderClearSelection () {
    const { terms } = this.state
    if (!this.baseBuckets().length) return
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
    const sorted = buckets.sort((a, b) => {
      if (a.doc_count < b.doc_count) return 1
      if (a.doc_count > b.doc_count) return -1
      if (a.key < b.key) return 1
      if (a.key > b.key) return -1
      return 0
    })
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

  renderBucketKey = (key) => {
    if (key === OTHER_BUCKET) return key
    const field = this.state.field && this.state.field.replace(/\.raw$/, '')
    const fieldType = this.props.fieldTypes && this.props.fieldTypes[field]
    if (fieldType === 'boolean') return key ? 'true' : 'false'
    if (!key) return '(none)'
    if (fieldType === 'date') return new Date(key).toLocaleString()
    return key
  }

  renderChart () {
    const { field, terms, chartType } = this.state
    let maxCount = 0
    let minCount = Number.MAX_SAFE_INTEGER
    // Extract the buckets for this widget from the global query using id
    const buckets = this.mergeOtherBuckets(this.aggBuckets(terms), chartType === BAR_CHART ? MAX_BAR_BUCKETS : MAX_PIE_BUCKETS)
    if (!buckets || !buckets.length) {
      return (
        <div className="Facet-empty">
          <div className="Facet-empty-icon icon-emptybox"/>
          <div className="Facet-empty-info">
            No results
          </div>
        </div>
      )
    }
    buckets.forEach(bucket => {
      maxCount = Math.max(maxCount, bucket.doc_count)
      minCount = Math.min(minCount, bucket.doc_count)
    })
    // Only animate when the buckets change, cached in class variable, not state
    const animate = JSON.stringify(buckets) !== JSON.stringify(this.buckets)
    this.buckets = buckets
    const mergedTerms = terms.filter(t => (buckets.findIndex(b => (b.key === t)) >= 0))
    if (mergedTerms.length < terms.length) mergedTerms.push(OTHER_BUCKET)
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
            <div className="Facet-value-table" style={{minHeight: '300px'}}>
              <table>
                <thead>
                  <tr>
                    <td style={{width: '80%'}}/>
                    <td style={{width: '20%'}}/>
                  </tr>
                </thead>
                <tbody>
                { buckets && buckets.map(bucket => (
                  <tr className={classnames('Facet-value-table-row',
                    { selected: mergedTerms.indexOf(bucket.key) >= 0 })}
                      title={`Click to filter for ${bucket.key}`}
                      key={bucket.key} onClick={this.selectTerm.bind(this, bucket.key)}>
                    <td className="Facet-value-cell">
                      <div className="Facet-value-table-key">
                        <div className="Facet-value-pct-bar" style={{width: `${100 * bucket.doc_count / maxCount}%`}} />
                        <div className="Facet-value-key">{this.renderBucketKey(bucket.key)}</div>
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
        const data = buckets.map(bucket => ({name: bucket.key, value: bucket.doc_count}))
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
      <div className={classnames('Facet-icon', type, {selected})}
              key={type} onClick={this.selectGraph.bind(this, type)} />
    )
  }

  renderChartTypes () {
    if (this.props.onOpen) return
    const buckets = this.baseBuckets()
    if (!buckets || !buckets.length) return
    return (
      <div className="Facet-chart-selector">
        { chartTypes.map(type => this.renderChartIcon(type)) }
      </div>
    )
  }

  render () {
    const { id, floatBody, isIconified, isOpen, onOpen } = this.props
    const { field, terms } = this.state
    const lastName = Asset.lastNamespace(unCamelCase(field))
    const title = terms && terms.length ? lastName : FacetWidgetInfo.title
    const selected = terms && terms.length ? terms.join(',') : lastName
    return (
      <Widget className="Facet"
              id={id}
              title={title}
              floatBody={floatBody}
              field={selected}
              backgroundColor={FacetWidgetInfo.color}
              isIconified={isIconified}
              icon={FacetWidgetInfo.icon}
              isOpen={isOpen}
              onOpen={onOpen}>
        <div className="Facet-body">
          { this.renderChart() }
          { this.renderClearSelection() }
          { this.renderChartTypes() }
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    aggs: state.assets && state.assets.aggs,
    fieldTypes: state.assets && state.assets.types,
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
  })
)(Facet)
