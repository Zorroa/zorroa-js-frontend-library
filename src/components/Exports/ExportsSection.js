import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { FormCheckbox } from '../Form'

export default class ExportsSection extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    onToggleExport: PropTypes.func,
    onToggleAccordion: PropTypes.func,
    alwaysShow: PropTypes.bool
  }

  state = {
    isExportable: this.props.alwaysShow === true // By default an always visible module is also going to be part of the export metadata
  }

  toggleAccordion = event => {
    event.preventDefault()

    if (typeof this.props.onToggleAccordion === 'function') {
      this.props.onToggleAccordion()
    }
  }

  onCheckboxChange = (isChecked) => {
    this.setState({
      isExportable: isChecked === true
    }, () => {
      if (typeof onToggleExport === 'function') {
        this.props.onToggleExport(isChecked === true)
      }
    })
  }

  render () {
    const exportSectionClasses = classnames('ExportsSection', {
      'ExportsSection--opened': this.props.isOpen === true
    })
    const toggleClasses = classnames('ExportsSection__toggle', {
      'ExportsSection__toggle--opened': this.props.isOpen === true,
      'ExportsSection__toggle--closed': this.props.isOpen !== true
    })
    const toggleContentClasses = classnames('ExportsSection__content', {
      'ExportsSection__content--closed': this.props.isOpen !== true,
      'ExportsSection__content--enabled': this.state.isExportable === true,
      'ExportsSection__content--disabled': this.state.isExportable === false
    })

    return (
      <fieldset className={exportSectionClasses}>
        <header className="ExportsSection__header">
          <label className="ExportsSection__title-group">
            {this.props.alwaysShow !== true && (
              <FormCheckbox
                checked={this.state.isExportable}
                onChange={this.onCheckboxChange}
              />
            )}
            <h2 className="ExportsSection__title">
              {this.props.title}
            </h2>
          </label>
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
