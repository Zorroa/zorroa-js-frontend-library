import * as assert from 'assert'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetModel from '../../models/Widget'
// import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { ColorWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'
import Resizer from '../../services/Resizer'
import { hexToRgb, rgbToHex, HSL2HSV, RGB2HSL, HSL2RGB } from '../../services/color'

const COLOR_SLIDER_HEIGHT = 180

class Color extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(WidgetModel))
  }

  state = {
    colors: [],
    isServerHSL: true // see toggleServerHSL
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
    this.resizer = new Resizer()
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
  }

  modifySliver (colors) {
    const type = ColorWidgetInfo.type
    const sliver = new AssetSearch()

    if (colors.length) {
      sliver.filter = new AssetFilter({colors: {colors: colors.map(color => {
        const hsv = (this.state.isServerHSL) ? color.hsl : HSL2HSV(color.hsl) // see toggleServerHSL

        return {
          hue: Math.floor(hsv[0]),
          saturation: Math.floor(hsv[1]),
          brightness: Math.floor(hsv[2]),
          hueRange: 24, // 20%
          maxRatio: color.ratio * COLOR_SLIDER_HEIGHT,
          saturationRange: 75, // we have no saturation control, so allow a wide variety
          minRatio: color.ratio * 100 / 4,
          brightnessRange: 25
        }
      })}})
    }

    const widget = new WidgetModel({id: this.props.id, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  setColorHSL = (hsl, key) => {
    // dont allow duplicates
    // in fact, let's remove the color if we click one we already have
    if (this.keyExists(key)) {
      return this.removeColorByKey(key)
    }

    const { colors } = this.state
    // default ratio for the new color is 1/n where n is new # colors
    const newN = colors.length + 1

    // no more than five colors.
    if (newN > 5) return

    const ratio = 1 / newN
    // compute adjusted ratios for all the existing colors
    const newRatios = colors.map((color) => color.ratio * (1 - ratio))
    // inject the adjusted ratios
    let newColors = colors.map((color, i) => { return { ...color, ratio: newRatios[i] } })
    newColors.push({ hsl, key, ratio })
    this.setState({ colors: newColors })
    this.modifySliver(newColors)
  }

  removeColorByKey = (key) => {
    const { colors } = this.state
    const keyIndex = colors.findIndex(color => key === color.key)
    if (keyIndex < 0) return

    const oldN = colors.length
    if (oldN === 1) {
      this.setState({ colors: [] })
      return
    }

    // remove the selected color from state
    // the spread is so we copy the colors array before modifying
    const newColors = [ ...this.state.colors ]
    newColors.splice(keyIndex, 1)

    // renormalize ratios
    let ratioSum = 0
    newColors.forEach(color => { ratioSum += color.ratio })
    assert.ok(ratioSum > 0)
    const normFactor = 1 / ratioSum
    newColors.forEach(color => { color.ratio *= normFactor })

    this.setState({ colors: newColors })
    this.modifySliver(newColors)
  }

  setColorHEX = (hexStr) => {
    // only consider 6-char hex strings for now
    if (hexStr.length !== 7) return

    var rgb = hexToRgb(hexStr).map(x => x / 256)
    if (!rgb) return
    var hsl = RGB2HSL(rgb)
    this.setColorHSL(hsl, hexStr)
  }

  getOverlayHSL = ([H, S, L]) => {
    // near white? use black, otherwise use white
    return (L > 50) ? [0, 0, 0] : [0, 0, 100]
  }

  keyExists = (key) => (this.state.colors.findIndex(color => key === color.key) > -1)

  renderSwatches = () => {
    let swatchRows = []

    const nTiles = 16

    const nL = nTiles - 1
    const maxL = 100
    const dL = maxL / nL

    const nH = nTiles
    const maxH = 360
    const dH = maxH / nH

    // Color rows
    for (let L = maxL - dL / 2; L > 0; L -= dL) {
      let rowSwatches = []
      for (let H = 0; H < maxH; H += dH) {
        const hsl = [ H, 100, L ]
        const rgb = HSL2RGB(hsl)
        const hex = rgbToHex(rgb)
        const key = hex
        const selected = this.keyExists(key)
        const swatch = (
          <div className={classnames('Color-swatch', {selected, lightborder: L < 50})}
               key={key}
               style={{backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}}
               onClick={event => this.setColorHSL(hsl, key)}/>)
        rowSwatches.push(swatch)
      }
      swatchRows.push(<div className="Color-swatch-row" key={`${L}`}>{rowSwatches}</div>)
    }

    // 1 grayscale row
    let rowSwatches = []
    for (let L = maxL, i = 0; i < 16; L -= dL, i++) {
      const hsl = [ 0, 0, L ]
      const rgb = HSL2RGB(hsl)
      const hex = rgbToHex(rgb)
      const key = hex
      const selected = this.keyExists(key)
      const swatch = (
        <div className={classnames('Color-swatch', {selected, lightborder: L < 50})}
             key={key}
             style={{backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}}
             onClick={event => this.setColorHSL(hsl, key)}/>)
      rowSwatches.push(swatch)
    }
    swatchRows.push(<div className="Color-swatch-row" key={'0'}>{rowSwatches}</div>)

    return swatchRows
  }

  componentWillReceiveProps (nextProps) {
    // const { id, widgets } = nextProps
    // const index = widgets && widgets.findIndex(widget => (id === widget.id))
    // const widget = widgets && widgets[index]
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  resizer = null
  resizeIndex = -1
  resize1start = 0.5
  resize2start = 0.5
  resize1min = 0.1
  resize1max = 1
  resize2min = 0.1
  resize2max = 1

  resizeColorStart = (key) => {
    const { colors } = this.state
    this.resizeIndex = colors.findIndex(c => key === c.key)
    if (this.resizeIndex < 0) return
    assert.ok(this.resizeIndex < colors.length - 1)

    this.resize1start = colors[this.resizeIndex].ratio
    this.resize2start = colors[this.resizeIndex + 1].ratio
    const total = this.resize1start + this.resize2start
    this.resize1max = total - 0.1
    this.resize2max = total - 0.1

    this.resizer.capture(this.resizeColor, this.resizeColorStop, 0, 0, 0, 1 / COLOR_SLIDER_HEIGHT)
  }

  resizeColor = (x, y) => {
    const newRatio1 = Math.min(this.resize1max, Math.max(this.resize1min, this.resize1start + y))
    const newRatio2 = Math.min(this.resize2max, Math.max(this.resize2min, this.resize2start - y))
    const { colors } = this.state
    const newColors = [ ...colors ]
    const newResizeColor1 = { ...colors[this.resizeIndex], ratio: newRatio1 }
    const newResizeColor2 = { ...colors[this.resizeIndex + 1], ratio: newRatio2 }
    newColors.splice(this.resizeIndex, 2, newResizeColor1, newResizeColor2)
    this.setState({ colors: newColors })
  }

  resizeColorStop = () => {
    this.resizeIndex = -1
    this.modifySliver(this.state.colors)
  }

  // This is a DEBUG feature since the flickr server has HSL data
  // TODO: once all server data is HSV, remove this toggle
  toggleServerHSL = (event) => {
    this.setState({ isServerHSL: event.target.checked })
    this.modifySliver(this.state.colors)
  }

  render () {
    const { isIconified } = this.props
    const { colors } = this.state

    var hsl = [0, 0, 100]
    if (colors.length) {
      hsl = colors[colors.length - 1].hsl
    }
    const overlayHSL = this.getOverlayHSL(hsl)
    return (
      <Widget className="Color"
              header={(
                <div className="Color-header">
                  <div className="Color-header-label">
                    <span className="Color-header-title">Color</span>
                  </div>
                </div>
              )}
              backgroundColor={ColorWidgetInfo.color}
              isIconified={isIconified}
              icon={ColorWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Color-body">
          <div className="Color-picker">
            <div className="Color-swatches">
              { this.renderSwatches() }
            </div>
            <div className="Color-status">
              <div className="Color-preview"
                   style={{ backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` }}>
                <div className="Color-preview-icon icon-eyedropper"
                     style={{ color: `hsl(${overlayHSL[0]}, ${overlayHSL[1]}%, ${overlayHSL[2]}%)` }}/>
              </div>
              <input className="Color-hex-input"
                     placeholder="Enter HEX value"
                     onInput={event => this.setColorHEX(event.target.value)}/>
            </div>
          </div>

          <div className="Color-hsl">
            { /* TODO: remove this debug toggle (see comments on toggleServerHSL) */ }
            <input checked={this.state.isServerHSL} type="checkbox"
                   className='' name="color-hsl"
                   onChange={this.toggleServerHSL}/>
            <span>Server uses HSL</span>
          </div>

          <div className="Color-separator"/>

          <div className="Color-slider-text">Slide to adjust color percentages.</div>

          <div className="Color-slider flexCol">
            <div className="Color-slider-bg">
              <i className='Color-slider-icon icon-eyedropper'/>
              <div style={{textTransform: 'uppercase'}} className='flexRowCenter'>Select up to 5 colors<br/> to search by color</div>
            </div>
            <div className="Color-slider-fg">
              { colors.map((color, i, a) => {
                const { hsl, key } = color
                const overlayHSL = this.getOverlayHSL(hsl)
                return (
                  <div className='Color-slider-entry fullWidth'>
                    <div className='Color-slider-color flexRowCenter'
                         key={key}
                         style={{width: '100%',
                                 height: `${Math.round(color.ratio * COLOR_SLIDER_HEIGHT)}px`,
                                 backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}}>
                      <div className='Color-slider-pct flexOff'
                           style={{color: `hsl(${overlayHSL[0]}, ${overlayHSL[1]}%, ${overlayHSL[2]}%)`}}>
                        {`${Math.round(color.ratio * 100)}%`}
                      </div>
                      <div className='flexOn'/>
                      <div className='Color-slider-del flexOff flexRowCenter'
                           onClick={event => this.removeColorByKey(key)}>
                        <i className='icon-cross'/>
                      </div>
                    </div>
                    {
                      // put a resizer in between every pair of colors (but not after the last color)
                      (i < a.length - 1) && (
                        <div className='Color-slider-resizer'
                             onMouseDown={event => this.resizeColorStart(key)}/>)
                    }
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
  })
)(Color)