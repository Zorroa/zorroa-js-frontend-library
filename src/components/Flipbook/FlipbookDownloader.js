import React, { PureComponent } from 'react'
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

export default function withFlipbook (WrappedComponent, flipbookAssetId) {
  return class FlipbookDownloader extends PureComponent {
    constructor (props) {
      super(props)

      this.state = {
        loadImagesCount: 0,
        totalFrames: 0,
        frames: []
      }

      this.downloadBitmapImages()
    }

    downloadBitmapImages () {
      api
        .flipbook
        .get(flipbookAssetId)
        .then(frames => {
          const loadingFrames = frames.map(frame => {
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
          return Promise.all(loadingFrames)
        }).then(framesWithBitmaps => {
          this.setState({
            frames: framesWithBitmaps,
            totalFrames: getTotalFrames(framesWithBitmaps)
          })
        })
    }

    getLoadedPercentage () {
      if (this.state.frames.length === 0) {
        return 0
      }

      const percentage = Math.floor((this.state.loadImagesCount / this.state.frames.length) * 100)

      if (Number.isNaN(percentage)) {
        return 0
      }

      return percentage
    }

    render () {
      return <WrappedComponent
        loadedPercentage={this.getLoadedPercentage()}
        frames={this.state.frames}
        totalFrames={this.state.totalFrames}
        {...this.props}
      />
    }
  }
}
