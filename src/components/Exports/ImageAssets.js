import React, { Component, PropTypes } from 'react'
import {
  FormInput,
  FormLabel
} from '../Form'
import ExportsSection from './ExportsSection'

export default class ImageAssets extends Component {
  static propTypes = {
  }

  state = {
    isOpen: true
  }

  onToggle = ({isOpen}) => {
    this.setState({
      isOpen
    })
  }

  render () {
    return (
      <ExportsSection
        title="Image Assets"
        onToggle={this.onToggle}
        onCheckboxChange={this.onCheckboxChange}
        isOpen={this.state.isOpen}
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
