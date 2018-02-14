import React, { PureComponent, PropTypes } from 'react'
import size from '../../services/size'

export default class CanvasImage extends PureComponent {
  static propTypes = {
    image: PropTypes.instanceOf(window.ImageBitmap),
    height: PropTypes.number,
    width: PropTypes.number,
    className: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.oneOf(['cover', 'contain'])
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
    const canvas = this.canvas

    if (canvas === null) {
      return
    }

    if (isImageProvided === false) {
      console.warn('Skipping render of new frame, image is not provided')
      return
    }

    if (props.height === undefined && canvas.height !== canvas.offsetHeight) {
      // If the height is being dynamiclly set by CSS, ensure that the canvas'
      // "drawable" pixels are set to the same size as the canvas takes up in
      // the "offset" space
      canvas.height = canvas.offsetHeight
    }

    if (props.width === undefined && canvas.width !== canvas.offsetWidth) {
      // If the width is being dynamiclly set by CSS, ensure that the canvas'
      // "drawable" pixels are set to the same size as the canvas takes up in
      // the "offset" space
      canvas.width = canvas.offsetWidth
    }

    const { width, height, x, y } = size({
      childWidth: props.image.width,
      childHeight: props.image.height,
      parentWidth: canvas.offsetWidth,
      parentHeight: canvas.offsetHeight,
      containBackground: props.size !== 'cover'
    })

    canvas.getContext('2d').drawImage(
      props.image,
      x,
      y,
      width,
      height
    )
  }

  render () {
    const {
      onClick,
      height,
      width,
      className
    } = this.props

    const canvasAttributes = {
      onClick,
      height,
      width,
      className
    }

    const style = {
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : '100%'
    }

    return (
      <canvas
        ref={canvasRef => { this.canvas = canvasRef }}
        style={style}
        {...canvasAttributes}
      />
    )
  }
}
