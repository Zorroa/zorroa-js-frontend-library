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
      format: PropTypes.string.isRequired,
      mediaType: PropTypes.string.isRequired,
      pageMode: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      quality: PropTypes.number.isRequired,
      exportOriginal: PropTypes.bool.isRequired
    })
  }

  state = {
    isOpen: true,
    shouldExport: this.props.shouldExport,
    format: this.props.format,

    // Arguments
    size: this.props.arguments.size,
    quality: this.props.arguments.quality,
    exportOriginal: this.props.arguments.exportOriginal,
    mediaType: this.props.arguments.mediaType,
    pageMode: this.props.arguments.pageMode
  }

  componentWillReceiveProps (nextProps) {
    const newState = {}

    if (
      nextProps.arguments.size !== this.state.size ||
      nextProps.arguments.quality !== this.state.quality ||
      nextProps.arguments.exportOriginal !== this.state.exportOriginal ||
      nextProps.arguments.mediaType !== this.state.mediaType ||
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
    let mediaType = 'pdf'
    let pageMode = 'merge'

    if (format === 'singlepage') {
      mediaType = 'pdf'
      pageMode = 'separate'
    }

    if (format === 'tiff') {
      mediaType = 'tiff'
      pageMode = 'merge'
    }

    if (format === 'jpg') {
      mediaType = 'jpg'
      pageMode = 'separate'
    }

    this.onChange({
      mediaType,
      pageMode,
      format
    })
  }

  onChange = (options) => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          PdfExporter: {
            arguments: {
              size: this.state.size,
              quality: this.state.quality,
              mediaType: this.state.mediaType,
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
    const qualityOptions = [
      {
        label: 'Best',
        value: 100
      }, {
        label: 'Good',
        value: 75
      },
      {
        label: 'Fast',
        value: 50
      }
    ]

    const formatOptions = [
      {
        label: 'Combined PDF',
        value: 'multipage'
      },
      {
        label: 'Single PDFs',
        value: 'singlepage'
      },
      {
        label: 'Multipage TIFFs',
        value: 'tiff'
      },
      {
        label: 'JPGs',
        value: 'jpg'
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
            <FormRadio onChange={() => this.toggleExportOriginal(true)} checked={this.state.exportOriginal} name="PdfExporter" />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio onChange={() => this.toggleExportOriginal(false)} name="PdfExporter" />
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
              value={this.state.format}
              onChange={({value}) => this.onFormatChange(value)}
            />
          </FormLabel>
          <FormLabel
            vertical
            label="Quality"
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={qualityOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.quality}
              onChange={({value}) => this.onChange({quality: value})}
            />
          </FormLabel>
          <ResizeExportAsset
            defaultSize={this.state.size}
            onChange={(size) => this.onChange({size})}
          />
        </radiogroup>
      </ExportsSection>
    )
  }
}
