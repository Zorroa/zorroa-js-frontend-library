import React, { Component, PropTypes } from 'react'

import { MIN_THUMBSIZE, MAX_THUMBSIZE, DELTA_THUMBSIZE } from '../../actions/appActions'

export default class ThumbSizeSlider extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  handleChange = (event) => {
    this.props.onChange(Number(event.target.value))
  }

  goBigger = (event) => {
    this.props.onChange(Math.min(MAX_THUMBSIZE, this.props.value + DELTA_THUMBSIZE))
  }
  goSmaller = (event) => {
    this.props.onChange(Math.max(MIN_THUMBSIZE, this.props.value - DELTA_THUMBSIZE))
  }

  render () {
    return (
      <div className='ThumbSizeSlider flexRow flexAlignItemsCenter'>
        <div className='ThumbSizeSlider-smaller flexOff flexRowCenter'
             onClick={this.goSmaller}>
          <i className='icon-picture2' style={{fontSize: '15px'}} />
        </div>
        <div className='ThumbSizeSlider-box flexRowCenter'>
          <div className='ThumbSizeSlider-line-box flexRowCenter'>
            <div className='ThumbSizeSlider-line'/>
          </div>
          <input className='ThumbSizeSlider-slider'
                 type='range'
                 min={`${MIN_THUMBSIZE}`}
                 max={`${MAX_THUMBSIZE}`}
                 step='4'
                 value={this.props.value}
                 onChange={this.handleChange}/>
        </div>
        <div className='ThumbSizeSlider-bigger flexOff flexRowCenter'
             onClick={this.goBigger}>
          <i className='icon-picture2' style={{fontSize: '30px'}} />
        </div>
      </div>
    )
  }
}
