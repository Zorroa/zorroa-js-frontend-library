import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import { updateExportInterface } from '../../actions/exportsAction'
import ExportInformation from './ExportInformation'
import ImageExporter from './ImageExporter'
import VideoClipExporter from './VideoClipExporter'
import FlipbookExporter from './FlipbookExporter'
import PdfExporter from './PdfExporter'
import MetadataExporter from './MetadataExporter'
import { FormButton } from '../Form'
import Asset from '../../models/Asset'
import {
  FILE_GROUP_IMAGES,
  FILE_GROUP_VECTORS,
  FILE_GROUP_VIDEOS,
  FILE_GROUP_FLIPBOOKS,
  FILE_GROUP_DOCUMENTS,
  groupExts
} from '../../constants/fileTypes'

function articulateQuality (quality) {
  if (quality > 75) {
    return 'Best'
  }

  if (quality > 50) {
    return 'Good'
  }

  return 'Fast'
}

class Exports extends Component {
  static propTypes = {
    name: PropTypes.string,
    imageAssetCount: PropTypes.number.isRequired,
    movieAssetCount: PropTypes.number.isRequired,
    flipbookAssetCount: PropTypes.number.isRequired,
    documentAssetCount: PropTypes.number.isRequired,
    totalAssetCount: PropTypes.number.isRequired,
    selectedAssets: PropTypes.oneOf(Asset),
    origin: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      updateExportInterface: PropTypes.func.isRequired
    })
  }

  state = {
    visibleExporter: 'ExportInformation',
    isExportInformationVisible: true,
    showDebugForm: false,
    ExportInformation: {
      arguments: {
        exportPackageName: `evi-export-${(new Date()).toLocaleDateString().replace(/\//g, '-')}`
      }
    }
  }

  close = () => {
    this.props.actions.updateExportInterface({
      shouldShow: false
    })
  }

  onChange = newState => {
    this.setState(newState)
  }

  toggleAccordion = (visibleExporter) => {
    if (this.state.visibleExporter === visibleExporter) {
      this.setState({
        visibleExporter: undefined
      })
      return
    }

    this.setState({
      visibleExporter
    })
  }

  getMetadataExporter () {
    return this.state.CsvExporter || this.state.JsonExporter
  }

  serializeExporterArguments () {
    const exporters = [
      'ImageExporter',
      'VideoClipExporter',
      'FlipbookExporter',
      'PdfExporter',
      'CsvExporter',
      'JsonExporter'
    ].reduce((accumulator, exporterName) => {
      const exporter = this.state[exporterName]

      if (exporter && exporter.shouldExport === true) {
        accumulator[exporterName] = exporter.arguments
      }

      return accumulator
    }, {})

    return {
      ...this.state.ExportInformation.arguments,
      exporters
    }
  }

  render () {
    const metadataExporterState = this.getMetadataExporter()
    const exporterArguments = this.serializeExporterArguments()
    const exporters = exporterArguments.exporters

    const body = (
      <div className="Exports">
        <ModalHeader icon="icon-export" closeFn={this.close}>
          Create Export
        </ModalHeader>
        <form onSubmit={this.onSubmit} className="Exports__body">
          <div className="Exports__sidebar">
            <ExportInformation
              isOpen={this.state.visibleExporter === 'ExportInformation'}
              onToggleAccordion={() => this.toggleAccordion('ExportInformation')}
              onChange={this.onChange}
              exportPackageName={this.state.ExportInformation.arguments.exportPackageName}
            />
            <ImageExporter
              isOpen={this.state.visibleExporter === 'ImageExporter'}
              onToggleAccordion={() => this.toggleAccordion('ImageExporter')}
              onChange={this.onChange}
            />
            <VideoClipExporter
              isOpen={this.state.visibleExporter === 'VideoClipExporter'}
              onToggleAccordion={() => this.toggleAccordion('VideoClipExporter')}
              onChange={this.onChange}
            />
            <FlipbookExporter
              isOpen={this.state.visibleExporter === 'FlipbookExporter'}
              onToggleAccordion={() => this.toggleAccordion('FlipbookExporter')}
              onChange={this.onChange}
            />
            <PdfExporter
              isOpen={this.state.visibleExporter === 'PdfExporter'}
              onToggleAccordion={() => this.toggleAccordion('PdfExporter')}
              onChange={this.onChange}
            />
            <MetadataExporter
              isOpen={this.state.visibleExporter === 'MetadataExporter'}
              onToggleAccordion={() => this.toggleAccordion('MetadataExporter')}
              onChange={this.onChange}
            />
          </div>
          <div className="Exports__mainbar">
            <dl className="Exports__review-section">
              <dt className="Exports__review-term">Assets</dt>
              <dd className="Exports__review-definition">{this.props.totalAssetCount}</dd>
            </dl>
            <dl className="Exports__review-section">
              <dt className="Exports__review-term">Name</dt>
              <dd className="Exports__review-definition">{exporterArguments.exportPackageName}</dd>
            </dl>
            {exporters.ImageExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Image Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.imageAssetCount} assets
                  </span>
                  <span>
                    Export as: {exporters.ImageExporter.format.toUpperCase()}
                  </span>
                  <span>
                    Quality: {articulateQuality(exporters.ImageExporter.quality)}
                  </span>
                  <span>
                    Resize: {exporters.ImageExporter.size}px
                  </span>
                </dd>
              </dl>
            )}
            {exporters.VideoClipExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Movie Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.movieAssetCount} assets
                  </span>
                  <span>
                    Export as: {exporters.VideoClipExporter.format.toUpperCase()}
                  </span>
                  <span>
                    Quality: {articulateQuality(exporters.VideoClipExporter.quality)}
                  </span>
                  <span>
                    Aspect Ratio: {exporters.VideoClipExporter.aspectRatio || 'Original'}
                  </span>
                  <span>
                    Resolution: {exporters.VideoClipExporter.resolution}p
                  </span>
                </dd>
              </dl>
            )}
            {exporters.FlipbookExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Flipbook Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.flipbookAssetCount} assets
                  </span>
                  <span>
                    Export as: {(({exportImages, exportMovies}) => {
                      if (exportImages && exportMovies) {
                        return 'Movie and Image Files'
                      }

                      if (exportMovies) {
                        return 'Movie Files'
                      }

                      if (exportImages) {
                        return 'Image Files'
                      }
                    })(exporters.FlipbookExporter)}
                  </span>
                  <span>
                    Quality: {articulateQuality(exporters.FlipbookExporter.quality)}
                  </span>
                  <span>
                    Size: {exporters.FlipbookExporter.size}px
                  </span>
                </dd>
              </dl>
            )}
            {exporters.PdfExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Document Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.documentAssetCount} assets
                  </span>
                  <span>
                    Export as: {(({pageMode, mediaType}) => {
                      const formattedMediaType = mediaType.toUpperCase()

                      if (pageMode === 'merge') {
                        return `Combined ${formattedMediaType}`
                      }

                      return `Single page ${formattedMediaType}`
                    })(exporters.PdfExporter)}
                  </span>
                  <span>
                    Quality: {articulateQuality(exporters.PdfExporter.quality)}
                  </span>
                  <span>
                    Size: {exporters.PdfExporter.size}px
                  </span>
                </dd>
              </dl>
            )}
            {metadataExporterState && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Metadata</dt>
                <dd className="Exports__review-definition">
                  <span>
                    Export as: {metadataExporterState.prettyName}
                  </span>
                </dd>
              </dl>
            )}
            <div className="Exports__form-buttons">
              <FormButton onClick={() => this.setState({
                showDebugForm: true
              })}>
                Export
              </FormButton>
              <FormButton look="minimal" onClick={this.close}>
                Cancel
              </FormButton>
            </div>
            { this.state.showDebugForm && (
              <section className="Exports__review-section">
                <pre style={{fontFamily: 'monospace', overflowX: 'scroll'}}>{JSON.stringify(exporterArguments, undefined, 2)}</pre>
              </section>
            )}
          </div>
        </form>
      </div>
    )

    return (
      <div className="Exports">
        <Modal
          onModalUnderlayClick={this.close}
          body={body}
          width={'80vw'}
        />
      </div>
    )
  }
}

export default connect(state => {
  const assets = state.assets
  const selectedAssets = (assets.all || [])
    .filter(asset => assets.selectedIds && assets.selectedIds.has(asset.id) === true)

  const assetCounts = selectedAssets.reduce((accumulator, asset) => {
    if ((assets.selectedIds instanceof Set) === false ||
      assets.selectedIds.has(asset.id) === false
    ) {
      return accumulator
    }

    const assetExtension = asset.document.source.extension

    accumulator.totalAssetCount += 1

    if (groupExts[FILE_GROUP_IMAGES].includes(assetExtension) ||
      groupExts[FILE_GROUP_VECTORS].includes(assetExtension)
    ) {
      accumulator.imageAssetCount += 1
    }

    if (groupExts[FILE_GROUP_VIDEOS].includes(assetExtension)) {
      accumulator.movieAssetCount += 1
    }

    if (groupExts[FILE_GROUP_FLIPBOOKS].includes(assetExtension)) {
      accumulator.flipbookAssetCount += 1
    }

    if (groupExts[FILE_GROUP_DOCUMENTS].includes(assetExtension)) {
      accumulator.documentAssetCount += 1
    }

    return {...accumulator}
  }, {
    imageAssetCount: 0,
    movieAssetCount: 0,
    flipbookAssetCount: 0,
    documentAssetCount: 0,
    totalAssetCount: 0
  })

  return {
    ...assetCounts,
    selectedAssets,
    shouldShow: state.exports.shouldShow,
    origin: state.auth.origin
  }
}, dispatch => ({
  actions: bindActionCreators({
    updateExportInterface
  }, dispatch)
}))(Exports)
