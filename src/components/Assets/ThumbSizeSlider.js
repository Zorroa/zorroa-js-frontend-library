import React, { Component, PropTypes } from 'react'

export default class ThumbSizeSlider extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  static MAX_VAL = 480
  static MIN_VAL = 48

  handleChange = (event) => {
    this.props.onChange(Number(event.target.value))
  }

  goBigger = (event) => {
    this.props.onChange(Math.min(ThumbSizeSlider.MAX_VAL, this.props.value + 48))
  }
  goSmaller = (event) => {
    this.props.onChange(Math.max(ThumbSizeSlider.MIN_VAL, this.props.value - 48))
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
                 min={`${ThumbSizeSlider.MIN_VAL}`}
                 max={`${ThumbSizeSlider.MAX_VAL}`}
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
