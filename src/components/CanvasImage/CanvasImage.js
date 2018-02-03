import React, { PureComponent, PropTypes } from 'react'

export default class CanvasImage extends PureComponent {
  static propTypes = {
    image: PropTypes.instanceOf(ImageBitmap),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    debug: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func
  }

  componentWillReceiveProps (nextProps) {
    const isDifferentImage = nextProps.image !== this.props.image

    if (isDifferentImage) {
      this.drawImage(nextProps)
    }
  }

  componentDidMount () {
    this.drawImage(this.props)
  }

  shouldComponentUpdate (nextProps) {
    // CAUTION: a new `nextProps.image` should NEVER trigger an update. The
    // canvas is the leaf node of the DOM here, changing an image does
    // not change the DOM, since the canvas exposes a totally seperate API

    const isHeightChanged = nextProps.height !== this.props.height
    const isWidthChanged = nextProps.width !== this.props.width
    return (isHeightChanged || isWidthChanged)
  }

  drawImage (props) {
    const isImageProvided = props.image !== undefined

    if (this.canvas === null) {
      return
    }

    if (isImageProvided === false) {
      console.warn('Skipping render of new frame, image is not provided')
      return
    }

    this.canvas.getContext('2d').drawImage(
      props.image,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  render () {
    const canvasAttributes = {
      onClick: this.props.onClick,
      height: this.props.height,
      width: this.props.width,
      className: this.props.className
    }
    return (
      <canvas
        ref={canvasRef => { this.canvas = canvasRef }}
        {...canvasAttributes}
      />
    )
  }
}
