import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FlipbookWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { showModal, setFlipbookFps } from '../../actions/appActions'
import { sortAssets } from '../../actions/assetsAction'
import Widget from './Widget'
import FlipbookPlayer from '../Flipbook/FlipbookImage/index.js'
import Scrubber from '../Scrubber'
import { PubSub } from '../../services/jsUtil'
import classnames from 'classnames'
import { defaultFpsFrequencies } from '../../constants/defaultState'
import Duration from '../Duration'
import Toggle from '../Toggle'
import { resizeByAspectRatio } from '../../services/size'
import { Asset } from '../../models/Asset'

class FlipbookWidget extends Component {
  static propTypes = {
    actions: PropTypes.shape({
      setFlipbookFps: PropTypes.func.isRequired,
      modifyRacetrackWidget: PropTypes.func.isRequired,
      showModal: PropTypes.func.isRequired,
      sortAssets: PropTypes.func.isRequired,
    }),
    searchOrder: PropTypes.string,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    aggs: PropTypes.object,
    widget: PropTypes.object,
    fps: PropTypes.number,
    totalCount: PropTypes.number.isRequired,
    asset: PropTypes.instanceOf(Asset),
  }

  constructor(props) {
    super(props)
    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.state = {
      title: props.widget.state.title,
      id: props.widget.state.id,
      playing: false,
      currentFrameNumber: false,
      totalFrames: 0,
      sortByFrame:
        props.searchOrder && props.searchOrder.field === 'media.clip.start',
    }
  }

  componentDidMount() {
    this.status.on('playing', playing => {
      this.setState({ playing })
    })
    this.status.on('played', currentFrameNumber => {
      this.setState({ currentFrameNumber })
    })
  }

  componentWillUnmount() {
    this.status.off()
    this.shuttler.off()
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.widget &&
      (nextProps.widget.state.title !== this.props.widget.state.title ||
        nextProps.widget.state.id !== this.props.widget.state.id)
    ) {
      this.setState(this.props.widget.state)
    }
  }

  title() {
    return 'FLIPBOOK'
  }

  onFlipbookLoad = event => {
    this.setState({
      totalFrames: event.totalFrames,
    })
  }

  onFpsRateChange = frequency => {
    this.props.actions.setFlipbookFps(frequency)
  }

  startOrStopFlipbook = () => {
    this.shuttler.publish('startOrStop')
  }

  handleOrderChange = event => {
    this.setState({
      sortByFrame: event.target.checked === true,
    })

    if (event.target.checked === true) {
      this.props.actions.sortAssets('media.clip.start', true, {
        silent: true,
      })
      return
    }

    this.props.actions.sortAssets(undefined, undefined, {
      silent: true,
    })
  }

  render() {
    if (this.props.asset === undefined) {
      return null
    }

    const {
      id,
      floatBody,
      isIconified,
      isOpen,
      onOpen,
      fps,
      asset,
    } = this.props
    const title = isOpen ? FlipbookWidgetInfo.title : undefined
    const field = isOpen ? undefined : this.title()
    const hasFrames = this.state.totalFrames > 0
    const fpsGrabberPosition = defaultFpsFrequencies.indexOf(this.props.fps) + 1
    const fpsGrabberStyle = {
      width: `calc(${fpsGrabberPosition} / ${
        defaultFpsFrequencies.length
      } * 100%)`,
    }
    const fpsGrabberTargetStyle = {
      left: `calc(${fpsGrabberPosition - 1} / ${
        defaultFpsFrequencies.length
      } * 100%)`,
      width: `calc(1 / ${defaultFpsFrequencies.length} * 100%)`,
    }
    const flipbookDimensions = resizeByAspectRatio({
      width: asset.width(),
      height: asset.height(),
      newWidth: 230, // The value 230 comes from the CSS
    })

    return (
      <Widget
        className="FlipbookWidget"
        id={id}
        floatBody={floatBody}
        title={title}
        field={field}
        backgroundColor={FlipbookWidgetInfo.color}
        isIconified={isIconified}
        isOpen={isOpen}
        onOpen={onOpen}
        icon={FlipbookWidgetInfo.icon}>
        <div className="FlipbookWidget__body">
          <div className="FlipbookWidget__player-container">
            {isOpen && (
              <FlipbookPlayer
                clipParentId={this.state.id}
                onLoad={this.onFlipbookLoad}
                shuttler={this.shuttler}
                status={this.status}
                height={flipbookDimensions.height}
                width={flipbookDimensions.width}
                defaultFrame={asset}
              />
            )}
            <div className="FlipbookWidget__duration-container">
              <Duration
                onClick={this.startOrStopFlipbook}
                playing={this.state.playing}
                fps={this.props.fps}
                frameCount={this.props.totalCount}
              />
            </div>
          </div>
          <div
            className={classnames(
              'FlipbookWidget__scrubber FlipbookWidget__section',
              {
                'FlipbookWidget__scrubber--visible': hasFrames,
              },
            )}>
            <Scrubber
              shuttler={this.shuttler}
              status={this.status}
              currentFrameNumber={this.state.currentFrameNumber}
              totalFrames={this.state.totalFrames}
              isPlaying={this.state.playing}
            />
          </div>
          <div className="FlipbookWidget__order FlipbookWidget__section">
            <div className="FlipbookWidget__order-label">Image Order</div>
            <div className="FlipbookWidget__order-toggle">
              <Toggle
                checked={this.state.sortByFrame}
                onChange={this.handleOrderChange}
                highlightColor="yellow"
              />
            </div>
            <div className="FlipbookWidget__order-label">Search Order</div>
          </div>
          <div className="FlipbookWidget__fps-selector FlipbookWidget__section">
            <div className="FlipbookWidget__fps-title">Flipbook frame rate</div>
            <div className="FlipbookWidget__fps-grabber-container">
              <div
                className="FlipbookWidget__fps-grabber"
                style={fpsGrabberStyle}>
                <div
                  className="FlipbookWidget__fps-grabber-target"
                  style={fpsGrabberTargetStyle}>
                  <div className="FlipbookWidget__fps-grabber-target-circle" />
                </div>
              </div>
            </div>
            <div className="FlipbookWidget__fps-rate-list">
              {defaultFpsFrequencies.map((frequency, index) => {
                return (
                  <div
                    key={index}
                    className={classnames('FlipbookWidget__fps-rate', {
                      'FlipbookWidget__fps-rate--elapsed':
                        index < defaultFpsFrequencies.indexOf(fps),
                      'FlipbookWidget__fps-rate--active':
                        index === defaultFpsFrequencies.indexOf(fps),
                    })}
                    onClick={() => this.onFpsRateChange(frequency)}>
                    {frequency} FPS
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  (state, ownProps) => ({
    fps: state.app.flipbookFps,
    aggs: state.assets.aggs,
    asset: state.assets.all[0],
    totalCount: state.assets.totalCount,
    searchOrder:
      state.assets.order &&
      state.assets.order.find(order => order.field === 'media.clip.start'),
    widget:
      state.racetrack &&
      state.racetrack.widgets &&
      state.racetrack.widgets.find(widget => ownProps.id === widget.id),
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        sortAssets,
        setFlipbookFps,
        modifyRacetrackWidget,
        showModal,
      },
      dispatch,
    ),
  }),
)(FlipbookWidget)
