import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Asset from '../../models/Asset'

export default class TableField extends Component {
  static propTypes = {
    // props
    asset: PropTypes.instanceOf(Asset).isRequired,
    field: PropTypes.string.isRequired,
    width: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  renderColorArray = (vals) => {
    return (
      <div className='TableField-array'>
        { vals.map(val => (
          <div className='TableField-color'
               style={{backgroundColor:val}}/>
        ))}
      </div>
    )
  }

  renderStringArray = (vals) => {
    return (
      <div className='TableField-array'>
        { vals.map(val => (<div className='TableField-tag'>{val}</div>)) }
      </div>
    )
  }

  renderGeneral = (val) => {
    return (Asset._valueToString(val))
  }

  render = () => {
    const { asset, field, width } = this.props
    const val = asset.rawValue(field)
    let renderValFn = this.renderGeneral

    if (Array.isArray(val) && val.length) {
      // If this is an array of colors, render colors
      if (val[0] && val[0][0] === '#' &&
        val.every(v => v[0]==='#' && v.length===7 || v.length === 4)) {
        renderValFn = this.renderColorArray
      }
      // otherwise, render an array of strings
      else {
        renderValFn = this.renderStringArray
      }
    }

    let style = {}
    // Use width for visible table cells
    // Without width is for the .Table-cell-test, auto width for measuring cells
    if (width) {
      style.width = `${width}px`
    }

    return (<div className='Table-cell' style={style}>{renderValFn(val)}</div>)
  }
}
