import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Asset from '../../models/Asset'
import FileIcon from '../FileIcon'
import { humanFileSize } from '../../services/jsUtil'

export default class TableField extends Component {
  static propTypes = {
    // props
    asset: PropTypes.instanceOf(Asset).isRequired,
    field: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onOpen: PropTypes.func,
    onTag: PropTypes.func,
    width: PropTypes.number,
    left: PropTypes.string, // if given, then position becomes absolute
    top: PropTypes.string // if given, then position becomes absolute
  }

  renderFileType = (vals, asset) => (
    <FileIcon ext={asset.document.source && asset.document.source.extension
      ? asset.document.source.extension.slice(0, 4) : '???'} />
  )

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

  renderColors = (vals) => {
    return (
      <div className='TableField-array'>
        { vals.map((val, i) => (
          <div className='TableField-color'
               key={i}
               style={{backgroundColor: val['hex']}}/>
        ))}
      </div>
    )
  }

  renderStringArray = (vals) => {
    const { isOpen, onOpen, onTag, field } = this.props
    return (
      <div className={classnames('TableField-array', {isOpen})}>
        { onOpen &&
          <div className='TableField-toggle'
               onClick={onOpen}>
            <div className='TableField-toggle-icon'>{'\u22ef'}</div>
          </div>
        }
        { vals.map((val, i) => (
          <div onClick={e => onTag(val, field, e)} className='TableField-tag' key={i}>{val}</div>
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
    const { asset, field, width, left, top } = this.props
    const val = asset.rawValue(field)
    let renderValFn = this.renderGeneral
    let padding = '8px 4px'

    if (field === 'source.type') {
      renderValFn = this.renderFileType
      padding = 1
    } else if (Array.isArray(val) && val.length) {
      // If this is an array of colors, render colors
      if (val[0] && typeof val[0] === 'string' && val[0][0] === '#' &&
        val.every(v => v[0] === '#' && v.length === 7 || v.length === 4)) {
        renderValFn = this.renderColorArray
      } else if (field === 'colors') {
        renderValFn = this.renderColors
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
    if (left && top) {
      style.left = left
      style.top = top
      style.position = 'absolute'
    }

    return (<div className='Table-cell' style={style}>{renderValFn(val, asset)}</div>)
  }
}
