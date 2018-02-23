import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../Form'
import ExportsSection from './ExportsSection'
import ResizeExportAsset from './ResizeExportAsset'

export default class PdfExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool
  }

  state = {
    isOpen: true,
    shouldExport: true,
    size: 1200,
    quality: 100,
    format: 'multipage',
    mediaType: 'pdf',
    pageMode: 'merge',
    exportOriginal: true
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
      pageMode = 'multipage'
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
