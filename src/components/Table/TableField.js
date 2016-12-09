import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Asset from '../../models/Asset'

export default class TableField extends Component {
  static propTypes = {
    // props
    asset: PropTypes.instanceOf(Asset).isRequired,
    field: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  renderColorArray = () => {
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

    if (Array.isArray(val)) {
      renderValFn = this.renderStringArray
    }

    return (
      <div className={`Table-cell`}
           style={{width: `${width}px`}}
           key={field}>
        { renderValFn(val) }
      </div>
    )
  }
}
