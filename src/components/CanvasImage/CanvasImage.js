import React, { PureComponent, PropTypes } from 'react'

export default class CanvasImage extends PureComponent {
  static propTypes = {
    image: PropTypes.instanceOf(ImageBitmap),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
  }

  componentWillReceiveProps (nextProps) {
    const isImageProvided = nextProps.image !== undefined
    const isDifferentImage = nextProps.image !== this.props.image
    if (this.canvas && isImageProvided && isDifferentImage) {
      this.canvas.getContext('2d').drawImage(
        nextProps.image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      )
    } else if (isImageProvided === false && isDifferentImage) {
      console.warn('Skipping render of new frame, image is not provided')
    }
  }

  shouldComponentUpdate (nextProps) {
    // CAUTION: a new `nextProps.image` should NEVER trigger an update. The
    // canvas is the leaf node of the DOM here, changing an image does
    // not change the DOM, since the canvas exposes a totally seperate API

    const isHeightChanged = nextProps.height !== this.props.height
    const isWidthChanged = nextProps.width !== this.props.width
    return (isHeightChanged || isWidthChanged)
  }

  render () {
    const canvasStyle = {
      height: `${this.props.height}px`,
      width: `${this.props.width}px`
    }

    return (
      <canvas
        ref={canvasRef => { this.canvas = canvasRef }}
        style={canvasStyle}
      />
    )
  }
}
