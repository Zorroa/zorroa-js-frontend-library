import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../../Form'
import ExportsSection from '../ExportsSection'

export default class VideoClipExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    shouldExport: PropTypes.bool.isRequired,
    arguments: PropTypes.shape({
      scale: PropTypes.string.isRequired,
      quality: PropTypes.string.isRequired,
      format: PropTypes.string.isRequired,
      exportOriginal: PropTypes.bool.isRequired
    })
  }

  state = {
    isOpen: true,
    shouldExport: this.props.shouldExport,

    // Arguments
    scale: this.props.arguments.scale,
    quality: this.props.arguments.quality,
    format: this.props.arguments.format,
    exportOriginal: this.props.arguments.exportOriginal
  }

  componentWillReceiveProps (nextProps) {
    const newState = {}

    if (
      nextProps.arguments.scale !== this.state.scale ||
      nextProps.arguments.quality !== this.state.quality ||
      nextProps.arguments.exportOriginal !== this.state.exportOriginal ||
      nextProps.arguments.format !== this.state.format
    ) {
      newState.arguments = nextProps.arguments
    }

    if (nextProps.shouldExport !== this.state.shouldExport) {
      newState.shouldExport = nextProps.shouldExport
    }

    this.setState(newState)
  }

  onChange = (options, overrideExportOriginal) => {
    if (overrideExportOriginal !== undefined) {
      options.exportOriginal = overrideExportOriginal
    }

    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          VideoClipExporter: {
            arguments: {
              scale: this.state.scale,
              quality: this.state.quality,
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
        value: 'veryslow'
      }, {
        label: 'Good',
        value: 'medium'
      },
      {
        label: 'Fast',
        value: 'fast'
      }
    ]
    const scaleOptions = [
      {
        label: '540p - Standard',
        value: '960:540'
      },
      {
        label: '720p - HD',
        value: '1280:720'
      },
      {
        label: '1080p - Full HD',
        value: '1920:1080'
      },
      {
        label: '2160p - 4K',
        value: '2160:1440'
      }
    ]

    return (
      <ExportsSection
        title="Movie Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isExportable={this.state.shouldExport}
        isOpen={this.props.isOpen}
      >
        <radiogroup>
          <FormLabel afterLabel="Export original assets" className="Exports__form-element">
            <FormRadio onChange={() => this.toggleExportOriginal(true)} checked={this.state.exportOriginal === true} name="VideoClipExporter" />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio onChange={() => this.toggleExportOriginal(false)} checked={this.state.exportOriginal === false} name="VideoClipExporter" />
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
              onChange={({value}) => this.onChange({quality: value}, false)}
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
              options={scaleOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.scale}
              onChange={({value}) => this.onChange({scale: value}, false)}
            >
            </FormSelect>
          </FormLabel>
        </radiogroup>
      </ExportsSection>
    )
  }
}
