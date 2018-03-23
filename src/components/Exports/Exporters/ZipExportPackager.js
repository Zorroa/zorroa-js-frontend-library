import React, { Component, PropTypes } from 'react'
import {
  FormInput,
  FormLabel,
  FormSelect
} from '../../Form'
import ExportsSection from '../ExportsSection'

export default class ZipExportPackager extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    fileName: PropTypes.string.isRequired,
    onSelectPreset: PropTypes.func.isRequired,
    presetId: PropTypes.number,
    presets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      processors: PropTypes.array,
      presetName: PropTypes.string
    }))
  }

  state = {
    fileName: this.props.fileName
  }

  onChange = (options) => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          ZipExportPackager: {
            arguments: {
              fileName: this.state.fileName
            }
          }
        })
      }
    })
  }

  onSelectPreset = (preset) => {
    this.props.onSelectPreset(preset)
  }

  render () {
    return (
      <ExportsSection
        title="Export Information"
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen={this.props.isOpen}
        isExportable={true}
        isRequired={true}
      >
        <FormLabel vertical label="Export Package Name" className="Exports__form-element Exports__form-element--nested">
          <FormInput
            className="Exports__form-input Exports__form-input--large"
            required
            value = { this.state.fileName }
            type="text"
            onChange = { fileName => { this.onChange({fileName}) } }
          />
        </FormLabel>
        { this.props.presets.length > 0 && (
          <FormLabel
            vertical
            label="Load Export Profile"
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select Exports__form-select--large"
              options={this.props.presets}
              fieldLabel='presetName'
              fieldKey='id'
              deafultLabel="Select a preset"
              value={this.props.presetId}
              onChange={this.onSelectPreset}
            >
            </FormSelect>
          </FormLabel>
        )}
      </ExportsSection>
    )
  }
}
