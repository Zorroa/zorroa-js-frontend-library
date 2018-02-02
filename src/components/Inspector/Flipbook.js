import React, { PureComponent, PropTypes } from 'react'
import classnames from 'classnames'
import ProgressCircle from '../ProgressCircle'
import Canvas from './Canvas'
import { PubSub } from '../../services/jsUtil'
import getImage from '../../services/getImage'

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
      frames: [],
      loadImagesCount: 0,
      currentFrameImage: undefined
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.frames !== this.props.frames) {
      this.downloadBitmapImages(nextProps.frames)
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
    const frames = this.state.frames
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
    const didNewImagesLoad = nextState.loadImagesCount !== this.state.loadImagesCount
    const didFramesChange = nextState.frames !== this.state.frames
    const didSetNewFrame = nextState.currentFrameImage !== this.state.currentFrameImage
    return (didNewImagesLoad ||
      didFramesChange ||
      didSetNewFrame
    )
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

  shouldShowLoadingStatus () {
    return typeof this.props.onFrameLoaded !== 'function'
  }

  downloadBitmapImages (frames) {
    if (frames.length === 0) {
      return
    }

    const loadingFrames = frames.map(frame => {
      return getImage(frame.url)
        .then(imageBitmap => {
          if (this.shouldShowLoadingStatus() === false) {
            this.props.onFrameLoaded(this.state.loadImagesCount + 1)
          }

          this.setState(prevState => {
            return {
              loadImagesCount: prevState.loadImagesCount + 1
            }
          })

          const dataFrame = {
            url: frame.url,
            number: frame.number,
            imageBitmap
          }

          return dataFrame
        })
    })

    Promise
      .all(loadingFrames)
      .then(frames => {
        this.setState({
          frames
        })
        this.publishStatusTopic('started', true)
        this.startAnimationLoop()
      })
      .catch(error => {
        this.onError(error)
        this.setState({
          frames: []
        })
        return []
      })
  }

  componentDidMount () {
    this.registerShuttlerHandles()
    this.downloadBitmapImages(this.props.frames)
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
      frames: this.state.frames,
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

  areFramesLoaded () {
    return this.state.loadImagesCount > 0 && this.state.loadImagesCount === this.state.frames.length
  }

  getCanvasDimensions () {
    let aspectRatio = 1
    let width = Math.floor(window.innerWidth)
    let height = Math.floor(window.innerHeight)

    if (this.areFramesLoaded() === true && this.state.frames[0].imageBitmap) {
      const frame = this.state.frames[0]
      aspectRatio = frame.imageBitmap.width / frame.imageBitmap.height
    }

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
    this.publishStatusTopic('playing', true)
    this.animationLoop(this.getAnimationLoopParameters())
  }

  getLoadedPercentage () {
    const percentage = Math.floor((this.state.loadImagesCount / this.props.frames.length) * 100)

    if (Number.isNaN(percentage)) {
      return 0
    }

    return percentage
  }

  render () {
    const areFramesLoaded = this.areFramesLoaded()
    const { width, height } = this.getCanvasDimensions()
    const flipbookClasses = classnames('Flipbook', {
      'Flipbook--is-loading': areFramesLoaded === false
    })

    const flipbookCanvasClasses = classnames('Flipbook__canvas', {
      'Flipbook__canvas--is-loading': areFramesLoaded === false
    })

    return (
      <div className={flipbookClasses}>
        { areFramesLoaded === false && this.shouldShowLoadingStatus() && (
          <div className="Flipbook__progress-circle">
            <ProgressCircle percentage={ this.getLoadedPercentage() } />
          </div>
        )}
        <div className={flipbookCanvasClasses}>
          <Canvas
            image={this.state.currentFrameImage}
            height={height}
            width={width}
          />
        </div>
      </div>
    )
  }
}
