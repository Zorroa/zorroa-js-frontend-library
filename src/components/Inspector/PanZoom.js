import React, { Component, PropTypes } from 'react'
import Measure from 'react-measure'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import User from '../../models/User'
import Controlbar from './Controlbar'
import { PubSub } from '../../services/jsUtil'
import { lightboxPanner } from '../../actions/appActions'
import { saveUserSettings } from '../../actions/authAction'

class PanZoom extends Component {
  static propTypes = {
    title: PropTypes.node,
    titleWidth: PropTypes.number,
    showControls: PropTypes.bool,
    onNextPage: PropTypes.func,
    onPrevPage: PropTypes.func,
    onScrub: PropTypes.func,
    onLoop: PropTypes.func,
    loopPaused: PropTypes.bool,
    shouldLoop: PropTypes.bool,
    frameFrequency: PropTypes.object,
    shuttler: PropTypes.instanceOf(PubSub),
    playing: PropTypes.bool,
    onVolume: PropTypes.func,
    volume: PropTypes.number,
    minZoom: PropTypes.number, // This coonfiguration won't always be configured
    maxZoom: PropTypes.number, // This coonfiguration won't always be configured
    lightboxPanner: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      scale: PropTypes.number.isRequired,
    }),
    currentFrameNumber: PropTypes.number,
    totalFrames: PropTypes.number,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    showControls: true,
  }

  state = {
    moving: false,
  }

  constructor(props) {
    super(props)

    this.maxZoom = props.maxZoom / 100 || 4
    this.minZoom = props.minZoom / 100 || 1 / this.maxZoom
  }

  componentWillMount() {
    this.panner = new Panner(this.props.lightboxPanner || {})
  }

  savePanner = () => {
    this.props.actions.lightboxPanner(this.panner)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      lightboxPanner: this.panner,
    })
  }

  // Keep track of when the image is in motion, so we can
  // temporarily drop image quality in favor of responsiveness.
  // Call this every time the image starts moving, and
  // during every frame the image moves.
  startMoving = () => {
    if (this.movingTimer) {
      clearTimeout(this.movingTimer)
    } else {
      this.setState({ moving: true })
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
      this.setState({ moving: false })
      this.movingTimer = null
    }
  }

  startDrag = event => {
    this.startX = event.pageX
    this.startY = event.pageY
    document.addEventListener('mouseup', this.stopDrag, true)
    document.addEventListener('mousemove', this.drag, true)
    this.startMoving()
  }

  stopDrag = event => {
    document.removeEventListener('mouseup', this.stopDrag, true)
    document.removeEventListener('mousemove', this.drag, true)
    this.savePanner()
    this.stopMoving()
  }

  drag = event => {
    this.panner.panFrom(
      { x: this.startX, y: this.startY },
      { x: event.pageX, y: event.pageY },
    )
    this.startX = event.pageX
    this.startY = event.pageY
    this.forceUpdate()
    this.startMoving()
  }

  zoom = event => {
    const { scale } = this.panner
    const scalePct = 1 + Math.abs(event.deltaY) * 0.005
    const scaleMult = event.deltaY > 0 ? scalePct : 1 / scalePct
    const zoomFactor = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, scale * scaleMult),
    )
    const topPadding = 0 // Note this value needs to also be changed in PanZoom.scss
    const leftPadding = 0 // Note this value needs to be also changed in PanZoom.scss
    this.panner.zoom(zoomFactor, {
      x: event.pageX - leftPadding,
      y: event.pageY - topPadding,
    })
    this.forceUpdate()
    this.startMoving()
  }

  zoomIn = event => {
    this.zoom({
      ...event,
      deltaY: 50,
      pageX: this.panner.screenWidth / 2,
      pageY: this.panner.screenHeight / 2,
    })
    this.savePanner()
    this.stopMoving()
  }

  zoomOut = event => {
    this.zoom({
      ...event,
      deltaY: -50,
      pageX: this.panner.screenWidth / 2,
      pageY: this.panner.screenHeight / 2,
    })
    this.savePanner()
    this.stopMoving()
  }

  zoomToFit = event => {
    const { screenWidth, screenHeight } = this.panner
    this.panner = new Panner({ screenWidth, screenHeight })
    this.forceUpdate()
    this.savePanner()
    this.stopMoving()
  }

  render() {
    const {
      title,
      titleWidth,
      showControls,
      onPrevPage,
      onNextPage,
      onLoop,
      loopPaused,
      shouldLoop,
      onScrub,
      frameFrequency,
      onVolume,
      volume,
      shuttler,
      playing,
      userSettings,
      totalFrames,
      currentFrameNumber,
    } = this.props
    const { moving } = this.state
    const epsilon = 0.01
    const zoomOutDisabled = this.panner.scale <= this.minZoom + epsilon
    const zoomInDisabled = this.panner.scale >= this.maxZoom - epsilon
    const zoomToFitDisabled =
      this.panner.scale > 1 - epsilon && this.panner.scale < 1 + epsilon
    const pannerX = Math.round(this.panner.x)
    const pannerY = Math.round(this.panner.y)
    const pannerScale = this.panner.scale
    const style = {
      transform: `translate(${pannerX}px, ${pannerY}px) scale(${pannerScale})`,
      transformOrigin: 'top left',
      willChange: 'transform',
      imageRendering:
        moving && userSettings.fastLightboxPanning ? 'pixelated' : 'auto',
    }
    return (
      <Measure>
        {({ width, height }) => {
          this.panner.updateScreen(width, height)
          return (
            <div className="PanZoom-frame">
              <div
                className="PanZoom"
                style={style}
                onMouseDown={this.startDrag}
                onWheel={this.zoom}>
                {this.props.children}
              </div>
              {showControls && (
                <Controlbar
                  title={title}
                  titleWidth={titleWidth}
                  onZoomOut={(!zoomOutDisabled && this.zoomOut) || null}
                  onZoomIn={(!zoomInDisabled && this.zoomIn) || null}
                  onFit={(!zoomToFitDisabled && this.zoomToFit) || null}
                  onNextPage={onNextPage}
                  onPrevPage={onPrevPage}
                  onScrub={onScrub}
                  onVolume={onVolume}
                  volume={volume}
                  shuttler={shuttler}
                  playing={playing}
                  frameFrequency={frameFrequency}
                  totalFrames={totalFrames}
                  currentFrameNumber={currentFrameNumber}
                  onLoop={onLoop}
                  shouldLoop={shouldLoop}
                  loopPaused={loopPaused}
                />
              )}
            </div>
          )
        }}
      </Measure>
    )
  }
}

export default connect(
  state => ({
    lightboxPanner: state.app.lightboxPanner,
    user: state.auth.user,
    userSettings: state.app.userSettings,
    minZoom: parseInt(
      state.archivist.settings['curator.lightbox.zoom-min'].currentValue,
      10,
    ),
    maxZoom: parseInt(
      state.archivist.settings['curator.lightbox.zoom-max'].currentValue,
      10,
    ),
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        lightboxPanner,
        saveUserSettings,
      },
      dispatch,
    ),
  }),
)(PanZoom)

// Utility class for managing the panned region
class Panner {
  constructor({ screenWidth, screenHeight, scale, x, y, width, height }) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.x = x || 0
    this.y = y || 0
    this.scale = scale || 1
    this.width = width || this.scale * screenWidth
    this.height = height || this.scale * screenHeight
  }

  updateScreen(screenWidth, screenHeight) {
    if (screenWidth !== this.screenWidth) {
      this.screenWidth = screenWidth
      this.width = this.scale * screenWidth
    }
    if (screenHeight !== this.screenHeight) {
      this.screenHeight = screenHeight
      this.height = this.scale * screenHeight
    }
  }

  pan(screenX, screenY) {
    this.x += screenX
    this.y += screenY
  }

  panFrom(screenStart, screenEnd) {
    this.pan(screenEnd.x - screenStart.x, screenEnd.y - screenStart.y)
  }

  // find zoom point in pre-zoom viewport
  // make that point the same in the post-zoom viewport
  zoom(scale, screenCenter) {
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

  convert(point, originX, originY, scale) {
    return {
      x: scale * (point.x - originX),
      y: scale * (point.y - originY),
    }
  }
}
