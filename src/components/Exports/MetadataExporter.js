import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel
} from '../Form'
import ExportsSection from './ExportsSection'

export default class MetadataExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool
  }

  state = {
    isOpen: true,
    shouldExport: true,
    resolution: 720,
    quality: 100,
    aspectRatio: undefined,
    format: 'mp4',
    exportOriginal: true
  }

  onChange = (options) => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          [this.state.exporter]: {
            arguments: {},
            prettyName: this.state.exporter === 'JsonExporter' ? 'JSON' : 'CSV',
            shouldExport: this.state.shouldExport
          }
        })
      }
    })
  }

  toggleCanExport = shouldExport => {
    this.onChange({
      shouldExport
    })
  }

  render () {
    const formatOptions = [
      {
        label: 'CSV',
        value: 'CsvExporter'
      },
      {
        label: 'JSON',
        value: 'JsonExporter'
      }
    ]
    return (
      <ExportsSection
        title="Metadata"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen={this.props.isOpen}
      >
        <FormLabel
          vertical
          label="Format"
          className="Exports__form-element Exports__form-element--nested"
        >
          <FormSelect
            className="Exports__form-select"
            options={formatOptions}
            fieldLabel='label'
            fieldKey='value'
            value={this.state.format}
            onChange={({value}) => this.onChange({exporter: value})}
          >
          </FormSelect>
        </FormLabel>
      </ExportsSection>
    )
  }
}
