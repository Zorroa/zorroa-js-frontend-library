import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as assert from 'assert'
import classnames from 'classnames'

import { createRangeWidget } from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { RangeWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import Widget from './Widget'
import { unCamelCase } from '../../services/jsUtil'
import Resizer from '../../services/Resizer'

const isNumeric = (n) => ((typeof n === 'number' || typeof n === 'string') && !isNaN(n - parseFloat(n)))

const decPrefixes = [ 'k', 'm', 'g', 't', 'e', 'p' ]
const binPrefixes = [ 'kib', 'mib', 'gib', 'tib', 'eib', 'pib' ]
const decSizes = { 'k': 1e3, 'm': 1e6, 'g': 1e9, 't': 1e12, 'e': 1e15, 'p': 1e18 }
const binSizes = {
  'kib': Math.pow(2, 10),
  'mib': Math.pow(2, 20),
  'gib': Math.pow(2, 30),
  'tib': Math.pow(2, 40),
  'eib': Math.pow(2, 50),
  'pib': Math.pow(2, 60)
}
const decRE = new RegExp(`(.*)([${decPrefixes.join('')}])b?$`, 'i')
const binRE = new RegExp(`(.*)(${binPrefixes.join('|')})$`, 'i')
const prefixes = { 'dec': decPrefixes, 'bin': binPrefixes }
const sizes = { 'dec': decSizes, 'bin': binSizes }

class Range extends Component {
  static propTypes = {
    aggs: PropTypes.object,
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  resizer = null

  state = {
    field: '',
    min: null, // min threshold (greater than)
    max: null, // max threshold (less than)
    minStr: null,
    maxStr: null,
    autoMin: null,
    autoMax: null,
    prevAutoMin: null,
    prevAutoMax: null,
    usePrefix: 'none', // whether to show large numbers in prefix form  none / decimal / binary
    syncRangeWithAutoRange: false
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      if (widget.sliver.filter && widget.sliver.filter.range) {
        const range = widget.sliver.filter.range
        const keys = Object.keys(range)
        assert.ok(keys.length === 1) // there should only be one entry here
        const field = keys[0]
        let min = range[field].gte
        let max = range[field].lte
        let reQuery = (field !== this.state.field || min !== this.state.min || max !== this.state.max)

        // search for our auto range
        if (nextProps.aggs) {
          const agg = nextProps.aggs[id]
          if (agg && agg[field]) {
            let autoMin = Math.min(agg[field].min, this.state.min)
            let autoMax = Math.max(agg[field].max, this.state.max)

            if (isNumeric(autoMin) && isNumeric(autoMax)) {
              if (autoMin === autoMax) {
                autoMin -= 0.001
                autoMax += 0.001
              }
              this.setState({ autoMin, autoMax })
              if (this.state.syncRangeWithAutoRange) {
                min = autoMin
                max = autoMax
                reQuery = true
                this.setState({ syncRangeWithAutoRange: false })
              }
            }
          }
        } else if (!this.state.syncRangeWithAutoRange) {
          min = Number.MAX_SAFE_INTEGER
          max = -Number.MAX_SAFE_INTEGER
          this.setStatePromise({ min, max, syncRangeWithAutoRange: true })
            .then(() => { this.modifySliver() })
        }

        const usePrefix = field && field.length && field === 'source.fileSize' ? 'bin' : null
        const minStr = min !== undefined ? this.valToString(min) : null
        const maxStr = max !== undefined ? this.valToString(max) : null
        this.setStatePromise({ field, min, max, minStr, maxStr, usePrefix })
          .then(() => { if (reQuery) this.modifySliver() })
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    this.syncWithAppState(nextProps)
  }

  componentWillMount () {
    this.resizer = new Resizer()
    this.syncWithAppState(this.props)
  }

  componentWillUnmount () {
    this.resizer.release()
  }

  modifySliver = () => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const { field, min, max } = this.state
    if (!field) return
    const widget = createRangeWidget(field, 'double', min, max, isEnabled, isPinned)
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
  }

  inputUpdate = (event) => {
    const input = event.target
    let stringVal = input.value
    let { usePrefix } = this.state
    let numericValue
    const decMatches = decRE.exec(stringVal)
    if (decMatches) {
      usePrefix = 'dec'
      const factor = decSizes[decMatches[2].toLowerCase()] || 1
      numericValue = parseFloat(decMatches[1]) * factor
    } else {
      const binMatches = binRE.exec(stringVal)
      if (binMatches) {
        usePrefix = 'bin'
        const factor = binSizes[binMatches[2].toLowerCase()] || 1
        numericValue = parseFloat(binMatches[1]) * factor
      } else {
        usePrefix = 'none'
        numericValue = parseFloat(input.value)
      }
    }
    const key = input.dataset.range
    this.setState({ [key]: numericValue, [key + 'Str']: input.value, usePrefix })
  }

  // round to 3 sig figs when between [0.01..1000]
  // if greater than 1k, round to nearest integer
  // if less than 0.01, dont round
  round = (n) => {
    if (n > 1000) return Math.round(n)
    if (n < 0.01) return n

    if (n > 100) return Math.round(n * 10) / 10
    if (n > 10) return Math.round(n * 100) / 100
    if (n > 1) return Math.round(n * 1000) / 1000
    if (n > 0.1) return Math.round(n * 10000) / 10000
    /* if (n > 0.01) */ return Math.round(n * 100000) / 100000
  }

  valToString = (val) => {
    if (val === null) return null
    const { usePrefix } = this.state
    let str
    if (usePrefix in prefixes) {
      // Make sure to find the largest one first, i.e., search backwards
      for (let i = prefixes[usePrefix].length - 1; i >= 0; i--) {
        const prefix = prefixes[usePrefix][i]
        const size = sizes[usePrefix][prefix]
        if (val > size || i === 0) {
          val /= size
          str = this.round(val.toString()) + prefix
          break
        }
      }
    } else {
      str = this.round(val.toString())
    }
    return str
  }

  minStart = (event) => {
    this.resizer.capture(this.minUpdate, this.minStop,
      this.state.min, 0,
      (this.state.autoMax - this.state.autoMin) / this.refs.rangeSliderBox.clientWidth, 0)
  }
  minUpdate = (x, y) => {
    const min = Math.min(this.state.autoMax, Math.max(this.state.autoMin, x))
    const max = Math.max(this.state.max, min) // let this handle push the other one around
    this.setState({ min, minStr: this.valToString(min), max, maxStr: this.valToString(max) })
  }
  minStop = (event) => {
    this.modifySliver()
  }

  maxStart = (event) => {
    this.resizer.capture(this.maxUpdate, this.maxStop,
      this.state.max, 0,
      (this.state.autoMax - this.state.autoMin) / this.refs.rangeSliderBox.clientWidth, 0)
  }
  maxUpdate = (x, y) => {
    const max = Math.min(this.state.autoMax, Math.max(this.state.autoMin, x))
    const min = Math.min(this.state.min, max) // let this handle push the other one around
    this.setState({ min, minStr: this.valToString(min), max, maxStr: this.valToString(max) })
  }
  maxStop = (event) => {
    this.modifySliver()
  }

  resetAutoRange = (event) => {
    const { field } = this.state
    window.getSelection().removeAllRanges()
    this.setStatePromise({
      field,
      min: null,
      max: null,
      minStr: null,
      maxStr: null,
      autoMin: null,
      autoMax: null,
      syncRangeWithAutoRange: true
    })
    .then(this.modifySliver)
  }

  render () {
    const { isIconified, id, floatBody, isOpen, onOpen } = this.props
    const { field } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))

    const { min, max, minStr, maxStr, autoMin, autoMax, prevAutoMin, prevAutoMax } = this.state

    let renderSlider = isNumeric(min) && isNumeric(max) &&
      isNumeric(autoMin) && isNumeric(autoMax) &&
      (autoMax > autoMin) && (max >= min)

    const w = autoMax - autoMin
    const ltPct = w > 0 ? (max - autoMin) / w : 0
    const gtPct = w > 0 ? (min - autoMin) / w : 0

    const autoMinChanged = (prevAutoMin !== autoMin)
    const autoMaxChanged = (prevAutoMax !== autoMax)
    if (autoMinChanged || autoMaxChanged) {
      requestAnimationFrame(() => { this.setState({ prevAutoMin: autoMin, prevAutoMax: autoMax }) })
    }

    return (
      <Widget className='Range'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={RangeWidgetInfo.title}
              field={title}
              backgroundColor={RangeWidgetInfo.color}
              isIconified={isIconified}
              icon={RangeWidgetInfo.icon}>
        <div className="Range-body">

          <div className="Range-row flexRowCenter">
            <div className="flexRowCenter flexOn">
              <span className="Range-label">min</span>
              <input id={`Range-min-${id}`}
                     className='flexOn'
                     placeholder={'min'}
                     value={minStr || ''}
                     onKeyPress={event => { if (event.key === 'Enter') { this.modifySliver() } }}
                     onBlur={this.modifySliver}
                     data-range="min"
                     onChange={this.inputUpdate} />
            </div>

            <div style={{width: '20px'}}/>

            <div className="flexRowCenter flexOn">
              <span className="Range-label">max</span>
              <input id={`Range-min-${id}`}
                     className='flexOn'
                     placeholder={'max'}
                     value={maxStr || ''}
                     onKeyPress={event => { if (event.key === 'Enter') { this.modifySliver() } }}
                     onBlur={this.modifySliver}
                     data-range="max"
                     onChange={this.inputUpdate} />
            </div>
          </div>

          <div className="Range-slider-clip">
            <div className="Range-slider-box"
                 ref="rangeSliderBox"
                 onDoubleClick={this.resetAutoRange}>
              <div className="Range-slider-center">
                <svg className="Range-slider-bg" viewBox="0 0 1 1" preserveAspectRatio="none">
                  <rect y="0.25" width="1" height="0.5" style={{fill: '#808080', stroke: 'none'}}></rect>
                  { renderSlider && (<rect x={`${gtPct}`} width={`${ltPct - gtPct}`} height="1" style={{fill: '#73b61c', stroke: 'none'}}></rect>) }
                </svg>
                { renderSlider &&
                  (<div className="Range-slider-loc Range-slider-loc-min" style={{right: `${(1 - gtPct) * 100}%`}}>
                    <div className="Range-slider-handle Range-slider-handle-min"
                         onMouseDown={this.minStart}/>
                  </div>
                )}
                { renderSlider && (
                  <div className="Range-slider-loc Range-slider-loc-max" style={{left: `${ltPct * 100}%`}}>
                    <div className="Range-slider-handle Range-slider-handle-max"
                         onMouseDown={this.maxStart}/>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="Range-auto-box">
            <div className="Range-auto-label-box Range-auto-label-box-min">
            <div className={classnames('Range-auto-label', 'Range-auto-min', { changed: autoMinChanged })}>
              {this.valToString(autoMin)}
            </div>
            </div>
            { (min !== autoMin || max !== autoMax) && (
              <div className="Range-auto-reset" onClick={this.resetAutoRange}>
                <span>Reset range</span>
                <div className="Range-auto-reset-button icon-cancel-circle"/>
              </div>
            )}
            <div className="Range-auto-label-box Range-auto-label-box-max">
            <div className={classnames('Range-auto-label', 'Range-auto-max', { changed: autoMaxChanged })}>
              {this.valToString(autoMax)}
            </div>
            </div>
          </div>

        </div>
      </Widget>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
})

const mapStateToProps = state => ({
  aggs: state.assets && state.assets.aggs,
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Range)
