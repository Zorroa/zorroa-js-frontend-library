import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import {
  hideExportInterface,
  postExportProfiles,
  loadExportProfiles,
  clearPostExportLoadingStates,
  exportRequest
} from '../../actions/exportsAction'
import ZipExporter from './Exporters/ZipExporter'
import ImageExporter from './Exporters/ImageExporter'
import VideoClipExporter from './Exporters/VideoClipExporter'
import FlipbookExporter from './Exporters/FlipbookExporter'
import PdfExporter from './Exporters/PdfExporter'
import MetadataExporter from './Exporters/MetadataExporter'
import { FormButton, FormInput, FormLabel } from '../Form'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import ExportPreviewerImage from './Previewers/Image'
import ExportPreviewerFlipbook from './Previewers/Flipbook'
import ExportPreviewerVideoClip from './Previewers/VideoClip'
import ExportPreviewerPdf from './Previewers/Pdf'
import ExportPreviewerJson from './Previewers/Json'
import ExportPreviewerCsv from './Previewers/Csv'
import ExportsPreview from './ExportsPreview'
import { Save as IconSave } from '../Icons'

const SHOW_SUCCESS_MS = 2750

class Exports extends Component {
  static propTypes = {
    name: PropTypes.string,
    userEmail: PropTypes.string.isRequired,
    assetSearch: PropTypes.instanceOf(AssetSearch),
    hasRestrictedAssets: PropTypes.bool.isRequired,
    imageAssetCount: PropTypes.number.isRequired,
    movieAssetCount: PropTypes.number.isRequired,
    flipbookAssetCount: PropTypes.number.isRequired,
    documentAssetCount: PropTypes.number.isRequired,
    totalAssetCount: PropTypes.number.isRequired,
    selectedAssets: PropTypes.arrayOf(
      PropTypes.instanceOf(Asset)
    ),
    isLoading: PropTypes.bool.isRequired,
    exportProfilesPostingError: PropTypes.bool.isRequired,
    exportProfilesSuccess: PropTypes.bool.isRequired,
    exportProfilesPosting: PropTypes.bool.isRequired,
    exportProfiles: PropTypes.arrayOf(
      PropTypes.shape({
        presetName: PropTypes.string,
        id: PropTypes.number,
        processors: PropTypes.arrayOf(
          PropTypes.shape({
            args: PropTypes.object,
            className: PropTypes.string
          })
        )
      })
    ),
    exportRequestPosting: PropTypes.bool.isRequired,
    exportRequestPostingError: PropTypes.bool.isRequired,
    exportRequestPostingSuccess: PropTypes.bool.isRequired,
    packageName: PropTypes.string,
    origin: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      hideExportInterface: PropTypes.func.isRequired,
      postExportProfiles: PropTypes.func.isRequired,
      loadExportProfiles: PropTypes.func.isRequired,
      clearPostExportLoadingStates: PropTypes.func.isRequired,
      exportRequest: PropTypes.func.isRequired
    })
  }

  constructor (props) {
    super(props)

    this.defaultProcessors = {
      ImageExporter: {
        arguments: {
          exportOriginal: true,
          format: 'jpg',
          size: 256,
          quality: 100
        },
        shouldExport: false
      },
      PdfExporter: {
        arguments: {
          size: 1200,
          quality: 100,
          exportOriginal: true,
          mediaType: 'pdf',
          pageMode: 'merge'
        },
        shouldExport: false,
        format: 'multipage'
      },
      FlipbookExporter: {
        arguments: {
          quality: 100,
          size: 1200,
          exportImages: true,
          exportMovies: true
        },
        shouldExport: false,
        flipbookExportType: 'image'
      },
      CsvExporter: {
        arguments: {},
        shouldExport: false
      },
      JsonExporter: {
        arguments: {},
        shouldExport: false
      },
      VideoClipExporter: {
        arguments: {
          resolution: 720,
          quality: 100,
          aspectRatio: undefined,
          format: 'mp4',
          exportOriginal: true
        },
        shouldExport: false
      },
      ZipExporter: {
        arguments: {
          fileName: props.packageName || `evi-export-${(new Date()).toLocaleDateString().replace(/\//g, '-')}.zip`
        },
        shouldExport: true
      }
    }

    this.state = {
      ...this.defaultProcessors,
      showPresetForm: false,
      visibleExporter: 'ZipExporter',
      presetId: undefined,
      newPresetName: `Preset ${(new Date()).toLocaleDateString()}`,
      presetSaveCounter: 0
    }
  }

  componentDidMount () {
    this.props.actions.loadExportProfiles()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.exportProfilesPosting !== nextProps.exportProfilesPosting && // Must be a new prop
      this.props.exportProfilesPosting === true && // Only change if it was in the middle of posting
      this.state.showPresetForm === true // Only change if the form is already open
    ) {
      // Hide the form after a few seconds to show the success indicator
      setTimeout(() => {
        this.setState(prevState => ({
          showPresetForm: false,
          presetSaveCounter: prevState.presetSaveCounter + 1,
          newPresetName: `Preset ${prevState.presetSaveCounter + 1}`
        }))
      }, SHOW_SUCCESS_MS)
    }
  }

  close = () => {
    this.props.actions.hideExportInterface()
  }

  onChange = newState => {
    this.setState({
      ...newState,
      presetId: undefined
    })
  }

  getSaveProfileState () {
    if (this.props.exportProfilesPostingError === true) {
      return 'error'
    }

    if (this.props.exportProfilesSuccess === true) {
      return 'success'
    }

    if (this.props.exportProfilesPosting === true) {
      return 'loading'
    }
  }

  getExportRequestState () {
    if (this.props.exportRequestPostingError === true) {
      return 'error'
    }

    if (this.props.exportRequestPostingSuccess === true) {
      return 'success'
    }

    if (this.props.exportRequestPosting === true) {
      return 'loading'
    }
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

  saveProfiles = () => {
    const presetId = Number.parseInt(Math.random() * 10000000000)
    const savedProfiles = [].concat(this.props.exportProfiles, {
      processors: this.serializeExporterArguments().processors,
      presetName: this.state.newPresetName,
      id: presetId
    })

    this.props.actions.postExportProfiles(savedProfiles)

    this.setState({
      presetId
    })
  }

  onSelectPreset = (preset) => {
    const presets = preset
      .processors
      .reduce((accumulator, processor) => {
        const className = processor.className
        accumulator[className] = Object.assign({}, this.state[className], {
          arguments: processor.args,
          shouldExport: true
        })
        return accumulator
      }, {...this.defaultProcessors})

    this.setState({
      ...presets,
      presetId: preset.id
    })
  }

  serializeExporterArguments = () => {
    const processors = [
      'ImageExporter',
      'VideoClipExporter',
      'FlipbookExporter',
      'PdfExporter',
      'CsvExporter',
      'JsonExporter'
    ].reduce((accumulator, exporterName) => {
      const exporter = this.state[exporterName]

      if (exporter && exporter.shouldExport === true) {
        accumulator.push({
          args: {...exporter.arguments},
          className: exporterName
        })
      }

      return accumulator
    }, [])

    // Everything shoud be bundled in a nice .Zip file
    processors.push({
      className: 'ZipExporter',
      args: {
        fileName: this.state.ZipExporter.arguments.fileName
      }
    })

    return {
      search: this.props.assetSearch,
      processors
    }
  }

  startExport = () => {
    console.log(JSON.stringify(this.serializeExporterArguments(), undefined, 4))
  }

  togglePresetFormVisibility = () => {
    this.props.actions.clearPostExportLoadingStates()
    this.setState(prevState => ({
      showPresetForm: !(prevState.showPresetForm === true)
    }))
  }

  startExportRequest = () => {
    const folderId = this.getExportFolderId()
    const email = this.props.userEmail

    // CAUTION: Sometimes the root folder ID can be 0, so strict type checking is called for here
    if (folderId !== undefined) {
      this.props.actions.exportRequest({
        folderId,
        type: 'ExportRequest',
        comment: `${email} has requested an export of folder ID ${folderId}.`,
        emailCC: email
      })

      return
    }

    console.error('A folder must be selected in order to request an export')
  }

  getExportFolderId () {
    return (
      this.props.assetSearch &&
      this.props.assetSearch.filter &&
      this.props.assetSearch.filter.links &&
      this.props.assetSearch.filter.links.folder &&
      this.props.assetSearch.filter.links.folder[0]
    )
  }

  render () {
    const exporterArguments = this.serializeExporterArguments()
    const processors = exporterArguments.processors
    const { exportProfiles, hasRestrictedAssets } = this.props
    const activePreset = exportProfiles.find(preset => preset.id === this.state.presetId)
    const exportsClassNames = classnames('Exports', {
      'Exports--loading': this.props.isLoading
    })
    const body = (
      <div className={exportsClassNames}>
        <ModalHeader className="Exports__header" icon="icon-export" closeFn={this.close}>
         Create Export
        </ModalHeader>
        <form onSubmit={this.onSubmit} className="Exports__body">
            { hasRestrictedAssets === false && (
              <div className="Exports__sidebar">
                <ZipExporter
                  isOpen={this.state.visibleExporter === 'ZipExporter'}
                  onToggleAccordion={() => this.toggleAccordion('ZipExporter')}
                  onChange={this.onChange}
                  savedArguments={this.state.savedArguments}
                  fileName={this.state.ZipExporter.arguments.fileName}
                  presetId={this.state.presetId}
                  presets={this.props.exportProfiles}
                  onSelectPreset={this.onSelectPreset}
                />
                <ImageExporter
                  isOpen={this.state.visibleExporter === 'ImageExporter'}
                  onToggleAccordion={() => this.toggleAccordion('ImageExporter')}
                  onChange={this.onChange}
                  arguments={this.state.ImageExporter.arguments}
                  shouldExport={this.state.ImageExporter.shouldExport}
                />
                <VideoClipExporter
                  isOpen={this.state.visibleExporter === 'VideoClipExporter'}
                  onToggleAccordion={() => this.toggleAccordion('VideoClipExporter')}
                  onChange={this.onChange}
                  arguments={this.state.VideoClipExporter.arguments}
                  shouldExport={this.state.VideoClipExporter.shouldExport}

                />
                <FlipbookExporter
                  isOpen={this.state.visibleExporter === 'FlipbookExporter'}
                  onToggleAccordion={() => this.toggleAccordion('FlipbookExporter')}
                  onChange={this.onChange}
                  arguments={this.state.FlipbookExporter.arguments}
                  shouldExport={this.state.FlipbookExporter.shouldExport}
                />
                <PdfExporter
                  isOpen={this.state.visibleExporter === 'PdfExporter'}
                  onToggleAccordion={() => this.toggleAccordion('PdfExporter')}
                  onChange={this.onChange}
                  arguments={this.state.PdfExporter.arguments}
                  format={this.state.PdfExporter.format}
                  shouldExport={this.state.PdfExporter.shouldExport}
                />
                <MetadataExporter
                  isOpen={this.state.visibleExporter === 'MetadataExporter'}
                  onToggleAccordion={() => this.toggleAccordion('MetadataExporter')}
                  onChange={this.onChange}
                  exporter={this.state.JsonExporter.shouldExport ? 'JsonExporter' : 'CsvExporter'}
                  shouldExport={this.state.JsonExporter.shouldExport || this.state.CsvExporter.shouldExport}
                />
              </div>
            ) }

            { hasRestrictedAssets === true && (
              <div className="Exports__sidebar">
                <h2 className="Exports__sidebar-title">Export Request</h2>
                <h3 className="Exports__sidebar-subtitle">Export Package Name</h3>
                <p className="Exports__sidebar-paragraph">{this.state.ZipExporter.arguments.fileName}</p>
              </div>
            )}
          <div className="Exports__mainbar">
            <ExportsPreview
              selectedAssets={this.props.selectedAssets}
              origin={this.props.origin}
            />
            <dl className="Exports__review-section Exports__review-section--heading">
              <dt className="Exports__review-term">Assets</dt>
              <dd className="Exports__review-definition">{this.props.totalAssetCount.toLocaleString()}</dd>
            </dl>
            <dl className="Exports__review-section Exports__review-section--heading">
              <dt className="Exports__review-term">Name</dt>
              <dd className="Exports__review-definition">{this.state.ZipExporter.arguments.fileName}</dd>
            </dl>
            {hasRestrictedAssets === false && (
              <dl className="Exports__review-section Exports__review-section--heading">
                <dt className="Exports__review-term">Profile</dt>
                <dd className={classnames('Exports__review-definition', {
                  'Exports__review-definition--demphasized': this.state.presetId === undefined
                })}>
                  {activePreset === undefined
                    ? 'No profile chosen'
                    : activePreset.presetName
                  }
                </dd>
              </dl>
            )}
            {
              processors.map((processor, index) => {
                const key = `${processor.className}-${index}`
                switch (processor.className) {
                  case 'ImageExporter':
                    return (
                      <ExportPreviewerImage
                        key={key}
                        imageAssetCount={this.props.imageAssetCount}
                        exporterArguments={processor.args}
                      />
                    )

                  case 'VideoClipExporter':
                    return (
                      <ExportPreviewerVideoClip
                        key={key}
                        movieAssetCount={this.props.movieAssetCount}
                        exporterArguments={processor.args}
                      />
                    )

                  case 'FlipbookExporter':
                    return (
                      <ExportPreviewerFlipbook
                        key={key}
                        flipbookAssetCount={this.props.flipbookAssetCount}
                        exporterArguments={processor.args}
                      />
                    )

                  case 'PdfExporter':
                    return (
                      <ExportPreviewerPdf
                        key={key}
                        documentAssetCount={this.props.documentAssetCount}
                        exporterArguments={processor.args}
                      />
                    )

                  case 'JsonExporter':
                    return (
                      <ExportPreviewerJson key={key} />
                    )

                  case 'CsvExporter':
                    return (
                      <ExportPreviewerCsv key={key} />
                    )
                }
              })
            }
            { hasRestrictedAssets === false && (
              <div className="Exports__form-footer">
                <div className={classnames('Exports__main-form-buttons', {
                  'Exports__main-form-buttons--visible': this.state.showPresetForm !== true
                })}>
                  <div className="Exports__form-button-group">
                    <FormButton onClick={this.startExport}>
                      Export
                    </FormButton>
                    <FormButton look="minimal" onClick={this.close}>
                      Cancel
                    </FormButton>
                  </div>
                  <div className="Exports__form-button-group Exports__form-button-group--secondary">
                    <FormButton look="mini" onClick={this.togglePresetFormVisibility}>
                      <IconSave />
                      <span className="Exports__save-label">
                        Save Export Profile
                      </span>
                    </FormButton>
                  </div>
                </div>
                <div className={classnames('Exports__main-form-buttons', {
                  'Exports__main-form-buttons--visible': this.state.showPresetForm === true
                })}>
                  <div className="Exports__form-button-group">
                    <FormLabel
                      label="Name preset"
                      className="Exports__form-element Exports__form-element--inline"
                    >
                      <FormInput
                        value={this.state.newPresetName}
                        inlineReset
                        className="Exports__form-input--inline"
                        onChange={(presetName) => this.setState({newPresetName: presetName})}
                      />
                    </FormLabel>
                  </div>
                  <div className="Exports__form-button-group Exports__form-button-group--secondary">
                    <FormButton state={this.getSaveProfileState()} onClick={this.saveProfiles}>
                      Save
                    </FormButton>
                    <FormButton look="minimal" onClick={this.togglePresetFormVisibility}>
                      Back
                    </FormButton>
                  </div>
                </div>
              </div>
            )}
            {hasRestrictedAssets === true && (
              <div className="Exports__form-footer">
                <div className="Exports__main-form-buttons Exports__main-form-buttons--visible">
                  <div className="Exports__form-button-group">
                    <FormButton state={this.getExportRequestState()} onClick={this.startExportRequest}>
                      Request Export
                    </FormButton>
                    <FormButton look="minimal" onClick={this.close}>
                      Cancel
                    </FormButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    )

    return (
      <Modal
        onModalUnderlayClick={this.close}
        body={body}
        width={'830px'}
      />
    )
  }
}

export default connect(state => ({
  userEmail: state.auth.user.email,
  assetSearch: state.exports.assetSearch,
  hasRestrictedAssets: state.exports.hasRestrictedAssets,
  movieAssetCount: state.exports.videoAssetCount,
  imageAssetCount: state.exports.imageAssetCount,
  flipbookAssetCount: state.exports.flipbookAssetCount,
  documentAssetCount: state.exports.documentAssetCount,
  totalAssetCount: state.exports.totalAssetCount,
  selectedAssets: state.exports.exportPreviewAssets,
  shouldShow: state.exports.shouldShow,
  origin: state.auth.origin,
  exportProfiles: state.exports.exportProfiles,
  packageName: state.exports.packageName,
  exportProfilesPostingError: state.exports.exportProfilesPostingError,
  exportProfilesSuccess: state.exports.exportProfilesSuccess,
  exportProfilesPosting: state.exports.exportProfilesPosting,
  isLoading: state.exports.isLoading,
  exportRequestPosting: state.exports.exportRequestPosting,
  exportRequestPostingError: state.exports.exportRequestPostingError,
  exportRequestPostingSuccess: state.exports.exportRequestPostingSuccess

}), dispatch => ({
  actions: bindActionCreators({
    hideExportInterface,
    loadExportProfiles,
    postExportProfiles,
    clearPostExportLoadingStates,
    exportRequest
  }, dispatch)
}))(Exports)
