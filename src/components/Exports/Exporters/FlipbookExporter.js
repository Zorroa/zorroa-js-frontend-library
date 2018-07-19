import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { FormSelect, FormLabel, FormRadio } from '../../Form'
import ExportsSection from '../ExportsSection'

export default class FlipbookExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    shouldExport: PropTypes.bool,
    arguments: PropTypes.shape({
      quality: PropTypes.number.isRequired,
      exportImages: PropTypes.bool.isRequired,
      exportMovies: PropTypes.bool.isRequired,
      frameRate: PropTypes.number.isRequired,
    }),
  }

  state = {
    isOpen: true,
    shouldExport: this.props.shouldExport,
    flipbookExportType: 'image',

    // Exporter arguments
    quality: this.props.arguments.quality,
    exportImages: this.props.arguments.exportImages,
    exportMovies: this.props.arguments.exportMovies,
    frameRate: this.props.arguments.frameRate,
  }

  componentWillReceiveProps(nextProps) {
    const newState = {}
    if (
      nextProps.arguments.quality !== this.state.quality ||
      nextProps.arguments.frameRate !== this.state.frameRate ||
      nextProps.arguments.exportImages !== this.state.exportImages ||
      nextProps.arguments.exportMovies !== this.state.exportMovies
    ) {
      newState.arguments = nextProps.arguments
    }

    if (nextProps.shouldExport !== this.state.shouldExport) {
      newState.shouldExport = nextProps.shouldExport
    }

    this.setState(newState)
  }

  onChange = options => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          FlipbookExporter: {
            arguments: {
              quality: this.state.quality,
              exportImages: this.state.exportImages,
              exportMovies: this.state.exportMovies,
              frameRate: this.state.frameRate,
            },
            shouldExport: this.state.shouldExport,
          },
        })
      }
    })
  }

  toggleCanExport = shouldExport => {
    this.onChange({
      shouldExport,
    })
  }

  controlFlipbookArguments = argumment => {
    const options = {
      flipbookExportType: argumment,
    }

    if (argumment === 'image') {
      options.exportImages = true
      options.exportMovies = false
    }

    if (argumment === 'movie') {
      options.exportImages = false
      options.exportMovies = true
    }

    if (argumment === 'all') {
      options.exportImages = true
      options.exportMovies = true
    }

    this.onChange(options)
  }

  render() {
    const qualityOptions = [
      {
        label: 'Best',
        value: 'veryslow',
      },
      {
        label: 'Good',
        value: 'medium',
      },
      {
        label: 'Fast',
        value: 'fast',
      },
    ]
    const flipbookOptions = [
      {
        label: 'Individual Images',
        value: 'image',
      },
      {
        label: 'Flipbook Movie',
        value: 'movie',
      },
    ]
    const frameRateOptions = [
      {
        label: '12',
        value: 12,
      },
      {
        label: '24',
        value: 24,
      },
      {
        label: '30',
        value: 30,
      },
    ]

    return (
      <ExportsSection
        title="Flipbook Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isExportable={this.state.shouldExport}
        isOpen={this.props.isOpen}>
        <radiogroup>
          <FormLabel
            afterLabel="Export flipbook movie and images"
            className="Exports__form-element">
            <FormRadio
              onChange={() => this.controlFlipbookArguments('all')}
              checked={this.state.flipbookExportType === 'all'}
              name="FlipbookExporter"
            />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element">
            <FormRadio
              onChange={() => this.controlFlipbookArguments('image')}
              checked={this.state.flipbookExportType !== 'all'}
              name="FlipbookExporter"
            />
          </FormLabel>
          <FormLabel
            vertical
            label=""
            className="Exports__form-element Exports__form-element--nested">
            <FormSelect
              className="Exports__form-select"
              options={flipbookOptions}
              fieldLabel="label"
              fieldKey="value"
              value={this.state.flipbookExportType}
              onChange={({ value }) => this.controlFlipbookArguments(value)}
            />
          </FormLabel>
          <FormLabel
            vertical
            label="Quality"
            className="Exports__form-element Exports__form-element--nested">
            <FormSelect
              className="Exports__form-select"
              options={qualityOptions}
              fieldLabel="label"
              fieldKey="value"
              value={this.state.quality}
              onChange={({ value }) => this.onChange({ quality: value })}
            />
          </FormLabel>
          <FormLabel
            vertical
            label="Frame Rate"
            className="Exports__form-element Exports__form-element--nested">
            <FormSelect
              className="Exports__form-select"
              options={frameRateOptions}
              fieldLabel="label"
              fieldKey="value"
              value={this.state.frameRate}
              onChange={({ value }) => this.onChange({ frameRate: value })}
            />
          </FormLabel>
        </radiogroup>
      </ExportsSection>
    )
  }
}
