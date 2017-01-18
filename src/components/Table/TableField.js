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

  renderFileType = (vals, asset) => {
    const ext = asset.document.source && asset.document.source.extension ? asset.document.source.extension.slice(0, 4).toUpperCase() : '???'
    let color = '#888'
    // https://docs.google.com/spreadsheets/d/1QTVOmvf4ImUYR7JFVJCpkvWjKiJGTgpFBVcXz1aTLTA/edit#gid=0
    switch (ext) {
      case 'AAC': color = '#996633'; break
      case 'AI': color = '#FF6600'; break
      case 'AVI': color = '#00980D'; break
      case 'BMP': color = '#4040FF'; break
      case 'DOC': color = '#0099FF'; break
      case 'FLV': color = '#FF0000'; break
      case 'GIF': color = '#00980D'; break
      case 'INDD': color = '#FF3D8F'; break
      case 'JPG': color = '#7F7F0A'; break
      case 'JPEG': color = '#7F7F0A'; break
      case 'MIDI': color = '#009999'; break
      case 'MOV': color = '#990066'; break
      case 'MP3': color = '#0099FF'; break
      case 'MP4': color = '#0066CC'; break
      case 'MPG': color = '#663399'; break
      case 'PDF': color = '#CC0000'; break
      case 'PNG': color = '#7F0100'; break
      case 'PPT': color = '#DD3E00'; break
      case 'PSD': color = '#29CCF8'; break
      case 'RAW': color = '#FFBF00'; break
      case 'RTF': color = '#7F0100'; break
      case 'SVG': color = '#990066'; break
      case 'TIFF': color = '#2020A6'; break
      case 'TXT': color = '#0066CC'; break
      case 'WAV': color = '#00980D'; break
      case 'XLS': color = '#00980D'; break
      case 'ZIP': color = '#7E7E7E'; break
    }

    return (
      <svg version="1.1"
           id="Layer_1"
           xmlns="http://www.w3.org/2000/svg"
           xmlnsXlink="http://www.w3.org/1999/xlink"
           x="0px"
           y="0px"
           viewBox="0 0 15 20"
           xmlSpace="preserve"
           style={{ height: '22px', enableBackground: 'new 0 0 15 20', color }}
      >
        <style type="text/css">{`
          .st0{fill:currentColor;}
          .st1{fill:#FFFFFF;}
          .st2{font-family:'Roboto';}
          .st3{font-size:6px;}
        `}</style>
        <path className="st0" d="M10,0H0v20h15V5L10,0z M10,5V0.9L14.1,5H10z"/>
        <text transform="matrix(1 0 0 1 1.7656 18.1638)" className="st1 st2 st3">
          {ext}
        </text>
      </svg>
    )
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
    const { isOpen, onOpen } = this.props
    return (
      <div className={classnames('TableField-array', {isOpen})}>
        { onOpen &&
          <div className='TableField-toggle'
               onClick={onOpen}>
            <div className='TableField-toggle-icon'>{'\u22ef'}</div>
          </div>
        }
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

    return (<div className='Table-cell' key={field} style={style}>{renderValFn(val, asset)}</div>)
  }
}
