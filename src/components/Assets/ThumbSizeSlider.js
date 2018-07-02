import React, { Component, PropTypes } from 'react'

const MIN_THUMBSIZE = window.innerWidth / 7
const MAX_THUMBSIZE = window.innerWidth / 3
const DELTA_THUMBSIZE = (MAX_THUMBSIZE - MIN_THUMBSIZE) / 10

export default class ThumbSizeSlider extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = event => {
    this.props.onChange(Number(event.target.value))
  }

  goBigger = event => {
    this.props.onChange(
      Math.min(MAX_THUMBSIZE, this.props.value + DELTA_THUMBSIZE),
    )
  }
  goSmaller = event => {
    this.props.onChange(
      Math.max(MIN_THUMBSIZE, this.props.value - DELTA_THUMBSIZE),
    )
  }

  render() {
    return (
      <div className="ThumbSizeSlider flexRow flexAlignItemsCenter">
        <div
          className="ThumbSizeSlider-smaller Footer__icon flexOff flexRowCenter"
          onClick={this.goSmaller}
          title="Smaller thumbnails">
          <i className="icon-picture2" style={{ fontSize: '12px' }} />
        </div>
        <div className="ThumbSizeSlider-box flexRowCenter">
          <div className="ThumbSizeSlider-line-box flexRowCenter">
            <div className="ThumbSizeSlider-line" />
          </div>
          <input
            className="ThumbSizeSlider-slider"
            type="range"
            title="Thumbnail size"
            min={`${MIN_THUMBSIZE}`}
            max={`${MAX_THUMBSIZE}`}
            step="0.5"
            value={this.props.value}
            onChange={this.handleChange}
          />
        </div>
        <div
          className="ThumbSizeSlider-bigger Footer__icon flexOff flexRowCenter"
          onClick={this.goBigger}
          title="Larger thumbnails">
          <i className="icon-picture2" style={{ fontSize: '20px' }} />
        </div>
      </div>
    )
  }
}
