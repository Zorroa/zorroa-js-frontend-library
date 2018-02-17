import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { FormCheckbox } from '../Form'

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
    const exportSectionClasses = classnames('ExportsSection', {
      'ExportsSection--opened': this.props.isOpen === true
    })
    const toggleClasses = classnames('ExportsSection__toggle', {
      'ExportsSection__toggle--opened': this.props.isOpen === true,
      'ExportsSection__toggle--closed': this.props.isOpen === false
    })
    const toggleContentClasses = classnames('ExportsSection__content', {
      'ExportsSection__content--closed': this.props.isOpen === false
    })

    return (
      <fieldset className={exportSectionClasses}>
        <header className="ExportsSection__header">
          <FormCheckbox />
          <h2 className="ExportsSection__title">
            {this.props.title}
          </h2>
          <button
            className={toggleClasses}
            onClick={this.toggleAccordion}>
          </button>
        </header>
        <div className={toggleContentClasses}>
          {this.props.children}
        </div>
      </fieldset>
    )
  }
}
