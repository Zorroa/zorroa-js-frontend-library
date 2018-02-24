import React, { Component, PropTypes } from 'react'
import {
  FormInput,
  FormLabel
} from '../Form'
import ExportsSection from './ExportsSection'

export default class ExportInformation extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    exportPackageName: PropTypes.string.isRequired
  }

  state = {
    exportPackageName: this.props.exportPackageName
  }

  onChange = (options) => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          ExportInformation: {
            arguments: {
              exportPackageName: this.state.exportPackageName,
              exportProfile: this.state.exportProfile
            }
          }
        })
      }
    })
  }

  render () {
    return (
      <ExportsSection
        title="Export Information"
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen={this.props.isOpen}
        alwaysShow
      >
        <FormLabel vertical label="Export Package Name" className="Exports__form-element Exports__form-element--nested">
          <FormInput
            required
            value = { this.state.exportPackageName }
            type="text"
            onChange = { exportPackageName => { this.onChange({exportPackageName}) } }
          />
        </FormLabel>
      </ExportsSection>
    )
  }
}
