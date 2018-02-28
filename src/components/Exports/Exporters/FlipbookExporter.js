import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../../Form'
import ExportsSection from '../ExportsSection'
import ResizeExportAsset from '../ResizeExportAsset'

export default class FlipbookExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onToggleAccordion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    shouldExport: PropTypes.bool,
    arguments: PropTypes.shape({
      quality: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      exportImages: PropTypes.number.isRequired,
      exportMovies: PropTypes.bool.isRequired
    })
  }

  state = {
    isOpen: true,
    shouldExport: this.props.shouldExport,
    flipbookExportType: 'image',

    // Exporter arguments
    quality: this.props.arguments.quality,
    size: this.props.arguments.size,
    exportImages: this.props.arguments.exportImages,
    exportMovies: this.props.arguments.exportMovies
  }

  componentWillReceiveProps (nextProps) {
    const newState = {}
    if (
      nextProps.arguments.quality !== this.state.quality ||
      nextProps.arguments.size !== this.state.size ||
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

  onChange = (options) => {
    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          FlipbookExporter: {
            arguments: {
              size: this.state.size,
              quality: this.state.quality,
              exportImages: this.state.exportImages,
              exportMovies: this.state.exportMovies
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

  controlFlipbookArguments = argumment => {
    const options = {
      flipbookExportType: argumment
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
    const flipbookOptions = [
      {
        label: 'Individual Images',
        value: 'image'
      },
      {
        label: 'Flipbook Movie',
        value: 'movie'
      }
    ]

    return (
      <ExportsSection
        title="Flipbook Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isExportable={this.state.shouldExport}
        isOpen={this.props.isOpen}
      >
        <radiogroup>
          <FormLabel afterLabel="Export flipbook movie and images" className="Exports__form-element">
            <FormRadio
              onChange={() => this.controlFlipbookArguments('all')}
              checked={this.state.flipbookExportType === 'all'}
              name="FlipbookExporter"
            />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio
              onChange={() => this.controlFlipbookArguments('image')}
              checked={this.state.flipbookExportType !== 'all'}
              name="FlipbookExporter"
            />
          </FormLabel>
          <FormLabel
            vertical
            label=""
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={flipbookOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.flipbookExportType}
              onChange={({value}) => this.controlFlipbookArguments(value)}
            >
            </FormSelect>
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
          <ResizeExportAsset
            defaultSize={this.state.size}
            onChange={(size) => this.onChange({size})}
          />
        </radiogroup>
      </ExportsSection>
    )
  }
}
