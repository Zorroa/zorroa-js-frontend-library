import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'

export default class Image extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.panner = new Panner()
    this.state = {
      scale: this.panner.scale,
      translate: { x: this.panner.x, y: this.panner.y },
      moving: false
    }
    this.movingTimer = null
  }

  // Keep track of when the image is in motion, so we can
  // temporarily drop image quality in favor of responsiveness.
  // Call this every time the image starts moving, and
  // during every frame the image moves.
  startMoving = () => {
    if (this.movingTimer) {
      clearTimeout(this.movingTimer)
    } else {
      this.setState({moving: true})
    }
    // Automatically assume we're done moving if nothing happens for a short while
    // This is mainly for mouse wheel zoom, because we don't get an end event,
    // but has the benefit of guaranteeing we never get stuck
    this.movingTimer = setTimeout(this.stopMoving, 150)
  }

  // Call this anytime the image is known to be done moving for at least a frame
  stopMoving = () => {
    if (this.movingTimer) {
      clearTimeout(this.movingTimer)
      this.setState({moving: false})
      this.movingTimer = null
    }
  }

  startDrag = (event) => {
    this.startX = event.pageX
    this.startY = event.pageY
    document.addEventListener('mouseup', this.stopDrag, true)
    document.addEventListener('mousemove', this.drag, true)
    this.startMoving()
  }

  stopDrag = (event) => {
    document.removeEventListener('mouseup', this.stopDrag, true)
    document.removeEventListener('mousemove', this.drag, true)
    this.stopMoving()
  }

  drag = (event) => {
    this.panner.panFrom(
      { x: this.startX, y: this.startY },
      { x: event.pageX, y: event.pageY })
    this.startX = event.pageX
    this.startY = event.pageY
    this.setStateToPanner()
    this.startMoving()
  }

  static maxZoom = 4
  static minZoom = 1 / Image.maxZoom

  zoom = (event) => {
    const { scale } = this.state
    const scalePct = 1 + Math.abs(event.deltaY) * 0.005
    const scaleMult = (event.deltaY > 0 ? scalePct : 1 / scalePct)
    const zoomFactor = Math.min(Image.maxZoom, Math.max(Image.minZoom, scale * scaleMult))
    this.panner.zoom(zoomFactor, {x: event.pageX, y: event.pageY})
    this.setStateToPanner()
    this.startMoving()
  }

  zoomIn = (event) => {
    this.zoom({ ...event, deltaY: 50, pageX: this.panner.screenWidth / 2, pageY: this.panner.screenHeight / 2 })
    this.stopMoving()
  }

  zoomOut = (event) => {
    this.zoom({ ...event, deltaY: -50, pageX: this.panner.screenWidth / 2, pageY: this.panner.screenHeight / 2 })
    this.stopMoving()
  }

  zoomToFit = (event) => {
    this.panner = new Panner(this.panner.screenWidth, this.panner.screenHeight)
    this.setStateToPanner()
    this.stopMoving()
  }

  setStateToPanner () {
    this.setState({
      translate: { x: this.panner.x, y: this.panner.y },
      scale: this.panner.scale
    })
  }

  render () {
    const { url } = this.props
    const { moving } = this.state
    const epsilon = 0.01
    const zoomOutDisabled = this.panner.scale <= Image.minZoom + epsilon
    const zoomInDisabled = this.panner.scale >= Image.maxZoom - epsilon
    const zoomToFitDisabled = this.panner.scale > (1 - epsilon) && this.panner.scale < (1 + epsilon)
    const style = { 'backgroundSize': 'fit' }
    if (url) style['backgroundImage'] = `url(${url})`
    style['transform'] = `translate(${this.state.translate.x}px, ${this.state.translate.y}px) scale(${this.state.scale})`
    style['transformOrigin'] = 'top left'
    style['imageRendering'] = moving ? 'pixelated' : 'auto'
    return (
      <div className="Image-frame">
        <Measure>
          {({width, height}) => {
            this.panner.updateScreen(width, height)
            return (
              <div className="Image" ref="image" style={style}
                   onMouseDown={this.startDrag} onWheel={this.zoom}>
              </div>
            )
          }}
        </Measure>
        <div className="Image-controls">
          <button disabled={zoomOutDisabled} className="icon-zoom-out" onClick={this.zoomOut} />
          <button disabled={zoomToFitDisabled} className="icon-expand3" onClick={this.zoomToFit} />
          <button disabled={zoomInDisabled} className="icon-zoom-in" onClick={this.zoomIn} />
        </div>
      </div>
    )
  }
}

// Utility class for managing the panned region
class Panner {
  constructor (screenWidth, screenHeight, scale, x, y, width, height) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.x = x || 0
    this.y = y || 0
    this.scale = scale || 1
    this.width = width || this.scale * screenWidth
    this.height = height || this.scale * screenHeight
  }

  updateScreen (screenWidth, screenHeight) {
    if (screenWidth !== this.screenWidth) {
      this.screenWidth = screenWidth
      this.width = this.scale * screenWidth
    }
    if (screenHeight !== this.screenHeight) {
      this.screenHeight = screenHeight
      this.height = this.scale * screenHeight
    }
  }

  pan (screenX, screenY) {
    this.x += screenX
    this.y += screenY
  }

  panFrom (screenStart, screenEnd) {
    this.pan(screenEnd.x - screenStart.x, screenEnd.y - screenStart.y)
  }

  // find zoom point in pre-zoom viewport
  // make that point the same in the post-zoom viewport
  zoom (scale, screenCenter) {
    let xScale = this.screenWidth / this.width
    // let yScale = this.screenHeight / this.height
    const v1 = this.convert(screenCenter, this.x, this.y, xScale)
    this.x = this.x * (scale / this.scale)
    this.y = this.y * (scale / this.scale)
    this.width = this.screenWidth * scale
    this.height = this.screenHeight * scale
    this.scale = scale

    xScale = this.screenWidth / this.width
    // yScale = this.screenHeight / this.height
    const v2 = this.convert(screenCenter, this.x, this.y, xScale)
    const deltaX = v2.x - v1.x
    const deltaY = v2.y - v1.y
    this.x += deltaX * scale
    this.y += deltaY * scale
  }

  convert (point, originX, originY, scale) {
    return {
      x: scale * (point.x - originX),
      y: scale * (point.y - originY)
    }
  }
}
