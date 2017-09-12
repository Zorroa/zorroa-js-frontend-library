import * as assert from 'assert'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { createColorWidget } from '../../models/Widget'
import { ColorWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, similar, isSimilarColor } from '../../actions/racetrackAction'
import Widget from './Widget'
import Resizer from '../../services/Resizer'
import { hexToRgb, rgbToHex, RGB2HSL, HSL2RGB, HSV2HSL } from '../../services/color'

const COLOR_SLIDER_HEIGHT = 180
const COLOR_RESIZER_HEIGHT = 5

const RATIO_MAX_FACTOR = 1.5  // maxRatio in query is this factor times user ratio
const LUMA_OVERLAY_THRESHOLD = 0.5

class Color extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ofsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
      minScore: PropTypes.number
    }).isRequired
  }

  state = {
    colors: [],
    useHsvHash: false
  }

  // sync local state with existing app state
  syncLocalColorWithAppState (nextProps) {
    const { id, widgets, similar } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (!widget || !widget.sliver) return

    if (isSimilarColor(similar) !== this.state.useHsvHash) this.setState({useHsvHash: isSimilarColor(similar)})
    let colors
    try {
      colors = widget.sliver.filter.colors.colors
    } catch (e) {
      return
    }

    this.setState({colors: colors.map(color => {
      const colorArray = [color.hue, color.saturation, color.brightness]
      const hsl = HSV2HSL(colorArray)
      return {
        hsl,
        key: color.key || this.getKeyForHSL(hsl),
        ratio: color.ratio || color.maxRatio / (RATIO_MAX_FACTOR * 100),
        maxRatio: color.maxRatio,
        minRatio: color.minRatio
      }
    })})
  }

  componentWillReceiveProps (nextProps) {
    this.syncLocalColorWithAppState(nextProps)
  }

  componentWillMount () {
    this.resizer = new Resizer()
    this.syncLocalColorWithAppState(this.props)
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
  }

  colors2Hash (colors) {
    // const [ HL, SL, VL ] = [ 12, 5, 3 ]
    // const HEX_DIGITS = 'abcdefghijklmnop'

    // def histHash(hsv, channel, size):
    //   hist1 = cv2.calcHist([hsv],[channel],None,[size],[0,256])
    //   hist2 = ((16 / MAX_HIST_VAL) * hist1).astype(int).clip(0, 15)
    //   hash = ''.join(HEX_DIGITS[x[0]] for x in hist2)
    //   return hash

    // hsvFinal = histHash(hsv, 0, HL) + histHash(hsv, 1, SL) + histHash(hsv, 2, VL)

    // def dist(a,b):
    //   s=ord('a')
    //   val = lambda c: ord(c)-s
    //   return sum((abs(val(a[i])-val(b[i])) for i in xrange(len(a))))

    return 'onjikmllnaaapmjknmpn'
  }

  modifySliver (colors, useHsvHash) {
    const { similar } = this.props
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const widget = createColorWidget('colors', 'nested', colors, isEnabled, isPinned)
    widget.id = this.props.id

    if (useHsvHash) {
      const similar = {
        field: 'similarity.hsv',
        values: [this.colors2Hash(colors)],
        weights: [1],
        ofsIds: [],
        minScore: 75
      }
      this.props.actions.similar(similar)
      widget.sliver.filter = null
    } else if (isSimilarColor(similar)) {
      this.props.actions.similar()
    }

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
    this.modifySliver(newColors, this.state.useHsvHash)
  }

  removeColorByKey = (key) => {
    const { colors } = this.state
    const keyIndex = colors.findIndex(color => key === color.key)
    if (keyIndex < 0) return

    const oldN = colors.length
    if (oldN === 1) {
      this.setState({ colors: [] })
      this.modifySliver([], this.state.useHsvHash)
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
    this.modifySliver(newColors, this.state.useHsvHash)
  }

  setColorHEX = (hexStr) => {
    // only consider 6-char hex strings for now
    if (hexStr.length !== 7) return

    let rgb = hexToRgb(hexStr).map(x => x / 256)
    if (!rgb) return
    let hsl = RGB2HSL(rgb)
    this.setColorHSL(hsl, hexStr)
  }

  HSLLuma = (hsl) => {
    const [r, g, b] = HSL2RGB(hsl)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  getKeyForHSL = (hsl) => {
    const rgb = HSL2RGB(hsl)
    return rgbToHex(rgb)
  }

  keyExists = (key) => (this.state.colors.findIndex(color => key === color.key) > -1)

  renderSwatches = () => {
    let swatchRows = []

    const nTiles = 16

    const nL = nTiles - 1
    const maxL = 100
    const dL = maxL / nL
    const sL = maxL - dL / 2

    const nH = nTiles
    const maxH = 360
    const dH = maxH / nH
    const sH = dH * 0.75 // This phase offset gives us a better canonical yellow

    // Color rows
    for (let L = sL; L > 0; L -= dL) {
      let rowSwatches = []
      for (let H = sH; H < maxH; H += dH) {
        // saved searches are rounded; so we need to round in order to restore picked colors
        const hsl = [ Math.round(H), 100, Math.round(L) ]
        const key = this.getKeyForHSL(hsl)
        const selected = this.keyExists(key)
        const swatch = (
          <div className={classnames('Color-swatch', {selected, lightOverlay: this.HSLLuma(hsl) < LUMA_OVERLAY_THRESHOLD})}
               key={key}
               style={{backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}}
               onClick={event => this.setColorHSL(hsl, key)}/>)
        rowSwatches.push(swatch)
      }
      swatchRows.push(<div className="Color-swatch-row" key={`${L}`}>{rowSwatches}</div>)
    }

    // 1 grayscale row
    let rowSwatches = []
    for (let L = sL, i = 0; i < nTiles; L -= dL, i++) {
      const hsl = [ 0, 0, Math.round(L) ]
      const key = this.getKeyForHSL(hsl)
      const selected = this.keyExists(key)
      const swatch = (
        <div className={classnames('Color-swatch', {selected, lightOverlay: this.HSLLuma(hsl) < LUMA_OVERLAY_THRESHOLD})}
             key={key}
             style={{backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}}
             onClick={event => this.setColorHSL(hsl, key)}/>)
      rowSwatches.push(swatch)
    }
    swatchRows.push(<div className="Color-swatch-row" key={'0'}>{rowSwatches}</div>)

    return swatchRows
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
    this.modifySliver(this.state.colors, this.state.useHsvHash)
  }

  // This is a DEBUG feature since the flickr server has HSL data
  // TODO: once all server data is HSV, remove this toggle
  toggleHsvHash = (event) => {
    this.setState({ useHsvHash: event.target.checked })
    this.modifySliver(this.state.colors, event.target.checked)
  }

  render () {
    const { id, floatBody, isIconified, isOpen, onOpen } = this.props
    const { colors } = this.state

    let hsl = [0, 0, 100]
    if (colors.length) {
      hsl = colors[colors.length - 1].hsl
    }
    const lightOverlay = this.HSLLuma(hsl) < LUMA_OVERLAY_THRESHOLD

    const colorHeightAdjust = (colors.length)
      ? (colors.length - 1) * COLOR_RESIZER_HEIGHT / colors.length
      : 0

    return (
      <Widget className="Color"
              id={id}
              floatBody={floatBody}
              isOpen={isOpen}
              onOpen={onOpen}
              title={ColorWidgetInfo.title}
              backgroundColor={ColorWidgetInfo.color}
              isIconified={isIconified}
              icon={ColorWidgetInfo.icon}>
        <div className="Color-body">
          <div className="Color-picker">
            <div className="Color-swatches">
              { this.renderSwatches() }
            </div>
            <div className="Color-status">
              <div className={classnames('Color-preview', {lightOverlay})}
                   style={{ backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` }}>
                <div className="Color-preview-icon icon-eyedropper"/>
              </div>
              <input className="Color-hex-input"
                     placeholder="Enter HEX value"
                     onInput={event => this.setColorHEX(event.target.value)}/>
            </div>
          </div>

          <div className="Color-separator"/>

          <div className="Color-hsvHash">
            { /* TODO: remove this debug toggle (see comments on toggleServerHSL) */ }
            <input checked={this.state.useHsvHash} type="checkbox"
                   className='' name="color-hsvHash"
                   onChange={this.toggleHsvHash}/>
            <span>Use HSV hash</span>
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
                const lightOverlay = this.HSLLuma(hsl) < LUMA_OVERLAY_THRESHOLD
                return (
                  <div key={key} className={classnames('Color-slider-entry', 'fullWidth', { lightOverlay })}>
                    <div className='Color-slider-color flexRowCenter'
                         style={{
                           width: '100%',
                           height: `${Math.round(color.ratio * COLOR_SLIDER_HEIGHT - colorHeightAdjust)}px`,
                           backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`
                         }}>
                      <div className='Color-slider-pct flexOff'>
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
                             onMouseDown={event => this.resizeColorStart(key)}
                             style={{ height: `${COLOR_RESIZER_HEIGHT}px` }}/>)
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
    widgets: state.racetrack && state.racetrack.widgets,
    similar: state.racetrack.similar
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget, similar }, dispatch)
  })
)(Color)
