import React, { Component, PropTypes } from 'react'
import {
  FormSelect,
  FormLabel,
  FormRadio
} from '../../Form'
import ExportsSection from '../ExportsSection'
import ResizeExportAsset from '../ResizeExportAsset'

export default class ImageExporter extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    isOpen: PropTypes.bool,
    onToggleAccordion: PropTypes.func.isRequired,
    shouldExport: PropTypes.bool.isRequired,
    arguments: PropTypes.shape({
      format: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      quality: PropTypes.number.isRequired,
      exportOriginal: PropTypes.bool.isRequired
    })
  }

  state = {
    shouldExport: this.props.shouldExport,
    format: this.props.arguments.format,
    size: this.props.arguments.size,
    quality: this.props.arguments.quality,
    exportOriginal: this.props.arguments.exportOriginal
  }

  onChange = (options, overrideExportOriginal) => {
    if (overrideExportOriginal !== undefined) {
      options.exportOriginal = overrideExportOriginal
    }

    this.setState(options, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({
          ImageExporter: {
            arguments: {
              format: this.state.format,
              size: this.state.size,
              quality: this.state.quality,
              exportOriginal: this.state.exportOriginal
            },
            shouldExport: this.state.shouldExport
          }
        })
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    const newState = {}

    if (
      nextProps.arguments.format !== this.state.format ||
      nextProps.arguments.size !== this.state.size ||
      nextProps.arguments.quality !== this.state.quality ||
      nextProps.arguments.exportOriginal !== this.state.exportOriginal
    ) {
      newState.arguments = nextProps.arguments
    }

    if (nextProps.shouldExport !== this.state.shouldExport) {
      newState.shouldExport = nextProps.shouldExport
    }

    this.setState(newState)
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
        'label': 'JPG',
        'value': 'jpg'
      },
      {
        'label': 'JPEG',
        'value': 'jpeg'
      },
      {
        'label': 'PNG',
        'value': 'png'
      },
      {
        'label': 'TIF',
        'value': 'tif'
      },
      {
        'label': 'TIFF',
        'value': 'tiff'
      },
      {
        'label': 'GIF',
        'value': 'gif'
      },
      {
        'label': 'BMP',
        'value': 'bmp'
      },
      {
        'label': 'CIN',
        'value': 'cin'
      },
      {
        'label': 'DDS',
        'value': 'dds'
      },
      {
        'label': 'DPX',
        'value': 'dpx'
      },
      {
        'label': 'FITS',
        'value': 'fits'
      },
      {
        'label': 'HDR',
        'value': 'hdr'
      },
      {
        'label': 'ICO',
        'value': 'ico'
      },
      {
        'label': 'IFF',
        'value': 'iff'
      },
      {
        'label': 'EXR',
        'value': 'exr'
      },
      {
        'label': 'PNM',
        'value': 'pnm'
      },
      {
        'label': 'PSD',
        'value': 'psd'
      },
      {
        'label': 'RLA',
        'value': 'rla'
      },
      {
        'label': 'SGI',
        'value': 'sgi'
      },
      {
        'label': 'PIC',
        'value': 'pic'
      },
      {
        'label': 'TGA',
        'value': 'tga'
      },
      {
        'label': 'DPX',
        'value': 'dpx'
      },
      {
        'label': 'RAW',
        'value': 'raw'
      },
      {
        'label': 'KDC',
        'value': 'kdc'
      },
      {
        'label': 'MRW',
        'value': 'mrw'
      },
      {
        'label': 'SRW',
        'value': 'srw'
      },
      {
        'label': 'PEF',
        'value': 'pef'
      },
      {
        'label': 'RAF',
        'value': 'raf'
      },
      {
        'label': 'SRF',
        'value': 'srf'
      },
      {
        'label': 'ARW',
        'value': 'arw'
      },
      {
        'label': 'ORF',
        'value': 'orf'
      },
      {
        'label': 'NEF',
        'value': 'nef'
      },
      {
        'label': 'CR2',
        'value': 'cr2'
      },
      {
        'label': 'DNG',
        'value': 'dng'
      },
      {
        'label': 'CRW',
        'value': 'crw'
      },
      {
        'label': 'ZFILE',
        'value': 'zfile'
      }
    ]
    return (
      <ExportsSection
        title="Image Assets"
        onToggleExport={this.toggleCanExport}
        onToggleAccordion={this.props.onToggleAccordion}
        isExportable={this.state.shouldExport}
        isOpen={this.props.isOpen}
      >
        <radiogroup>
          <FormLabel afterLabel="Export original assets" className="Exports__form-element">
            <FormRadio onChange={() => this.toggleExportOriginal(true)} checked={this.state.exportOriginal === true} name="ImageExporter" />
          </FormLabel>
          <FormLabel
            afterLabel="Export assets as"
            className="Exports__form-element"
          >
            <FormRadio onChange={() => this.toggleExportOriginal(false)} checked={this.state.exportOriginal === false} name="ImageExporter" />
          </FormLabel>
          <FormLabel
            vertical
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
            label="Export assets as"
            className="Exports__form-element Exports__form-element--nested"
          >
            <FormSelect
              className="Exports__form-select"
              options={formatOptions}
              fieldLabel='label'
              fieldKey='value'
              value={this.state.format}
              onChange={({value}) => this.onChange({format: value}, false)}
            >
            </FormSelect>
          </FormLabel>
          <ResizeExportAsset
            defaultSize={this.state.size}
            onChange={(size) => this.onChange({size}, false)}
          />
        </radiogroup>
      </ExportsSection>
    )
  }
}
