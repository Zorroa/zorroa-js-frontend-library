import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { PubSub } from '../../../services/jsUtil'
import { resizeByAspectRatio } from '../../../services/size'
import getBackgroundPlaceholder from '../../../services/backgroundColorPlaceholder'
import api from '../../../api'
import classnames from 'classnames'

const MIN_HEIGHT = 70
const MAX_HEIGHT = 300
const DEFAULT_HEIGHT = Math.round((MAX_HEIGHT - MIN_HEIGHT) / 2)

export default class Filmstrip extends Component {
  static propTypes = {
    origin: PropTypes.string.isRequired,
    clipParentId: PropTypes.string.isRequired,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub),
    deferImageLoad: PropTypes.bool,
    filmStripHeight: PropTypes.number.isRequired,
    actions: PropTypes.shape({
      setFilmstripHeight: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      frames: [],
      isLoading: true,
      isError: false,
      height: props.filmStripHeight || 0,
      isDragging: false,
      startDimensionY: 0,
    }
  }

  componentDidMount() {
    this.getFlipbook()
    window.addEventListener('mousemove', this.onDrag)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onDrag)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.clipParentId !== this.props.clipParentId) {
      this.getFlipbook()
    }
  }

  getFilmstripHeight() {
    return this.props.filmStripHeight || DEFAULT_HEIGHT
  }

  getFlipbook() {
    this.setState({
      frames: [],
      isLoading: true,
      isError: false,
    })

    api.flipbook.get(this.props.clipParentId).then(
      frames => {
        this.setState({
          frames,
          isLoading: false,
          isError: false,
        })
      },
      error => {
        console.error('Unable to load filmstrip data', error)
        this.setState({
          frames: [],
          isError: true,
          isLoading: false,
        })
      },
    )
  }

  scrub(frameNumber) {
    if (typeof this.props.shuttler === 'undefined') {
      console.error('Cannot scrub when there is no shuttler')
      return
    }

    this.props.shuttler.publish('stop')
    this.props.shuttler.publish('scrub', frameNumber)
  }

  startDrag = event => {
    event.preventDefault()
    this.setState({
      isDragging: true,
      height: this.props.filmStripHeight,
      startDimensionY: event.clientY,
    })
  }

  onDrag = event => {
    const PRIMARY_BUTTON = 1
    const isPressingPrimaryButton = (event.buttons & PRIMARY_BUTTON) === 1

    if (this.state.isDragging === false) {
      return
    }

    if (this.state.isDragging === true && isPressingPrimaryButton === false) {
      this.stopDrag(event)
      return
    }

    this.setState(prevState => {
      const scrollDifference = prevState.startDimensionY - event.clientY
      const height = prevState.height + scrollDifference

      return {
        startDimensionY: event.clientY,
        height,
      }
    })
  }

  stopDrag = event => {
    event.preventDefault()
    this.setState({
      isDragging: false,
    })
  }

  render() {
    const { origin, deferImageLoad } = this.props
    const { isLoading } = this.state
    const filmstripHeight = Math.min(
      MAX_HEIGHT,
      Math.max(this.state.height, MIN_HEIGHT),
    )
    const placeholderImage =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const closestHeight = filmstripHeight
    const closestWidth = filmstripHeight * 3
    const dimensions = {
      maxHeight: filmstripHeight + 5,
      height: filmstripHeight + 5,
    }

    const filmStripContainerClasses = classnames('Filmstrip__container', {
      'Filmstrip__container--loading': isLoading,
    })

    if (this.state.isError) {
      return null
    }

    return (
      <div
        className="Filmstrip"
        style={dimensions}
        onMouseUp={this.endDrag}
        onMouseOut={this.endDrag}>
        <div
          className="Filmstrip__dragger"
          onMouseDown={this.startDrag}
          title="Click and drag to adjust the flimstrip height."
        />
        <div className={filmStripContainerClasses}>
          {this.state.frames.map((asset, index) => {
            const randomSeed = index
            const proxy = asset.closestProxy(closestWidth, closestHeight)
            const { height, width } = resizeByAspectRatio({
              height: proxy.height,
              width: proxy.width,
              newHeight: filmstripHeight,
            })

            return (
              <img
                className="Filmstrip__image"
                width={Math.round(width)}
                height={Math.round(height)}
                key={`filmstrip-${asset.id}`}
                style={{
                  backgroundImage: `${getBackgroundPlaceholder(
                    asset.tinyProxy(),
                    randomSeed,
                  )}`,
                }}
                src={
                  deferImageLoad === true ? placeholderImage : proxy.url(origin)
                }
                onClick={event => {
                  event.preventDefault()
                  this.scrub(asset.startPage())
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
