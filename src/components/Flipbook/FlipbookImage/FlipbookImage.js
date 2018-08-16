import PropTypes from 'prop-types'
import React, { Component } from 'react'

import ProgressCircle from '../../ProgressCircle'
import { PubSub } from '../../../services/jsUtil'
import Asset from '../../../models/Asset'
import classnames from 'classnames'

export default class FlipbookImage extends Component {
  static propTypes = {
    origin: PropTypes.string.isRequired,
    defaultFrame: PropTypes.instanceOf(Asset),
    autoPlay: PropTypes.bool,
    shouldLoop: PropTypes.bool,
    fps: PropTypes.number,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub),
    frames: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    shouldHold: PropTypes.bool,
    height: PropTypes.number,
    width: PropTypes.number,
  }

  static defaultProps = {
    frames: [],
    fps: 12,
    autoPlay: false,
    shouldLoop: true,
    shouldHold: false,
  }

  constructor(props) {
    super(props)

    this.elapsedHeldFrames = 0
    this.state = this.getInitialState(props)
  }

  componentDidMount() {
    this.registerShuttlerHandles()
  }

  componentWillUnmount() {
    this.stopAnimation()
  }

  componentDidUpdate(prevProps, prevState) {
    const { loadedFrameCount } = this.state
    const { frames } = this.props
    const hasDefaultFrame = this.props.defaultFrame !== undefined
    const isFirstLoad =
      this.isLoaded() && prevState.loadedFrameCount < loadedFrameCount
    if (isFirstLoad && this.isAutoPlay()) {
      this.startAnimation()
    } else if (
      isFirstLoad &&
      hasDefaultFrame === false &&
      frames &&
      frames.length > 0
    ) {
      this.setActiveFrame(frames[0])
    }

    if (this.props.fps !== prevProps.fps) {
      // Restart the animation to start with the new frame rate
      this.stopAnimation()
      this.startAnimation()
    }
  }

  registerShuttlerHandles() {
    if (this.props.shuttler === undefined) {
      return
    }

    this.props.shuttler.on('startOrStop', this.startOrStop)
    this.props.shuttler.on('stop', this.stop)
    this.props.shuttler.on('start', this.start)
    this.props.shuttler.on('rewind', this.rewind)
    this.props.shuttler.on('fastForward', this.fastForward)
    this.props.shuttler.on('frameForward', this.frameForward)
    this.props.shuttler.on('frameBack', this.frameBack)
    this.props.shuttler.on('scrub', this.scrub)
    this.props.shuttler.on('scrubByPercent', this.scrubByPercent)
  }

  getClosestFrameByPercent = percent => {
    const { frames } = this.props
    const firstFrame = frames[0].startPage()
    const lastFrame = frames[frames.length - 1].startPage()
    const totalFrames = lastFrame - firstFrame
    const closestFrameNumber = Math.floor(totalFrames * percent)
    const framesByDistance = [...frames].sort((frameA, frameB) => {
      if (
        Math.abs(closestFrameNumber - frameA.startPage()) >=
        Math.abs(closestFrameNumber - frameB.startPage())
      ) {
        return 1
      }
      return -1
    })
    return framesByDistance[0]
  }

  scrubByPercent = percent => {
    if (percent === undefined) {
      console.error('Cannot scrub to an undefined percentage')
      return
    }

    const normalizedPercent = Math.max(0, Math.min(1, percent))
    const { frames, shouldHold } = this.props
    let frameIndex = Math.floor(frames.length * normalizedPercent)

    if (shouldHold === true) {
      const closestFrame = this.getClosestFrameByPercent(percent)
      frameIndex = frames.findIndex(frame => frame.id === closestFrame.id)
    }

    const activeFrame = frames[frameIndex]
    this.setActiveFrame(activeFrame)
  }

  scrub = frameNumber => {
    if (frameNumber === undefined) {
      console.error('Cannot scrub to an undefined frame')
      return
    }

    const frame = this.props.frames.find(
      frame => frame.startPage() === frameNumber,
    )

    if (frame === undefined) {
      console.error(`Cannot scrub to missing frame no. ${frameNumber}.`)
      return
    }

    this.setActiveFrame(frame)
  }

  frameForward = () => {
    const { activeFrame } = this.state
    const { frames } = this.props
    this.pause()
    const activeFrameIndex = frames.indexOf(activeFrame)
    const nextFrame = frames[activeFrameIndex + 1]

    if (nextFrame) {
      this.setActiveFrame(nextFrame)
    }
  }

  frameBack = () => {
    const { activeFrame } = this.state
    const { frames } = this.props
    this.pause()
    const activeFrameIndex = frames.indexOf(activeFrame)
    const previousFrame = frames[activeFrameIndex - 1]

    if (previousFrame) {
      this.setActiveFrame(previousFrame)
    }
  }

  rewind = forceStart => {
    const { frames } = this.props
    const shouldStartAfterRewind =
      forceStart === true || this.isPlaying() === true
    const startCallback = shouldStartAfterRewind ? this.start : undefined
    this.stopAnimation()
    this.setActiveFrame(frames[0], startCallback)
  }

  fastForward = () => {
    const { frames } = this.props
    this.stopAnimation()
    this.setActiveFrame(frames[frames.length - 1])
  }

  stop = () => {
    this.stopAnimation()
  }

  start = () => {
    this.startAnimation()
  }

  startOrStop = () => {
    if (this.isAtEndOfAnimation()) {
      const forceStart = true
      this.rewind(forceStart)
    }

    if (this.isPaused()) {
      return this.unpause()
    }

    if (this.isPlaying() && this.isPaused() === false) {
      return this.pause()
    }

    if (this.isLoaded() && this.isPlaying() === false) {
      return this.start()
    }
  }

  pause() {
    this.publishStatusTopic('playing', false)

    this.setState({
      isPaused: true,
    })
  }

  unpause() {
    if (this.isPlaying()) {
      this.publishStatusTopic('playing', true)
    }

    this.setState({
      isPaused: false,
    })
  }

  isAtEndOfAnimation() {
    const { activeFrame } = this.state
    const { frames } = this.props
    const lastFrameIndex = frames.length - 1
    const isLastFrame =
      activeFrame && activeFrame.id === frames[lastFrameIndex].id
    return isLastFrame
  }

  getInitialState(props) {
    let defaultFrame

    if (props) {
      defaultFrame = props.defaultFrame
    } else if (this.props) {
      defaultFrame = this.props.defaultFrame
    }

    return {
      loadedFrameCount: 0,
      isInMandatoryLoadingPeriod: true,
      isPaused: false,
      activeFrame: defaultFrame,
    }
  }

  publishStatusTopic = (topic, data) => {
    if (this.props.status !== undefined) {
      this.props.status.publish(topic, data)
    }
  }

  isAutoPlay() {
    return this.props.autoPlay === true
  }

  shouldLoop() {
    return this.props.shouldLoop === true
  }

  isPaused() {
    return this.state.isPaused === true
  }

  clearMandatoryLoadingPeriodTimeout() {
    clearTimeout(this.mandatoryLoadingPeriodTimeoutId)
  }

  calculateFrameElapsedPosition() {
    const { frames } = this.props
    const activeFrameIndex = this.getActiveFrameIndex()

    if (activeFrameIndex === 0) {
      this.publishStatusTopic('elapsedPercent', 0)
      return
    }

    if (this.props.shouldHold === true) {
      this.calculateFrameElapsedPositionWithHoldOffset()
      return
    }

    this.publishStatusTopic(
      'elapsedPercent',
      Math.max(0, activeFrameIndex / (frames.length - 1)),
    )
  }

  calculateFrameElapsedPositionWithHoldOffset() {
    const { frames } = this.props
    const { activeFrame } = this.state
    const firstFrame = frames[0]
    const lastFrame = frames[frames.length - 1]

    const totalFrames = lastFrame.startPage() - firstFrame.startPage()

    if (totalFrames === 0) {
      this.publishStatusTopic('elapsedPercent', 0)
      return
    }

    const elapsedFrames =
      activeFrame.startPage() - firstFrame.startPage() + this.elapsedHeldFrames
    const elapsedPercent = elapsedFrames / totalFrames
    this.publishStatusTopic('elapsedPercent', Math.max(0, elapsedPercent))
  }

  updateDefaultFrameElapsedPosition() {
    const { activeFrame } = this.state

    if (activeFrame === undefined) {
      this.publishStatusTopic('elapsedPercent', 0)
      return
    }

    this.calculateFrameElapsedPosition()
  }

  startAnimation() {
    if (this.isPlaying()) {
      console.error(
        'Starting an animation while an animation is already playing is forbidden',
      )
      return
    }

    this.publishStatusTopic('started', true)
    this.publishStatusTopic('playing', true)
    this.publishStatusTopic('loopPaused', false)

    const delay = this.getFrameDisplayMilliseconds()
    this.animationIntervalId = setInterval(this.animationInterval, delay)
  }

  setActiveFrame(activeFrame, callback) {
    this.setState(
      {
        activeFrame,
      },
      () => {
        this.notifySubscribeesOfNewFrame()
        if (typeof callback === 'function') {
          callback()
        }
      },
    )
  }

  animationInterval = () => {
    if (this.props.shouldHold === true) {
      this.animationHoldStateUpdate()
      return
    }

    this.animationStateUpdate()
  }

  isNextFrameMissing() {
    return this.getNextFrameMissingCount() > 0
  }

  getNextFrameMissingCount() {
    const { activeFrame } = this.state
    const { frames } = this.props
    const activeFrameIndex = frames.indexOf(activeFrame)
    let potentialNextFrameIndex = activeFrameIndex + 1
    const nextFrame = frames[potentialNextFrameIndex]
    const isAtEndOfAnimation = nextFrame === undefined
    const isMissingActiveFrame = activeFrame === undefined

    if (isAtEndOfAnimation || isMissingActiveFrame) {
      return 0
    }

    const distanceBetweenFrames =
      nextFrame.startPage() - activeFrame.startPage()
    const missingFrameCount = distanceBetweenFrames - 1
    return Math.max(0, missingFrameCount)
  }

  animationHoldStateUpdate = () => {
    const { frames } = this.props
    const activeFrameIndex = this.getActiveFrameIndex()
    let potentialNextFrameIndex = activeFrameIndex + 1
    const isAtEndOfAnimation = frames[potentialNextFrameIndex] === undefined

    if (this.isPaused()) {
      return
    }

    if (
      this.getNextFrameMissingCount() > 0 &&
      this.elapsedHeldFrames < this.getNextFrameMissingCount()
    ) {
      this.elapsedHeldFrames += 1
      this.calculateFrameElapsedPositionWithHoldOffset()
      return
    } else {
      this.elapsedHeldFrames = 0
    }

    if (isAtEndOfAnimation && this.shouldLoop()) {
      potentialNextFrameIndex = 0
    } else if (isAtEndOfAnimation) {
      this.stopAnimation()
      return
    }

    const nextActiveFrame = frames[potentialNextFrameIndex]
    this.setActiveFrame(nextActiveFrame)
  }

  getActiveFrameIndex() {
    const { activeFrame } = this.state
    const { frames } = this.props

    if (activeFrame === undefined) {
      return -1
    }

    const activeFrameIndex = frames.findIndex(frame => {
      return activeFrame.id === frame.id
    })

    return activeFrameIndex
  }

  animationStateUpdate = () => {
    const { frames } = this.props
    const activeFrameIndex = this.getActiveFrameIndex()

    let potentialNextFrameIndex = activeFrameIndex + 1
    const isAtEndOfAnimation = frames[potentialNextFrameIndex] === undefined
    if (this.isPaused()) {
      return
    }

    if (isAtEndOfAnimation && this.shouldLoop()) {
      potentialNextFrameIndex = 0
    } else if (isAtEndOfAnimation) {
      this.stopAnimation()
      return
    }

    const nextActiveFrame = frames[potentialNextFrameIndex]
    this.setActiveFrame(nextActiveFrame)
  }

  notifySubscribeesOfNewFrame = () => {
    const { activeFrame } = this.state

    this.calculateFrameElapsedPosition()

    // In order to maintain API compability with the Video player, this emits the frame number
    this.publishStatusTopic('played', activeFrame && activeFrame.startPage())

    // This allows subscribees to get the entire activeFrame object
    this.publishStatusTopic('playedFlipbookFrame', activeFrame)
  }

  stopAnimation() {
    // Reset the animation interval
    clearInterval(this.animationIntervalId)
    this.animationIntervalId = undefined

    // Alert subscribers that the animation has ended
    this.publishStatusTopic('playing', false)
    this.publishStatusTopic('started', false)
  }

  getFrameDisplayMilliseconds() {
    return 1 / this.props.fps * 1000
  }

  onFrameLoad = () => {
    if (this.state.loadedFrameCount === 0) {
      this.updateDefaultFrameElapsedPosition()
    }

    if (
      this.props.frames.length > 0 &&
      this.state.loadedFrameCount + 1 === this.props.frames.length
    ) {
      this.publishStatusTopic('load')
    }

    this.setState(state => {
      return {
        loadedFrameCount: state.loadedFrameCount + 1,
      }
    })
  }

  isLoaded() {
    const isLoaded = this.getLoadedPercentage() === 1
    const isInMandatoryLoadingPeriod = this.isInMandatoryLoadingPeriod === false
    return isLoaded || isInMandatoryLoadingPeriod
  }

  isPlaying() {
    return this.animationIntervalId !== undefined
  }

  getLoadedPercentage() {
    const { loadedFrameCount } = this.state
    const { frames } = this.props

    // Prevent division by zero errors and useless calculations if nothing is loaded
    if (frames === undefined || frames.length === 0 || loadedFrameCount === 0) {
      return 0
    }

    return loadedFrameCount / frames.length
  }

  getHighPriorityFrameFirst = (frame, index) => {
    const { loadedFrameCount } = this.state
    const { defaultFrame } = this.props
    const isHigherPriorityFrameLoaded = loadedFrameCount > 0

    if (
      isHigherPriorityFrameLoaded === false &&
      defaultFrame === undefined &&
      index === 0
    ) {
      return frame
    }

    if (isHigherPriorityFrameLoaded) {
      return frame
    }

    if (defaultFrame && frame.id === defaultFrame.id) {
      return frame
    }
  }

  shouldFrameBeVisible(frame) {
    const { activeFrame } = this.state
    const { defaultFrame } = this.props
    const isDefaultFrame = defaultFrame && defaultFrame.id === frame.id
    const isActiveFrame = activeFrame && activeFrame.id === frame.id
    const isLoaded = this.isLoaded()

    if (isLoaded && isActiveFrame) {
      return true
    }

    if (isLoaded === false && isDefaultFrame) {
      return true
    }

    return false
  }

  getFormattedLoadingPercentage() {
    let baseLoadPercentage = 0
    if (this.state.isInMandatoryLoadingPeriod === false) {
      // When things are taking a long time make it seem like something is happening
      baseLoadPercentage += 0.1
    }

    const loadedPercentage = this.getLoadedPercentage() + baseLoadPercentage

    return Math.round(Math.min(loadedPercentage, 1) * 100)
  }

  render() {
    const { frames, height, width } = this.props
    const formattedLoadingPercentage = this.getFormattedLoadingPercentage()
    const prioritizedFrames = frames.filter(this.getHighPriorityFrameFirst)
    const isNothingLoaded = this.getLoadedPercentage() === 0
    const loadingClasses = classnames('FlipbookImage__loading-status', {
      'FlipbookImage__loading-status--no-frame-metadata': isNothingLoaded,
    })
    return (
      <div>
        <div className="FlipbookImage">
          {this.isLoaded() === false && (
            <div
              className={loadingClasses}
              style={{
                height: height,
                width: width,
              }}>
              <ProgressCircle percentage={formattedLoadingPercentage} />
            </div>
          )}
          {prioritizedFrames.map(frame => {
            const isVisible = this.shouldFrameBeVisible(frame)
            return (
              <img
                onLoad={this.onFrameLoad}
                height={height}
                width={width}
                key={frame.id}
                style={{
                  pointerEvents: 'none',
                  visibility: isVisible ? 'visible' : 'hidden',
                  position: isVisible ? 'static' : 'absolute',
                }}
                src={frame.closestProxyURL(
                  this.props.origin,
                  width || window.innerWidth,
                  height || window.innerHeight,
                )}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
