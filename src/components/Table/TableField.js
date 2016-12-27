import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Asset from '../../models/Asset'
import { humanFileSize } from '../../services/jsUtil'

export default class TableField extends Component {
  static propTypes = {
    // props
    asset: PropTypes.instanceOf(Asset).isRequired,
    field: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onOpen: PropTypes.func,
    width: PropTypes.number
  }

  renderColorArray = (vals) => {
    return (
      <div className='TableField-array'>
        { vals.map((val, i) => (
          <div className='TableField-color'
               key={i}
               style={{backgroundColor: val}}/>
        ))}
      </div>
    )
  }

  renderStringArray = (vals) => {
    const { isOpen, onOpen } = this.props
    return (
      <div className={classnames('TableField-array', {isOpen})}>
        { onOpen ? <div className='TableField-toggle'
             onClick={onOpen}>{ isOpen ? '\u22ee' : '\u22ef' }</div> : null }
        { vals.map((val, i) => (
          <div className='TableField-tag' key={i}>{val}</div>
        ))}
      </div>
    )
  }

  renderGeneral = (val) => {
    const { field } = this.props
    if (field.toLowerCase().endsWith('size') && typeof val === 'number') {
      return humanFileSize(val)
    } else if (field.toLowerCase().includes('date') && typeof val === 'string') {
      const date = Date.parse(val)
      if (!isNaN(date)) {
        return (new Date(date)).toUTCString()
      }
    }
    const str = Asset._valueToString(val)
    return str
  }

  render = () => {
    const { asset, field, width } = this.props
    const val = asset.rawValue(field)
    let renderValFn = this.renderGeneral
    let padding = 8

    if (Array.isArray(val) && val.length) {
      // If this is an array of colors, render colors
      if (val[0] && val[0][0] === '#' &&
        val.every(v => v[0] === '#' && v.length === 7 || v.length === 4)) {
        renderValFn = this.renderColorArray
      } else {
        // otherwise, render an array of strings
        renderValFn = this.renderStringArray
        padding = 4
      }
    }

    let style = { padding }
    // Use width for visible table cells
    // Without width is for the .Table-cell-test, auto width for measuring cells
    if (width) {
      style.width = `${width}px`
    }

    return (<div className='Table-cell' key={field} style={style}>{renderValFn(val)}</div>)
  }
}
