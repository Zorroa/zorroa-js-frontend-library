import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../../Form'
import ExportsSection from '../ExportsSection'
import ResizeExportAsset from '../ResizeExportAsset'

export default class PdfExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    shouldExport: PropTypes.bool.isRequired,
    format: PropTypes.string.isRequired,
    arguments: PropTypes.shape({
      pageMode: PropTypes.string.isRequired,
      exportOriginal: PropTypes.bool.isRequired
    })
  }

  state = {
    isOpen: true,
    shouldExport: this.props.shouldExport,
    format: this.props.format,

    // Arguments
    exportOriginal: this.props.arguments.exportOriginal,
    pageMode: this.props.arguments.pageMode
  }

  componentWillReceiveProps (nextProps) {
    const newState = {}

    if (
      nextProps.arguments.exportOriginal !== this.state.exportOriginal ||
      nextProps.arguments.pageMode !== this.state.pageMode
    ) {
      newState.arguments = nextProps.arguments
    }

    if (nextProps.shouldExport !== this.state.shouldExport) {
      newState.shouldExport = nextProps.shouldExport
    }

    if (nextProps.format !== this.state.format) {
      newState.format = nextProps.format
    }

    this.setState(newState)
  }

  onFormatChange = format => {
    let pageMode = 'merge'

    if (format === 'singlepage') {
      pageMode = 'separate'
    }

    this.onChange({
      pageMode
    }, false)
  }

  onChange = (options, overrideExportOriginal) => {
    if (overrideExportOriginal !== undefined) {
      options.exportOriginal = overrideExportOriginal
    }

    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          PdfExporter: {
            arguments: {
              pageMode: this.state.pageMode,
              exportOriginal: this.state.exportOriginal
            },
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

  toggleExportOriginal = exportOriginal => {
    this.onChange({
      exportOriginal
    })
  }

  render () {
    const formatOptions = [
      {
        label: 'Combined PDF',
        value: 'merge'
      },
      {
        label: 'Single PDFs',
        value: 'seperate'
      }
    ]

    return (
      <ExportsSection
        title="Document Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isExportable={this.state.shouldExport}
        isOpen={this.props.isOpen}
      >
        <radiogroup>
          <FormLabel afterLabel="Export original assets" className="Exports__form-element">
            <FormRadio onChange={() => this.toggleExportOriginal(true)} checked={this.state.exportOriginal === true} name="PdfExporter" />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio onChange={() => this.toggleExportOriginal(false)} checked={this.state.exportOriginal === false} name="PdfExporter" />
          </FormLabel>
          <FormLabel
            vertical
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={formatOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.pageMode}
              onChange={({value}) => this.onFormatChange(value)}
            />
          </FormLabel>
        </radiogroup>
      </ExportsSection>
    )
  }
}
