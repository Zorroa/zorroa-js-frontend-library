import React, { Component, PropTypes } from 'react'
import {
  FormInput,
  FormLabel
} from '../Form'
import ExportsSection from './ExportsSection'

export default class ExportInformation extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onToggleAccordion: PropTypes.func.isRequired
  }

  state = {}

  render () {
    return (
      <ExportsSection
        title="Export Information"
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen
        alwaysShow
      >
        <FormLabel vertical label="Export Package Name" className="Exports__form-element">
          <FormInput
            required
            value = { this.state.exportPackageName }
            type="text"
            onChange = { exportPackageName => { this.onChange({exportPackageName}) } }
          />
        </FormLabel>
        <FormLabel vertical label="Load Export Profile" className="Exports__form-element">
          <FormInput
            required
            value = { this.state.exportProfile }
            type="text"
            onChange = { exportProfile => { this.onChange({exportProfile}) } }
          />
        </FormLabel>
      </ExportsSection>
    )
  }
}
