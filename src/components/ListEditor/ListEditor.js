import React, { PropTypes, Component } from 'react'
import { CancelCircle as IconCancelCircle } from '../Icons'
import classnames from 'classnames'

export default class ListEditor extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    keyField: PropTypes.string.isRequired,
    labelField: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
  }

  onClick = (event, item) => {
    event.preventDefault()
    this.props.onClick(item)
  }

  render() {
    const { keyField, items, labelField, disabled } = this.props
    const isDisabled = disabled === true

    return (
      <ul className="ListEditor">
        {items.map(item => {
          const label = item[labelField]
          const key = item[keyField]
          const buttonClasses = classnames('ListEditor__button', {
            'ListEditor__button--disabled': isDisabled,
          })

          return (
            <li key={key} className="ListEditor__item">
              <button
                disabled={isDisabled}
                className={buttonClasses}
                title={isDisabled ? "This can't be removed" : `Remove ${label}`}
                onClick={event => {
                  this.onClick(event, item)
                }}>
                <IconCancelCircle />
              </button>
              <div className="ListEditor__label" title={label}>
                {label}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
