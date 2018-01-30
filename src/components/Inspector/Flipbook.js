import React, { Component, PropTypes } from 'react'
import ProgressCircle from '../ProgressCircle'
import { PubSub } from '../../services/jsUtil'
import getImage from '../../services/getImage'

import {
  FLIPBOOK_STARTED,
  FLIPBOOK_FRAME_SELECTED,
  FLIPBOOK_STOPPED
} from '../../constants/pubSubTopics'
const mockFrames = [{
  number: 1,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 5,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 10,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 15,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 65,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 130,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}, {
  number: 135,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 140,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 145,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 150,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}]

function findLastFrame (framesToFind) {
  return framesToFind.reduce((numberOfFrames, frame) => {
    if (frame.number > numberOfFrames) {
      return frame.number
    }

    return numberOfFrames
  }, 0)
}

function animationLoop ({
  frames,
  fps,
  time,
  canvas,
  lastFrame,
  publishStatusTopic,
  totalFrames
}) {
  const totalRunTimeMilliseconds = (totalFrames / fps) * 1000
  const elapsedTimeMilliseconds = Number(new Date()) - time
  const completedPercentage = elapsedTimeMilliseconds / totalRunTimeMilliseconds
  const currentFrameNumber = Math.floor(completedPercentage * totalFrames)
  if (currentFrameNumber >= totalFrames) {
    publishStatusTopic(FLIPBOOK_FRAME_SELECTED, currentFrameNumber)
    publishStatusTopic(FLIPBOOK_STOPPED)
    return
  }

  let currentFrame = frames.find(frame => frame.number === currentFrameNumber)

  if (currentFrame === undefined && lastFrame !== undefined) {
    currentFrame = lastFrame
  }

  publishStatusTopic(FLIPBOOK_FRAME_SELECTED, currentFrameNumber)

  if (canvas &&
    currentFrame &&
    currentFrame.imageBitmap instanceof ImageBitmap === true
  ) {
    drawFrame(
      canvas.getContext('2d'),
      currentFrame.imageBitmap,
      canvas.width,
      canvas.height
    )
  } else if (!canvas) {
    console.warn('No canvas available to render')
  } else if (currentFrame && currentFrame.imageBitmap instanceof ImageBitmap === false) {
    console.warn(`Image is not a valid ImageBitmap, it is of type "${typeof image}"`)
  }

  requestAnimationFrame(() => {
    animationLoop({
      frames,
      fps,
      time,
      canvas,
      currentFrame,
      publishStatusTopic,
      totalFrames
    })
  })
}

function drawFrame (ctx, image, width, height) {
  const offsetX = 0
  const offsetY = 0

  ctx.drawImage(
    image,
    offsetX,
    offsetY,
    width,
    height,
    0,
    0,
    width,
    height
  )
}

export default class Flipbook extends Component {
  static propTypes = {
    onError: PropTypes.func,
    fps: PropTypes.number,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub)
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.state = {
      frames: mockFrames,
      loadImagesCount: 0
    }
  }

  publishStatusTopic = (topic, data) => {
    if (this.props.shuttler !== undefined) {
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
    return (nextState.loadImagesCount !== this.state.loadImagesCount ||
      nextState.frames !== this.state.frames)
  }

  componentDidMount () {
    const loadingFrames = this.state.frames.map(frame => {
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
      })
      .catch(error => {
        this.onError(error)
        this.setState({
          frames: []
        })
        return []
      })
  }

  render () {
    const areFramesLoaded = this.state.loadImagesCount === this.state.frames.length
    const loadingPercentage = Math.floor((this.state.loadImagesCount / this.state.frames.length) * 100)

    if (areFramesLoaded) {
      this.publishStatusTopic(FLIPBOOK_STARTED)
      animationLoop({
        time: Number(new Date()),
        fps: this.props.fps,
        canvas: this.canvas,
        frames: this.state.frames,
        publishStatusTopic: this.publishStatusTopic,
        totalFrames: findLastFrame(this.state.frames)
      })
    }

    return (
      <div className="Flipbook">
        { areFramesLoaded === false && (
          <ProgressCircle percentage={ loadingPercentage } />
        )}
        <canvas className="Flipbook__canvas" ref={canvas => { this.canvas = canvas } } />
      </div>
    )
  }
}
