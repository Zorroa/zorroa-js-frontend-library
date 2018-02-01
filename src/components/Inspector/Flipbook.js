import React, { PureComponent, PropTypes } from 'react'
import classnames from 'classnames'
import ProgressCircle from '../ProgressCircle'
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
    totalFrames: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.animationFrameId = undefined
    this.animationFrameNumber = undefined

    this.state = {
      frames: [],
      loadImagesCount: 0,
      currentFrame: undefined
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
    const canvas = this.canvas
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

    if (canvas !== undefined && frame !== undefined) {
      this.drawFrame(frame)
    }

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

  componentDidMount () {
    this.registerShuttlerHandles()

    const loadingFrames = this.props.frames.map(frame => {
      return getImage(frame.url)
        .then(imageBitmap => {
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
      })
      .catch(error => {
        this.onError(error)
        this.setState({
          frames: []
        })
        return []
      })
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

  drawFrame = (frame) => {
    const canvas = this.canvas
    const image = frame.imageBitmap
    this.animationFrameNumber = frame.number

    if ((image instanceof ImageBitmap) === false) {
      return
    }

    this.canvas.getContext('2d').drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    )

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
    return Math.floor((this.state.loadImagesCount / this.state.frames.length) * 100)
  }

  render () {
    const areFramesLoaded = this.areFramesLoaded()
    const { width, height } = this.getCanvasDimensions()
    const flipbookClasses = classnames('Flipbook', {
      'Flipbook--is-loading': areFramesLoaded === false
    })

    if (this.areFramesLoaded()) {
      this.startAnimationLoop()
    }

    const canvasStyle = {
      height: `${height}px`,
      width: `${width}px`
    }

    return (
      <div className={flipbookClasses}>
        { areFramesLoaded === false && (
          <div className="Flipbook__progress-circle">
            <ProgressCircle percentage={ this.getLoadedPercentage() } />
          </div>
        )}
        { areFramesLoaded === true && (
          <div className="Flipbook__canvas">
            <canvas
              ref={canvas => { this.canvas = canvas }}
              style={canvasStyle}
            />
          </div>
        )}
      </div>
    )
  }
}
