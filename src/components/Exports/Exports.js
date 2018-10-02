import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ModalOverlay, {
  ModalOverlayBody,
  ModalOverlaySidebar,
  ModalOverlayHeader,
} from '../ModalOverlay'
import classnames from 'classnames'
import FlashMessage from '../FlashMessage'
import { getClassFromNamespace } from './utils'
import ZipExportPackager from './Exporters/ZipExportPackager'
import ImageExporter from './Exporters/ConnectedImageExporter'
import VideoClipExporter from './Exporters/ConnectedVideoClipExporter'
import FlipbookExporter from './Exporters/ConnectedFlipbookExporter'
import PdfExporter from './Exporters/ConnectedPdfExporter'
import MetadataExporter from './Exporters/ConnectedMetadataExporter'
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
import {
  FILE_GROUP_IMAGES,
  FILE_GROUP_VIDEOS,
  FILE_GROUP_DOCUMENTS,
  groupExts,
} from '../../constants/fileTypes.js'
import moment from 'moment'
import { JobFilter } from '../../models/Job'

const SHOW_SUCCESS_MS = 2750

export default class Exports extends Component {
  static propTypes = {
    name: PropTypes.string,
    userEmail: PropTypes.string.isRequired,
    userFullName: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    assetSearch: PropTypes.instanceOf(AssetSearch),
    hasRestrictedAssets: PropTypes.bool.isRequired,
    imageAssetCount: PropTypes.number.isRequired,
    videoAssetCount: PropTypes.number.isRequired,
    flipbookAssetCount: PropTypes.number.isRequired,
    documentAssetCount: PropTypes.number.isRequired,
    totalAssetCount: PropTypes.number.isRequired,
    selectedAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    metadataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    errorMessage: PropTypes.string,
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
            className: PropTypes.string,
          }),
        ),
      }),
    ),
    loadingCreateExport: PropTypes.bool.isRequired,
    loadingCreateExportError: PropTypes.bool.isRequired,
    loadingCreateExportSuccess: PropTypes.bool.isRequired,
    maxExportableAssets: PropTypes.number.isRequired,
    onlineAssets: PropTypes.number.isRequired,
    offlineAssets: PropTypes.number.isRequired,
    exportRequestPosting: PropTypes.bool.isRequired,
    exportRequestPostingError: PropTypes.bool.isRequired,
    exportRequestPostingSuccess: PropTypes.bool.isRequired,
    packageName: PropTypes.string,
    origin: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      getProcessors: PropTypes.func.isRequired,
      hideExportInterface: PropTypes.func.isRequired,
      postExportProfiles: PropTypes.func.isRequired,
      loadExportProfiles: PropTypes.func.isRequired,
      clearPostExportLoadingStates: PropTypes.func.isRequired,
      exportRequest: PropTypes.func.isRequired,
      onlineStatus: PropTypes.func.isRequired,
      createExport: PropTypes.func.isRequired,
      getJobs: PropTypes.func.isRequired,
      toggleCollapsible: PropTypes.func.isRequired,
    }),
    processors: PropTypes.arrayOf(
      PropTypes.shape({
        className: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }

  constructor(props) {
    super(props)

    this.defaultProcessors = {
      ImageExporter: {
        arguments: {
          exportOriginal: true,
          format: 'jpg',
          size: 1024,
          quality: 100,
        },
        shouldExport: false,
      },
      PdfExporter: {
        arguments: {
          exportOriginal: true,
          pageMode: 'separate',
        },
        shouldExport: false,
        format: 'multipage',
      },
      FlipbookExporter: {
        arguments: {
          quality: 'medium',
          exportImages: true,
          exportMovies: true,
          frameRate: 30,
        },
        shouldExport: false,
        flipbookExportType: 'image',
      },
      CsvExporter: {
        arguments: {
          fields: props.metadataFields,
        },
        shouldExport: true,
      },
      JsonExporter: {
        arguments: {
          fields: props.metadataFields,
        },
        shouldExport: false,
      },
      VideoClipExporter: {
        arguments: {
          scale: '960:540',
          quality: 'medium',
          format: 'mp4',
          exportOriginal: true,
        },
        shouldExport: false,
      },
    }

    this.state = {
      ...this.defaultProcessors,
      fileName: `zorroa-export-${moment().format(
        'YYYYMMDD',
      )}-${props.packageName || 'untitled'}-${moment().format('x')}`,
      showPresetForm: false,
      visibleExporter: 'ZipExportPackager',
      presetId: undefined,
      newPresetName: `Preset ${new Date().toLocaleDateString()}`,
      presetSaveCounter: 0,
    }
  }

  componentDidMount() {
    this.props.actions.loadExportProfiles()
    this.props.actions.getProcessors()
    this.props.actions.onlineStatus(new AssetSearch(this.props.assetSearch))
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.exportProfilesPosting !== nextProps.exportProfilesPosting && // Must be a new prop
      this.props.exportProfilesPosting === true && // Only change if it was in the middle of posting
      this.state.showPresetForm === true // Only change if the form is already open
    ) {
      // Hide the form after a few seconds to show the success indicator
      setTimeout(() => {
        this.setState(prevState => ({
          showPresetForm: false,
          presetSaveCounter: prevState.presetSaveCounter + 1,
          newPresetName: `Preset ${prevState.presetSaveCounter + 1}`,
        }))
      }, SHOW_SUCCESS_MS)
    }

    if (this.hasNewAssets(nextProps)) {
      this.updateAssetExportability()
    }
  }

  hasNewAssets(otherProps) {
    return otherProps.selectedAssets !== this.props.selectedAssets
  }

  updateAssetExportability() {
    const extensions = groupExts
    this.setState((state, props) => {
      return {
        ...state,
        ImageExporter: {
          ...state.ImageExporter,
          shouldExport: props.selectedAssets.some(asset => {
            return extensions[FILE_GROUP_IMAGES].includes(asset.extension())
          }),
        },
        VideoClipExporter: {
          ...state.VideoClipExporter,
          shouldExport: props.selectedAssets.some(asset => {
            return extensions[FILE_GROUP_VIDEOS].includes(asset.extension())
          }),
        },
        PdfExporter: {
          ...state.PdfExporter,
          shouldExport: props.selectedAssets.some(asset => {
            return extensions[FILE_GROUP_DOCUMENTS].includes(asset.extension())
          }),
        },
      }
    })
  }

  getJobs() {
    const { userId } = this.props
    const type = 'Exports'
    const jobFilter = new JobFilter({ type, userId })
    this.props.actions.getJobs(jobFilter, 0, 30)
    if (this.props.loadingCreateExportSuccess) {
      const isOpen = true
      this.props.actions.toggleCollapsible('exportJobs', isOpen)
    }
  }

  close = () => {
    this.props.actions.hideExportInterface()
    this.getJobs()
  }

  onChange = newState => {
    this.setState({
      ...newState,
      presetId: undefined,
    })
  }

  getSaveProfileState() {
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

  getExportRequestState() {
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

  getCreateExportState() {
    if (this.props.loadingCreateExportError === true) {
      return 'error'
    }

    if (this.props.loadingCreateExportSuccess === true) {
      return 'success'
    }

    if (this.props.loadingCreateExport === true) {
      return 'loading'
    }
  }

  toggleAccordion = visibleExporter => {
    if (this.state.visibleExporter === visibleExporter) {
      this.setState({
        visibleExporter: undefined,
      })
      return
    }

    this.setState({
      visibleExporter,
    })
  }

  saveProfiles = () => {
    const presetId = Number.parseInt(Math.random() * 10000000000)
    const savedProfiles = [].concat(this.props.exportProfiles, {
      processors: this.serializeExporterArguments().processors,
      presetName: this.state.newPresetName,
      id: presetId,
    })

    this.props.actions.postExportProfiles(savedProfiles)

    this.setState({
      presetId,
    })
  }

  onSelectPreset = preset => {
    const presets = preset.processors.reduce(
      (accumulator, processor) => {
        const className = processor.className
        accumulator[getClassFromNamespace(className)] = Object.assign(
          {},
          this.state[className],
          {
            arguments: processor.args,
            shouldExport: true,
          },
        )
        return accumulator
      },
      { ...this.defaultProcessors },
    )

    this.setState({
      ...presets,
      presetId: preset.id,
    })
  }

  serializeExporterArguments = () => {
    const fileName = this.state.fileName
    let fullyQualifiedProcessorNames = {
      ImageExporter: 'com.zorroa.core.exporter.ImageExporter',
      VideoClipExporter: 'com.zorroa.core.exporter.VideoExporter',
      FlipbookExporter: 'com.zorroa.core.exporter.FlipbookExporter',
      PdfExporter: 'com.zorroa.core.exporter.PdfExporter',
      CsvExporter: 'com.zorroa.core.exporter.CsvExporter',
      JsonExporter: 'com.zorroa.core.exporter.JsonExporter',
    }
    const pipelineProcessors = this.props.processors

    if (pipelineProcessors.length > 0) {
      fullyQualifiedProcessorNames = pipelineProcessors.reduce(
        (accumulator, processor) => {
          const className = processor.className
          const classShortName = getClassFromNamespace(className)
          accumulator[classShortName] = className
          return accumulator
        },
        {},
      )
    }

    const processors = Object.keys(fullyQualifiedProcessorNames).reduce(
      (accumulator, exporterName) => {
        const exporter = this.state[exporterName]

        if (exporter && exporter.shouldExport === true) {
          accumulator.push({
            args: { ...exporter.arguments },
            className: `${fullyQualifiedProcessorNames[exporterName]}`,
          })
        }

        return accumulator
      },
      [],
    )

    return {
      search: this.props.assetSearch,
      name: this.props.packageName || fileName,
      compress: true,
      processors,
    }
  }

  startExport = () => {
    this.props.actions.createExport(this.serializeExporterArguments())
  }

  togglePresetFormVisibility = () => {
    this.props.actions.clearPostExportLoadingStates()
    this.setState(prevState => ({
      showPresetForm: !(prevState.showPresetForm === true),
    }))
  }

  canRequestExport() {
    const folderId = this.getExportFolderId()
    return folderId !== undefined
  }

  startExportRequest = () => {
    const folderId = this.getExportFolderId()
    const email = this.props.userEmail
    const fullName = this.props.userFullName

    // Export Request from [user's first name] for [folder name]
    // CAUTION: Sometimes the root folder ID can be 0, so strict type checking is called for here
    if (this.canRequestExport()) {
      this.props.actions.exportRequest({
        folderId,
        type: 'Export',
        comment: `Use the button below to view the folder. If you approve please export the folder for ${fullName}.`,
        emailCC: email,
      })

      return
    }

    console.error('A folder must be selected in order to request an export')
  }

  getExportFolderId() {
    return (
      this.props.assetSearch &&
      this.props.assetSearch.filter &&
      this.props.assetSearch.filter.links &&
      this.props.assetSearch.filter.links.folder &&
      this.props.assetSearch.filter.links.folder[0]
    )
  }

  isFileNameValid() {
    return this.state.fileName.trim().length > 0
  }

  onSubmit(event) {
    event.preventDefault()
  }

  render() {
    const exporterArguments = this.serializeExporterArguments()
    const processors = exporterArguments.processors
    const { exportProfiles, hasRestrictedAssets } = this.props
    const activePreset = exportProfiles.find(
      preset => preset.id === this.state.presetId,
    )
    const exportsClassNames = classnames('Exports', {
      'Exports--loading': this.props.isLoading,
    })
    return (
      <ModalOverlay onClose={this.close} className={exportsClassNames}>
        <ModalOverlayHeader
          onClose={this.close}
          className="Exports__header"
          icon="icon-export">
          Create Export
        </ModalOverlayHeader>
        <ModalOverlaySidebar>
          {hasRestrictedAssets === false && (
            <div>
              <ZipExportPackager
                isOpen={this.state.visibleExporter === 'ZipExportPackager'}
                onToggleAccordion={() =>
                  this.toggleAccordion('ZipExportPackager')
                }
                onChange={this.onChange}
                savedArguments={this.state.savedArguments}
                fileName={this.state.fileName}
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
                onToggleAccordion={() =>
                  this.toggleAccordion('VideoClipExporter')
                }
                onChange={this.onChange}
                arguments={this.state.VideoClipExporter.arguments}
                shouldExport={this.state.VideoClipExporter.shouldExport}
              />
              <FlipbookExporter
                isOpen={this.state.visibleExporter === 'FlipbookExporter'}
                onToggleAccordion={() =>
                  this.toggleAccordion('FlipbookExporter')
                }
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
                onToggleAccordion={() =>
                  this.toggleAccordion('MetadataExporter')
                }
                onChange={this.onChange}
                exporter={
                  this.state.JsonExporter.shouldExport
                    ? 'JsonExporter'
                    : 'CsvExporter'
                }
                shouldExport={
                  this.state.JsonExporter.shouldExport ||
                  this.state.CsvExporter.shouldExport
                }
              />
            </div>
          )}
          {hasRestrictedAssets === true && (
            <div>
              <h2 className="Exports__sidebar-title">Export Request</h2>
              <h3 className="Exports__sidebar-subtitle">Export Package Name</h3>
              <p className="Exports__sidebar-paragraph">
                {this.state.fileName}
              </p>
            </div>
          )}
        </ModalOverlaySidebar>
        <ModalOverlayBody>
          <form onSubmit={this.onSubmit} className="Exports__body">
            <div className="Exports__mainbar-container">
              {this.isFileNameValid() === false && (
                <FlashMessage look="error">
                  An export cannot have a blank name.
                </FlashMessage>
              )}
              {this.props.totalAssetCount > this.props.maxExportableAssets && (
                <FlashMessage look="warning">
                  The current export contains{' '}
                  {this.props.totalAssetCount.toLocaleString()} assets. A
                  maximum of {this.props.maxExportableAssets.toLocaleString()}{' '}
                  assets can be exported at a given time. The remaining{' '}
                  {(
                    this.props.totalAssetCount - this.props.maxExportableAssets
                  ).toLocaleString()}{' '}
                  will be ignored.
                </FlashMessage>
              )}
              {this.props.loadingCreateExportSuccess && (
                <FlashMessage look="success">
                  We’re processing your export. It may take some time to
                  complete, but you can close this window at any time and we’ll
                  notify you when the export is complete.
                </FlashMessage>
              )}
              {hasRestrictedAssets &&
                this.canRequestExport() === false && (
                  <FlashMessage look="warning">
                    <p>
                      To export, choose a folder and right-click for export
                      options.
                    </p>
                  </FlashMessage>
                )}
              {this.props.errorMessage && (
                <FlashMessage look="error">
                  <p>
                    Whoops, something went wrong on our server. Feel free to try
                    this request again. If the problem persists, you can report
                    the error message below:
                  </p>
                  {this.props.errorMessage && (
                    <p>“{this.props.errorMessage} ”</p>
                  )}
                </FlashMessage>
              )}
              <ExportsPreview
                selectedAssets={this.props.selectedAssets}
                origin={this.props.origin}
              />
              <dl className="Exports__review-section Exports__review-section--heading">
                <dt className="Exports__review-term">Assets</dt>
                <dd className="Exports__review-definition">
                  {this.props.totalAssetCount.toLocaleString()}
                </dd>
              </dl>
              {this.props.offlineAssets > 0 && (
                <div>
                  <dl className="Exports__review-section Exports__review-section--heading">
                    <dt className="Exports__review-term">Online Assets</dt>
                    <dd className="Exports__review-definition">
                      {this.props.onlineAssets.toLocaleString()}
                    </dd>
                  </dl>
                  <dl className="Exports__review-section Exports__review-section--heading">
                    <dt className="Exports__review-term">Offline Assets</dt>
                    <dd className="Exports__review-definition">
                      {this.props.offlineAssets.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              )}
              <dl className="Exports__review-section Exports__review-section--heading">
                <dt className="Exports__review-term">Name</dt>
                <dd className="Exports__review-definition">
                  {this.state.fileName}
                </dd>
              </dl>
              {hasRestrictedAssets === false && (
                <dl className="Exports__review-section Exports__review-section--heading">
                  <dt className="Exports__review-term">Profile</dt>
                  <dd
                    className={classnames('Exports__review-definition', {
                      'Exports__review-definition--demphasized':
                        this.state.presetId === undefined,
                    })}>
                    {activePreset === undefined
                      ? 'No profile chosen'
                      : activePreset.presetName}
                  </dd>
                </dl>
              )}
              {processors.map((processor, index) => {
                const key = `${processor.className}-${index}`
                switch (getClassFromNamespace(processor.className)) {
                  case 'ImageExporter':
                    return (
                      <ExportPreviewerImage
                        key={key}
                        imageAssetCount={this.props.imageAssetCount}
                        exporterArguments={processor.args}
                      />
                    )

                  case 'VideoExporter':
                    return (
                      <ExportPreviewerVideoClip
                        key={key}
                        videoAssetCount={this.props.videoAssetCount}
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
                    return <ExportPreviewerJson key={key} />

                  case 'CsvExporter':
                    return <ExportPreviewerCsv key={key} />
                }
              })}
            </div>
            {hasRestrictedAssets === false && (
              <div className="Exports__form-footer">
                <div
                  className={classnames('Exports__main-form-buttons', {
                    'Exports__main-form-buttons--visible':
                      this.state.showPresetForm !== true,
                  })}>
                  <div className="Exports__form-button-group">
                    <FormButton
                      disabled={this.isFileNameValid() === false}
                      state={this.getCreateExportState()}
                      onClick={this.startExport}>
                      Export
                    </FormButton>
                    <FormButton look="minimal" onClick={this.close}>
                      Cancel
                    </FormButton>
                  </div>
                  <div className="Exports__form-button-group Exports__form-button-group--secondary">
                    <FormButton
                      look="mini"
                      icon={<span className="icon-save" />}
                      onClick={this.togglePresetFormVisibility}>
                      Save Export Profile
                    </FormButton>
                  </div>
                </div>
                <div
                  className={classnames('Exports__main-form-buttons', {
                    'Exports__main-form-buttons--visible':
                      this.state.showPresetForm === true,
                  })}>
                  <div className="Exports__form-button-group">
                    <FormLabel
                      label="Name preset"
                      className="Exports__form-element Exports__form-element--inline">
                      <FormInput
                        value={this.state.newPresetName}
                        inlineReset
                        className="Exports__form-input--inline"
                        onChange={presetName =>
                          this.setState({ newPresetName: presetName })
                        }
                      />
                    </FormLabel>
                  </div>
                  <div className="Exports__form-button-group Exports__form-button-group--secondary">
                    <FormButton
                      state={this.getSaveProfileState()}
                      onClick={this.saveProfiles}>
                      Save
                    </FormButton>
                    <FormButton
                      look="minimal"
                      onClick={this.togglePresetFormVisibility}>
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
                    <FormButton
                      title={
                        this.canRequestExport()
                          ? ''
                          : 'To export, choose a folder and right-click for export options'
                      }
                      disabled={this.canRequestExport() === false}
                      state={this.getExportRequestState()}
                      onClick={this.startExportRequest}>
                      Request Export
                    </FormButton>
                    <FormButton look="minimal" onClick={this.close}>
                      Cancel
                    </FormButton>
                  </div>
                </div>
              </div>
            )}
          </form>
        </ModalOverlayBody>
      </ModalOverlay>
    )
  }
}
