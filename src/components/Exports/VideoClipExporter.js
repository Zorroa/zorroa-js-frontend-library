import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../Form'
import ExportsSection from './ExportsSection'

export default class VideoClipExporter extends Component {
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
          VideoClipExporter: {
            arguments: {
              resolution: this.state.resolution,
              quality: this.state.quality,
              aspectRatio: this.state.aspectRatio,
              format: this.state.format,
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
    const resolutionOptions = [
      {
        label: '540p - Standard',
        value: 540
      },
      {
        label: '720p - HD',
        value: 720
      },
      {
        label: '1080p - Full HD',
        value: 1080
      },
      {
        label: '2160p - 4K',
        value: 2160
      }
    ]
    const aspectRatioOptions = [
      {
        label: '4:3',
        value: '4:3'
      },
      {
        label: '16:9',
        value: '16:9'
      }
    ]
    const formatOptions = [
      {
        label: 'MPEG-4',
        value: 'mp4'
      },
      {
        label: 'MOV (QuickTime)',
        value: 'mov'
      },
      {
        label: 'WebM',
        value: 'webm'
      }
    ]
    return (
      <ExportsSection
        title="Movie Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isOpen={this.props.isOpen}
      >
        <radiogroup>
          <FormLabel afterLabel="Export original assets" className="Exports__form-element">
            <FormRadio onChange={() => this.toggleExportOriginal(true)} checked={this.state.exportOriginal} name="VideoClipExporter" />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio onChange={() => this.toggleExportOriginal(false)} name="VideoClipExporter" />
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
            >
            </FormSelect>
          </FormLabel>
          <FormLabel
            vertical
            label="Resolution"
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={resolutionOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.resolution}
              onChange={({value}) => this.onChange({resolution: value})}
            >
            </FormSelect>
          </FormLabel>
          <FormLabel
            vertical
            label="Aspect Ratio"
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={aspectRatioOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.aspectRatio}
              deafultLabel="Original aspect ratio"
              onChange={({value}) => this.onChange({aspectRatio: value})}
            >
            </FormSelect>
          </FormLabel>
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
              onChange={({value}) => this.onChange({format: value})}
            >
            </FormSelect>
          </FormLabel>

        </radiogroup>
      </ExportsSection>
    )
  }
}
