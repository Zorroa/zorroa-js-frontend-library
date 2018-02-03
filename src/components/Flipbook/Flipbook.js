import React, { PureComponent, PropTypes } from 'react'
import CanvasImage from '../CanvasImage'
import { PubSub } from '../../services/jsUtil'

export default class Flipbook extends PureComponent {
  static propTypes = {
    onError: PropTypes.func,
    fps: PropTypes.number,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub),
    frames: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      imageBitmap: PropTypes.instanceOf(ImageBitmap),
      number: PropTypes.number.isRequired
    })).isRequired,
    onFrameLoaded: PropTypes.func,
    totalFrames: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    // Tracks the identifier for the queued requestAnimationFrame call
    this.animationFrameId = undefined

    // Tracks the current frame number that has been rendered
    this.animationFrameNumber = undefined

    this.state = {
      currentFrameImage: undefined
    }
  }

  getNumberOfFrames () {
    return this.props.totalFrames
  }

  closestNumber (array, targetNumber) {
    return array.reduce((closestNumber, potentiallyCloserNumber) => {
      const currentDistance = Math.abs(potentiallyCloserNumber - targetNumber)
      const lastDistance = Math.abs(closestNumber - targetNumber)
      const isNewDistanceCloser = currentDistance < lastDistance
      if (isNewDistanceCloser) {
        return potentiallyCloserNumber
      }

      return closestNumber
    })
  }

  getClosestFrameByFrameNumber (desiredFrameNumber) {
    const frames = this.props.frames
    const frameNumbers = frames.reduce((accumulator, frame) => {
      accumulator.push(frame.number)
      return accumulator
    }, [])
    const closestFrameNumber = this.closestNumber(frameNumbers, desiredFrameNumber)

    const frame = frames.find(frame => frame.number === closestFrameNumber)
    return frame
  }

  getCurrentFrameNumberByTime (totalFrames, fps, forcedTimeOffset, animationStartTime) {
    const totalRunTimeMilliseconds = (totalFrames / this.props.fps) * 1000
    const elapsedTimeMilliseconds = Number(new Date()) + forcedTimeOffset - animationStartTime
    const completedPercentage = elapsedTimeMilliseconds / totalRunTimeMilliseconds
    const currentFrameNumber = Math.floor(completedPercentage * totalFrames)

    return currentFrameNumber
  }

  animationLoop = ({
    animationStartTime,
    forcedTimeOffset,
    totalFrames
  }) => {
    const currentFrameNumber = this.getCurrentFrameNumberByTime(
      totalFrames,
      this.props.fps,
      forcedTimeOffset,
      animationStartTime
    )
    const frame = this.getClosestFrameByFrameNumber(currentFrameNumber)

    if (currentFrameNumber > totalFrames) {
      this.cancelAnimation()
      return
    }

    this.drawFrame(frame)

    this.animationFrameId = requestAnimationFrame(() => {
      this.animationLoop({
        animationStartTime,
        forcedTimeOffset,
        totalFrames
      })
    })
  }

  publishStatusTopic = (topic, data) => {
    if (this.props.status !== undefined) {
      this.props.status.publish(topic, data)
    }
  }

  onError (error) {
    console.error(error)
    if (typeof this.props.onError() === 'function') {
      this.props.onError({
        message: 'Unable to download an image for Flipbook'
      })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const didFramesChange = nextProps.frames !== this.props.frames
    const didSetNewFrame = nextState.currentFrameImage !== this.state.currentFrameImage
    return (didFramesChange || didSetNewFrame)
  }

  cancelAnimation () {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.publishStatusTopic('playing', false)
    this.publishStatusTopic('started', false)
    this.animationFrameId = undefined
  }

  registerShuttlerHandles () {
    if (this.props.shuttler === undefined) {
      return
    }

    this.props.shuttler.on('startOrStop', () => {
      if (this.animationFrameId) {
        this.cancelAnimation()
        return
      }

      this.startAnimationLoop()
    })

    this.props.shuttler.on('stop', () => {
      this.cancelAnimation()
    })

    this.props.shuttler.on('start', () => {
      this.startAnimationLoop()
    })

    this.props.shuttler.on('rewind', () => {
      this.jumpToFrame(0)
    })

    this.props.shuttler.on('fastForward', () => {
      const lastFrameNumber = this.getNumberOfFrames()
      this.jumpToFrame(lastFrameNumber)
    })

    this.props.shuttler.on('frameForward', () => {
      const nextFrameNumber = this.animationFrameNumber + 1
      this.jumpToFrame(nextFrameNumber)
    })

    this.props.shuttler.on('frameBack', () => {
      const previousFrameNumber = this.animationFrameNumber - 1
      this.jumpToFrame(previousFrameNumber)
    })

    this.props.shuttler.on('scrub', (frameNumber) => {
      this.jumpToFrame(frameNumber)
    })
  }

  jumpToFrame = (frameNumber) => {
    const frame = this.getClosestFrameByFrameNumber(frameNumber)
    this.cancelAnimation()
    this.drawFrame(frame)
  }

  componentDidMount () {
    this.registerShuttlerHandles()
    this.startAnimationLoop()
  }

  /**
   * A frame of a Flipbook frame is selected based on how much time has elapsed compared
   * to the total duration of a full Flipbook animation. In order to support changing
   * frames over the length of the animation a "time offset" value can be provided
   * that will alter where the animation think's it is within the timeline.
   */
  getForcedTimeOffset () {
    let forcedTimeOffset = 0

    if (Number.isInteger(this.forcedFrameNumber)) {
      const frameDurationMilliseconds = 1 / this.props.fps * 1000
      forcedTimeOffset = frameDurationMilliseconds * this.forcedFrameNumber
    }

    return forcedTimeOffset
  }

  getAnimationLoopParameters () {
    const animationStartTime = Number(new Date())

    return {
      animationStartTime,
      forcedTimeOffset: this.getForcedTimeOffset(),
      frames: this.props.frames,
      totalFrames: this.getNumberOfFrames()
    }
  }

  drawFrame = frame => {
    const image = frame.imageBitmap
    this.animationFrameNumber = frame.number

    this.setState({
      currentFrameImage: image
    })

    this.publishStatusTopic('played', frame.number)
  }

  getCanvasDimensions () {
    let width = Math.floor(window.innerWidth)
    let height = Math.floor(window.innerHeight)

    const frame = this.props.frames[0]
    const aspectRatio = frame.imageBitmap.width / frame.imageBitmap.height

    if (aspectRatio > 1) {
      height = Math.round(width / aspectRatio)
    } else {
      width = Math.round(height * aspectRatio)
    }

    return {
      height,
      width
    }
  }

  startAnimationLoop () {
    this.publishStatusTopic('started', true) // TODO, this might not be the right place for this...
    this.publishStatusTopic('playing', true)
    this.animationLoop(this.getAnimationLoopParameters())
  }

  render () {
    const image = this.state.currentFrameImage

    if (image === undefined) {
      return null
    }

    return (
      <div className="Flipbook">
        <div className="Flipbook__canvas">
          <CanvasImage
            image={image}
            height={image.height}
            width={image.width}
          />
        </div>
      </div>
    )
  }
}
