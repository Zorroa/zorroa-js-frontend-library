import React, { Component, PropTypes } from 'react'
import Heading from '../Heading'
import classnames from 'classnames'

export default class ExportsSection extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node,
    onToggle: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
  }

  toggleAccordion = event => {
    event.preventDefault()
    this.props.onToggle({
      isOpen: !this.props.isOpen,
      key: this.props.id
    })
  }

  render () {
    return (
      <fieldset className={classnames('ExportsSection', {
        'ExportsSection--opened': this.props.isOpen
      })}>
        <h2 className="ExportsSection__title">
          {this.props.title}
        </h2>
        <button
          className="ExportsSection__toggle"
          onClick={this.toggleAccordion}>
          +
        </button>
        <div className="ExportsSection__content">
          {this.props.children}
        </div>
      </fieldset>
    )
  }
}
