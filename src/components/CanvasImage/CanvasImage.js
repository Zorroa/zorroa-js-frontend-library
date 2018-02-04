import React, { PureComponent, PropTypes } from 'react'

function fit ({
  parentWidth,
  parentHeight,
  childWidth,
  childHeight,
  containBackground
}) {
  const doRatio = childWidth / childHeight
  const containerRatio = parentWidth / parentHeight
  const shouldContainBackground = containBackground ? (doRatio > containerRatio) : (doRatio < containerRatio)
  let width = parentWidth
  let height = parentHeight

  if (shouldContainBackground) {
    height = width / doRatio
  } else {
    width = height * doRatio
  }

  return {
    width,
    height,
    x: (parentWidth - width) / 2,
    y: (parentHeight - height) / 2
  }
}

export default class CanvasImage extends PureComponent {
  static propTypes = {
    image: PropTypes.instanceOf(ImageBitmap),
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
      canvas.height = canvas.offsetHeight
    }

    if (props.width === undefined) {
      canvas.width = canvas.offsetWidth
    }

    const { width, height, x, y } = fit({
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

    const style = height === undefined || width === undefined ? {
      width: '100%',
      height: '100%'
    } : undefined

    return (
      <canvas
        ref={canvasRef => { this.canvas = canvasRef }}
        style={style}
        {...canvasAttributes}
      />
    )
  }
}
