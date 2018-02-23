import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import { updateExportInterface } from '../../actions/exportsAction'
import Heading from '../Heading'
import ExportInformation from './ExportInformation'
import ImageExporter from './ImageExporter'
import VideoClipExporter from './VideoClipExporter'
import FlipbookExporter from './FlipbookExporter'
import PdfExporter from './PdfExporter'
import MetadataExporter from './MetadataExporter'

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
    actions: PropTypes.shape({
      updateExportInterface: PropTypes.func.isRequired
    })
  }

  state = {
    visibleExporter: undefined,
    isExportInformationVisible: true
  }

  close = () => {
    this.props.actions.updateExportInterface({
      shouldShow: false
    })
  }

  onSubmit = event => {
    event.preventDefault()
    console.log(event)
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

  toggleExportInformationVisibility = () => {
    this.setState(prevState => ({
      isExportInformationVisible: !(prevState.isExportInformationVisible === true)
    }))
  }

  render () {
    const MetadataExporterState = this.state.CsvExporter || this.state.JsonExporter
    const body = (
      <div className="Exports">
        <ModalHeader icon="icon-export" closeFn={this.close}>
          Create Export
        </ModalHeader>
        <form onSubmit={this.onSubmit} className="Exports__body">
          <div className="Exports__sidebar">
            <ExportInformation
              isOpen={this.state.isExportInformationVisible}
              onToggleAccordion={this.toggleExportInformationVisibility}
              onChange={this.onChange}
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
            {this.state.ImageExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Image Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.imageAssetCount} assets
                  </span>
                  <span>
                    Export as: {this.state.ImageExporter.arguments.format.toUpperCase()}
                  </span>
                  <span>
                    Quality: {articulateQuality(this.state.ImageExporter.arguments.quality)}
                  </span>
                  <span>
                    Resize: {this.state.ImageExporter.arguments.size}px
                  </span>
                </dd>
              </dl>
            )}
            {this.state.VideoClipExporter && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Image Assets</dt>
                <dd className="Exports__review-definition">
                  <span>
                    {this.props.movieAssetCount} assets
                  </span>
                  <span>
                    Export as: {this.state.VideoClipExporter.arguments.format.toUpperCase()}
                  </span>
                  <span>
                    Quality: {articulateQuality(this.state.VideoClipExporter.arguments.quality)}
                  </span>
                  <span>
                    Aspect Ratio: {this.state.VideoClipExporter.arguments.aspectRatio}
                  </span>
                  <span>
                    Resolution: {this.state.VideoClipExporter.arguments.resolution}p
                  </span>
                </dd>
              </dl>
            )}
            {this.state.FlipbookExporter && (
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
                    })(this.state.FlipbookExporter.arguments)}
                  </span>
                  <span>
                    Quality: {articulateQuality(this.state.FlipbookExporter.arguments.quality)}
                  </span>
                  <span>
                    Size: {this.state.FlipbookExporter.arguments.size}px
                  </span>
                </dd>
              </dl>
            )}
            {this.state.PdfExporter && (
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
                    })(this.state.PdfExporter.arguments)}
                  </span>
                  <span>
                    Quality: {articulateQuality(this.state.PdfExporter.arguments.quality)}
                  </span>
                  <span>
                    Size: {this.state.PdfExporter.arguments.size}px
                  </span>
                </dd>
              </dl>
            )}
            {MetadataExporterState && (
              <dl className="Exports__review-section">
                <dt className="Exports__review-term">Metadata</dt>
                <dd className="Exports__review-definition">
                  <span>
                    Export as: {MetadataExporterState.prettyName}
                  </span>
                </dd>
              </dl>
            )}
            <section className="Exports__review-section">
              <pre style={{fontFamily: 'monospace', overflowX: 'scroll'}}>{JSON.stringify(this.state, undefined, 2)}</pre>
            </section>
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

export default connect(state => ({
  shouldShow: state.exports.shouldShow,
  imageAssetCount: 287,
  movieAssetCount: 14,
  flipbookAssetCount: 2,
  documentAssetCount: 49,
  totalAssetCount: 352
}), dispatch => ({
  actions: bindActionCreators({
    updateExportInterface
  }, dispatch)
}))(Exports)
