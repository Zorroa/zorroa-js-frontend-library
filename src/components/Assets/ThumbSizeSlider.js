import React, { Component, PropTypes } from 'react'

export default class ThumbSizeSlider extends Component {
  static get propTypes () {
    return {
      value: PropTypes.number.isRequired,
      onChange: PropTypes.func.isRequired
    }
  }

  handleChange (event) {
    this.props.onChange(Number(event.target.value))
  }

  render () {
    return (
      <div className="thumb-size-slider flexRow flexAlignItemsCenter">
        <div className="icon-picture2" style={{fontSize: '15px'}} />
        <input type="range" min="48" max="480" step="4" value={this.props.value}
               onChange={this.handleChange.bind(this)}/>
        <div className="icon-picture2" style={{fontSize: '30px'}} />
      </div>
    )
  }
}
