import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { FormSelect, FormLabel } from '../../Form'
import ExportsSection from '../ExportsSection'
import { getClassFromNamespace } from '../utils'

export default class MetadataExporter extends Component {
  static propTypes = {
    processors: PropTypes.arrayOf(
      PropTypes.shape({
        className: PropTypes.string.isRequired,
      }),
    ),
    hasNonDefaultProcessors: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    shouldExport: PropTypes.bool,
    exporter: PropTypes.oneOf(['JsonExporter', 'CsvExporter']),
  }

  state = {
    isOpen: true,
    exporter: this.props.exporter,
    shouldExport: this.props.shouldExport,
  }

  onChange = options => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          CsvExporter: {
            arguments: {},
            shouldExport:
              this.state.shouldExport && this.state.exporter === 'CsvExporter',
          },
          JsonExporter: {
            arguments: {},
            shouldExport:
              this.state.shouldExport && this.state.exporter === 'JsonExporter',
          },
        })
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const newState = {}

    if (nextProps.exporter !== this.state.exporter) {
      newState.exporter = nextProps.exporter
    }

    if (nextProps.shouldExport !== this.state.shouldExport) {
      newState.shouldExport = nextProps.shouldExport
    }

    this.setState(newState)
  }

  toggleCanExport = shouldExport => {
    this.onChange({
      shouldExport,
    })
  }

  toggleCanExport = shouldExport => {
    this.onChange({
      shouldExport,
    })
  }

  canDisplay() {
    const hasProcessor =
      this.props.processors.find(
        processor =>
          getClassFromNamespace(processor.className) === 'MetadataExporter',
      ) !== undefined
    return this.props.hasNonDefaultProcessors === false || hasProcessor
  }

  render() {
    if (this.canDisplay() === false) {
      return null
    }

    const formatOptions = [
      {
        label: 'CSV',
        value: 'CsvExporter',
      },
      {
        label: 'JSON',
        value: 'JsonExporter',
      },
    ]
    return (
      <ExportsSection
        title="Metadata"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen={this.props.isOpen}
        isExportable={this.state.shouldExport}>
        <FormLabel
          vertical
          label="Format"
          className="Exports__form-element Exports__form-element--nested">
          <FormSelect
            className="Exports__form-select"
            options={formatOptions}
            fieldLabel="label"
            fieldKey="value"
            value={this.state.exporter}
            onChange={({ value }) => this.onChange({ exporter: value })}
          />
        </FormLabel>
      </ExportsSection>
    )
  }
}
