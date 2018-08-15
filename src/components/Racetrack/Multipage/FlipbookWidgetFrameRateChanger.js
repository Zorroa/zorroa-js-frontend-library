import PropTypes from 'prop-types'
import React from 'react'
import { defaultFpsFrequencies } from '../../../constants/defaultState'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { setFlipbookFps } from '../../../actions/appActions'

export function FlipbookWidgetFrameRateChanger(props) {
  const fps = props.fps
  const fpsGrabberPosition = defaultFpsFrequencies.indexOf(fps) + 1
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

  return (
    <div className="FlipbookWidgetFrameRateChanger__fps-selector FlipbookWidgetFrameRateChanger__section">
      <div className="FlipbookWidgetFrameRateChanger__fps-title">
        Flipbook frame rate
      </div>
      <div className="FlipbookWidgetFrameRateChanger__fps-grabber-container">
        <div
          className="FlipbookWidgetFrameRateChanger__fps-grabber"
          style={fpsGrabberStyle}>
          <div
            className="FlipbookWidgetFrameRateChanger__fps-grabber-target"
            style={fpsGrabberTargetStyle}>
            <div className="FlipbookWidgetFrameRateChanger__fps-grabber-target-circle" />
          </div>
        </div>
      </div>
      <div className="FlipbookWidgetFrameRateChanger__fps-rate-list">
        {defaultFpsFrequencies.map((frequency, index) => {
          return (
            <div
              key={index}
              className={classnames(
                'FlipbookWidgetFrameRateChanger__fps-rate',
                {
                  'FlipbookWidgetFrameRateChanger__fps-rate--elapsed':
                    index < defaultFpsFrequencies.indexOf(fps),
                  'FlipbookWidgetFrameRateChanger__fps-rate--active':
                    index === defaultFpsFrequencies.indexOf(fps),
                },
              )}
              onClick={() => props.actions.setFlipbookFps(frequency)}>
              {frequency} FPS
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function mapStateToProps(state) {
  return {
    fps: state.app.flipbookFps,
  }
}

FlipbookWidgetFrameRateChanger.propTypes = {
  fps: PropTypes.number,
  actions: PropTypes.shape({
    setFlipbookFps: PropTypes.func.isRequired,
  }),
}

export default connect(mapStateToProps, dispatch => ({
  actions: bindActionCreators(
    {
      setFlipbookFps,
    },
    dispatch,
  ),
}))(FlipbookWidgetFrameRateChanger)
