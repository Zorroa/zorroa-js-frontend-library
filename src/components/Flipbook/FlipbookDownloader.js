import React, { PureComponent, PropTypes } from 'react'
import getImage from '../../services/getImage'
import api from '../../api'

function getTotalFrames (frames) {
  // Gets the total number of frames in a Flipbook based on the largest "frame
  // number." This is because there could be dropped frames, so simply doing
  // a `frames.length` could return less frames than actually exist

  return frames.reduce((numberOfFrames, frame) => {
    if (frame.number > numberOfFrames) {
      return frame.number
    }

    return numberOfFrames
  }, 0)
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function withFlipbook (WrappedComponent) {
  return class FlipbookDownloader extends PureComponent {
    static displayName = `WithFlipbook(${getDisplayName(WrappedComponent)})`
    static propTypes = {
      clipParentId: PropTypes.string.isRequired
    }
    constructor (props) {
      super(props)

      this.state = {
        loadImagesCount: 0,
        totalFrames: 0,
        frames: []
      }

      this.downloadableFrameCount = 0

      this.downloadBitmapImages()
    }

    downloadBitmapImages () {
      api
        .flipbook
        .get(this.props.clipParentId)
        .then(frames => {
          this.downloadableFrameCount = frames.length

          return Promise.all(frames.map(frame => {
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
          }))
        }).then(framesWithBitmaps => {
          this.setState({
            frames: framesWithBitmaps,
            totalFrames: getTotalFrames(framesWithBitmaps)
          })
        })
    }

    getLoadedPercentage () {
      const percentage = Math.floor((this.state.loadImagesCount / this.downloadableFrameCount) * 100)

      if (Number.isNaN(percentage)) {
        return 0
      }

      return percentage
    }

    render () {
      // Filter out extra props that are specific to this HOC
      // eslint-disable-next-line no-unused-vars
      const { clipParentId, ...passThroughProps } = this.props

      return <WrappedComponent
        loadedPercentage={this.getLoadedPercentage()}
        frames={this.state.frames}
        totalFrames={this.state.totalFrames}
        {...passThroughProps}
      />
    }
  }
}
