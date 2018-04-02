import * as assert from 'assert'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { createColorWidget, createSimilarityWidget } from '../../models/Widget'
import { ColorWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import Widget from './Widget'
import Resizer from '../../services/Resizer'
import { hexToRgb, HSL2HSV, HSL2RGB, RGB2HSL, rgbToHex } from '../../services/color'
import { remap, clamp } from '../../services/jsUtil'

const COLOR_SLIDER_HEIGHT = 180
const COLOR_RESIZER_HEIGHT = 5

const LUMA_OVERLAY_THRESHOLD = 0.5

const HASHES = [
  'analysis.hueSimilarity.shash',
  'similarity.hue',
  'similarity.combined',
  'similarity.hsv',
  'similarity.rgb',
  'similarity.lab',
  'similarity.hsl',
  'similarity.dephsv',
  'similarity.deprgb_444'
]

class Color extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    uxLevel: PropTypes.number,
    isDeveloper: PropTypes.bool
  }

  state = {
    colors: [],
    useHsvHash: true,
    hsvHash: HASHES[0]
  }

  componentWillMount () {
    this.resizer = new Resizer()

    // Restore saved state from widget
    const { id, widgets } = this.props
    const widget = widgets && widgets.find(widget => widget.id === id)
    if (widget && widget.state) this.setState(widget.state)
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
  }

  resolveHashType = (hsvHash, colors) => {
    let resolvedHash = hsvHash
    if (resolvedHash === 'similarity.combined') {
      if (colors.length <= 2) resolvedHash = 'analysis.hueSimilarity.shash'
      else resolvedHash = 'similarity.dephsv'
    }
    return resolvedHash
  }

  colors2Hash = (colors, hsvHash) => {
    // This is a JS implementation of Juan's hsv hash
    // https://github.com/Zorroa/zorroa-python-sdk/blob/master/plugins/zorroa-py-core/pylib/zorroa_py_core/image.py
    // At rev c19668e (9/6/2017), HSVHash::process(), lines ~120-150

    const [ HL, SL, VL ] = [ 12, 5, 3 ]
    const HEX_DIGITS = 'abcdefghijklmnop' // use a hamming-friendly encoding for hex digits
    const HSV_RANGE = [ [0, 360], [0, 100], [0, 100] ]
    const MAX_HIST_VAL = 256 ** 2

    const normal = (x, center, radius) => {
      if (x < center - radius || x > center + radius) return 0
      const r2 = radius * radius / 5
      const xc = x - center
      return (1 / Math.sqrt(Math.PI * r2)) * Math.exp(-xc * xc / r2)
    }

    // sample & integrate a kernel function at higher resolution than the hash
    const makeKernel = (kernelFn, length, center, radius, wrap) => {
      const resolutionFactor = 10
      const dx = 1 / resolutionFactor
      let kernel = new Array(length).fill(0)
      for (let x = center - radius + dx / 2; x < center + radius; x += dx) {
        const y = kernelFn(x, center, radius)
        const bucket = wrap ? (Math.floor(x) + length) % length : clamp(Math.floor(x), 0, length - 1)
        kernel[bucket] += dx * y
      }
      return kernel
    }

    // sample & integrate a kernel function at higher resolution than the hash
    const make3dKernel = (kernelFn, lengthArray, centerArray, radiusArray, wrapArray) => {
      const resolutionFactor = 4
      const dr = 1 / resolutionFactor
      const dr3 = dr * dr * dr
      const kernelLen = lengthArray[0] * lengthArray[1] * lengthArray[2]
      let kernel = new Array(kernelLen).fill(0)
      for (let x = centerArray[0] - radiusArray[0] + dr / 2; x < centerArray[0] + radiusArray[0]; x += dr) {
        const xx = kernelFn(x, centerArray[0], radiusArray[0])
        const xbucket = wrapArray[0] ? (Math.floor(x) + lengthArray[0]) % lengthArray[0] : clamp(Math.floor(x), 0, lengthArray[0] - 1)
        for (let y = centerArray[1] - radiusArray[1] + dr / 2; y < centerArray[1] + radiusArray[1]; y += dr) {
          const yy = kernelFn(y, centerArray[1], radiusArray[1])
          const ybucket = wrapArray[1] ? (Math.floor(y) + lengthArray[1]) % lengthArray[1] : clamp(Math.floor(y), 0, lengthArray[1] - 1)
          for (let z = centerArray[2] - radiusArray[2] + dr / 2; z < centerArray[2] + radiusArray[2]; z += dr) {
            const zz = kernelFn(z, centerArray[2], radiusArray[2])
            const zbucket = wrapArray[2] ? (Math.floor(z) + lengthArray[2]) % lengthArray[2] : clamp(Math.floor(z), 0, lengthArray[2] - 1)
            kernel[xbucket * lengthArray[1] * lengthArray[2] + ybucket * lengthArray[2] + zbucket] += dr3 * (xx * yy * zz)
          }
        }
      }
      return kernel
    }

    // encode an array of float values in the range [0,maxVal] into an
    // array of float values in the range [0,16]
    // encoding may be non-linear
    const histogramToEncodedNormalHistogram = (hist, maxVal) => {
      // offset linear encoding: (mostly) linear histogram, a threshold of 10 pixels makes the value non-zero
      // return hist.map(v => remap(v, 10, maxVal, 1/16, 1))

      // square root encoding
      return hist.map(v => Math.sqrt(v) / Math.sqrt(maxVal))

      // log encoding
      // return hist.map(v => Math.log(v) / Math.log(maxVal))
    }

    // turn an array of float values in the range [0,16] into a hash string of chars 'a'-'p'
    const encodedNormalHistogramToHashString = (hexArray) => {
      return hexArray.map(v => HEX_DIGITS[clamp(Math.floor(16.0 * v), 0, 15)]).join('')
    }

    const histogramToHashString = (hist, maxVal) => {
      return encodedNormalHistogramToHashString(histogramToEncodedNormalHistogram(hist, maxVal))
    }

    const subHash = (colors, kernelFn, channel, range, hashLen, radius, wrap) => {
      assert.ok(radius > 0)
      let hash = new Array(hashLen).fill(0)

      colors.forEach(color => {
        // build a pretend histogram for an image using the colors the user has chosen
        const amount = color.ratio * MAX_HIST_VAL
        const hsl = color.hsl
        const hsv = HSL2HSV(hsl)

        const center = remap(hsv[channel], range[0], range[1], 0, hashLen)
        const kernel = makeKernel(kernelFn, hashLen, center, radius, wrap)

        // sanity check - does kernel integrate to 1?
        if (DEBUG) {
          const tot = kernel.reduce((a, b) => a + b, 0)
          assert.ok(Math.abs(tot - 1) < 0.1)
        }

        // do the splat!
        for (let i = 0; i < kernel.length; i++) hash[i] += amount * kernel[i]
      })

      return histogramToHashString(hash, MAX_HIST_VAL)
    }

    const computeDepHsvHash = (colors, kernelFn, hashLenArray, radiusArray) => {
      const hashLen = hashLenArray[0] * hashLenArray[1] * hashLenArray[2]
      let hash = new Array(hashLen).fill(0)

      colors.forEach(color => {
        // build a pretend histogram for an image using the colors the user has chosen
        const amount = color.ratio * MAX_HIST_VAL
        const hsl = color.hsl
        const hsv = HSL2HSV(hsl)

        const centerArray = [
          remap(hsv[0], HSV_RANGE[0][0], HSV_RANGE[0][1], 0, hashLenArray[0]),
          remap(hsv[1], HSV_RANGE[1][0], HSV_RANGE[1][1], 0, hashLenArray[1]),
          remap(hsv[2], HSV_RANGE[2][0], HSV_RANGE[2][1], 0, hashLenArray[2])
        ]
        const wrapArray = [true, false, false]
        const kernel = make3dKernel(kernelFn, hashLenArray, centerArray, radiusArray, wrapArray)

        // sanity check - does kernel integrate to 1?
        if (DEBUG) {
          const tot = kernel.reduce((a, b) => a + b, 0)
          assert.ok(Math.abs(tot - 1) < 0.1)
        }

        // do the splat!
        for (let i = 0; i < kernel.length; i++) hash[i] += amount * kernel[i]
      })

      return histogramToHashString(hash, MAX_HIST_VAL)
    }

    const computeDepRgbHash = (colors, kernelFn, hashLenArray, radiusArray) => {
      const hashLen = hashLenArray[0] * hashLenArray[1] * hashLenArray[2]
      let hash = new Array(hashLen).fill(0)

      colors.forEach(color => {
        // build a pretend histogram for an image using the colors the user has chosen
        const amount = color.ratio * MAX_HIST_VAL
        const hsl = color.hsl
        const rgb = HSL2RGB(hsl)

        const centerArray = [
          remap(rgb[0], 0, 1, 0, hashLenArray[0]),
          remap(rgb[1], 0, 1, 0, hashLenArray[1]),
          remap(rgb[2], 0, 1, 0, hashLenArray[2])
        ]
        const wrapArray = [false, false, false]
        const kernel = make3dKernel(kernelFn, hashLenArray, centerArray, radiusArray, wrapArray)

        // sanity check - does kernel integrate to 1?
        if (DEBUG) {
          const tot = kernel.reduce((a, b) => a + b, 0)
          assert.ok(Math.abs(tot - 1) < 0.1)
        }

        // do the splat!
        for (let i = 0; i < kernel.length; i++) hash[i] += amount * kernel[i]
      })

      return histogramToHashString(hash, MAX_HIST_VAL)
    }

    // const radii = remap(colors.length, 1, 5, 1, 0.5)
    const radii = [ -1, 2, 2, 2, 1, 1 ]

    switch (this.resolveHashType(hsvHash, colors)) {
      case 'similarity.hsv':
        const hhash = subHash(colors, normal, 0, HSV_RANGE[0], HL, radii[colors.length], true)
        const shash = subHash(colors, normal, 1, HSV_RANGE[1], SL, colors.length > 2 ? 0.5 : 1, false)
        const vhash = subHash(colors, normal, 2, HSV_RANGE[2], VL, colors.length > 2 ? 0.5 : 1, false)
        return hhash + shash + vhash

      case 'analysis.hueSimilarity.shash':
      case 'similarity.hue':
        const hueHash = subHash(colors, normal, 0, HSV_RANGE[0], HL, remap(colors.length, 1, 5, 1, 0.5), true)
        return hueHash

      case 'similarity.dephsv': {
        const radiusArray = [radii[colors.length], colors.length <= 2 ? 1 : 0.5, colors.length <= 2 ? 1 : 0.5]
        const depHash = computeDepHsvHash(colors, normal, [6, 3, 3], radiusArray)
        return depHash
      }

      case 'similarity.deprgb_444': {
        const radius = remap(colors.length, 1, 5, 2.5, 1.5)
        const radiusArray = [radius, radius, radius]
        const rgbHash = computeDepRgbHash(colors, normal, [4, 4, 4], radiusArray)
        return rgbHash
      }

      case 'similarity.combined': {
        assert.ok(false)
        return 'bad hash'
      }
    }
  }

  modifySliver (colors, useHsvHash, hsvHash) {
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
      const field = this.resolveHashType(hsvHash, colors)
      const minScore = 75
      const weight = 1
      const hash = this.colors2Hash(colors, hsvHash)
      const similar = createSimilarityWidget(field, null, [{hash, weight}], minScore, isEnabled, isPinned)
      widget.sliver = similar.sliver
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
    this.modifySliver(newColors, this.state.useHsvHash, this.state.hsvHash)
  }

  removeColorByKey = (key) => {
    const { colors } = this.state
    if (!colors) return   // removed last color
    const keyIndex = colors.findIndex(color => key === color.key)
    if (keyIndex < 0) return

    const oldN = colors.length
    if (oldN === 1) {
      this.setState({ colors: [] })
      this.modifySliver([], this.state.useHsvHash, this.state.hsvHash)
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
    this.modifySliver(newColors, this.state.useHsvHash, this.state.hsvHash)
  }

  setColorHEX = (str) => {
    const hexStr = (str[0] === '#') ? str : `#${str}`
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
    this.modifySliver(this.state.colors, this.state.useHsvHash, this.state.hsvHash)
  }

  // This is a DEBUG feature since the flickr server has HSL data
  toggleHsvHash = (event) => {
    this.setState({ useHsvHash: event.target.checked })
    this.modifySliver(this.state.colors, event.target.checked, this.state.hsvHash)
  }

  // This is a DEBUG feature
  selectHsvHash = (event) => {
    this.setState({ hsvHash: event.target.value })
    this.modifySliver(this.state.colors, this.state.useHsvHash, event.target.value)
  }

  render () {
    const { id, widgets, floatBody, isIconified, isOpen, onOpen, isDeveloper, uxLevel } = this.props
    const { colors } = this.state
    const isAdvanced = uxLevel > 0

    const colorHeightAdjust = (colors.length)
      ? (colors.length - 1) * COLOR_RESIZER_HEIGHT / colors.length
      : 0

    // Reflect current state in widget to recover after save
    const widget = widgets && widgets.find(widget => (id === widget.id))
    widget.state = this.state

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
              <input className="Color-hex-input"
                     placeholder="Enter HEX value"
                     onInput={event => this.setColorHEX(event.target.value)}/>
            </div>
          </div>

          { isDeveloper && isAdvanced && (
            <div className="Color-developer">
              <div className="Color-separator"/>

              <span className="Color-developer-title">Developer controls (experimental)</span>

              <div className="Color-hsvHash">
                { /* TODO: remove this debug toggle (see comments on toggleServerHSL) */ }
                <div className="Color-hsvHash-controls">
                  <input checked={this.state.useHsvHash} type="checkbox"
                         className='' name="color-hsvHash"
                         onChange={this.toggleHsvHash}/>
                  <span>Use HSV hash</span>
                  <select className='Color-hsvHash-select' onChange={this.selectHsvHash}>
                    { HASHES.map(hash => (<option key={hash} value={`${hash}`}>{hash}</option>)) }
                  </select>
                </div>
                <span className='Color-hsvHash-hash'>{this.colors2Hash(colors, this.state.hsvHash)}</span>
              </div>
            </div>
          )}

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
    widgets: state.racetrack.widgets,
    uxLevel: state.app.uxLevel,
    isDeveloper: state.auth.isDeveloper
  }), dispatch => ({
    actions: bindActionCreators({ modifyRacetrackWidget }, dispatch)
  })
)(Color)
