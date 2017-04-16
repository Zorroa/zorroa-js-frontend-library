import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import { humanFileSize } from '../../services/jsUtil'

export default class LocalChooser extends Component {
  static propTypes = {
    onImport: PropTypes.func,
    onBack: PropTypes.func.isRequired,
    onDone: PropTypes.func,
    files: PropTypes.instanceOf(FileList)
  }

  state = {
    isDroppable: false,     // true when file over drop target
    uploadFiles: [],        // pending File array
  }

  componentWillMount () {
    const { files } = this.props
    if (files) this.addFiles(files)
  }

  addFiles (files, event) {
    const uploadFiles = [...this.state.uploadFiles]
    for (let i = 0; i < files.length; ++i) {
      const file = files[i]
      if (uploadFiles.findIndex(f => (f.name === file.name)) < 0) {
        console.log('   Added File: ' + file.name)
        uploadFiles.push(file)
      } else {
        console.log('   Skipped duplicate file: ' + file.name)
      }
    }
    this.setState({uploadFiles})
    return false
  }

  changeFile = (event) => {
    this.addFiles(event.target.files)
  }

  dropFile = (event) => {
    this.addFiles(event.dataTransfer.files)
    this.setState({isDroppable: false})
    event.preventDefault()
  }

  dragEnter = (event) => {
    if (!this.props.onImport || this.state.progressEvent) return   // No dropping after upload started
    this.setState({isDroppable: true})
  }

  dragOver = (event) => {
    if (this.state.isDroppable) event.preventDefault()
    return false
  }

  dragLeave = (event) => {
    this.setState({isDroppable: false})
  }

  removeUploadFile (file, event) {
    console.log('Cancel upload ' + file.name)
    const uploadFiles = this.state.uploadFiles.filter(f => (f.name !== file.name))
    this.setState({uploadFiles})
  }

  // We only know the total progress in bytes, not which file.
  // Compute per-file progress assuming in-order uploads.
  progressForFileIndex (i) {
    const { progressEvent, uploadFiles } = this.state
    if (!progressEvent) return -1
    let bytes = 0
    for (let j = 0; j <= i && j < uploadFiles.length; ++j) {
      if (progressEvent.loaded <= bytes) return 0
      const file = uploadFiles[j]
      if (bytes + file.size > progressEvent.loaded) {
        if (i === j) return (progressEvent.loaded - bytes) / file.size
        return 0
      }
      bytes += file.size
    }
    return 1
  }

  uploadProgress = (progressEvent) => {
    this.setState({progressEvent})
    if (progressEvent.loaded >= progressEvent.total) {
      setTimeout(() => { this.props.onDone() }, 1500)
    }
  }

  renderProgress (i) {
    const value = this.progressForFileIndex(i)
    if (value < 0) return <div>Pending</div>
    return <progress max={1} value={value}/>
  }

  renderFileList () {
    const { isDroppable, uploadFiles } = this.state
    const isDraggable = !this.props.onImport
    return (
      <div className="LocalChooser-activity-region">
        <div className={classnames('LocalChooser-uploads', {isDraggable})}>
          <div
            className={classnames('LocalChooser-uploads-dropzone', {isDroppable})}
            onDragOver={this.dragOver}
            onDragEnter={this.dragEnter}
            onDragLeave={this.dragLeave}
            onDrop={this.dropFile}>
            Drop Assets to Import
          </div>
          <table className="LocalChooser-upload-table">
            <tbody>
            { uploadFiles.map((file, i) => (
              <tr key={i} className="LocalChooser-upload">
                <td className="LocalChooser-upload-status">
                  <div className={`icon-file-empty${this.progressForFileIndex(i) === 1 ? '' : '2'}`}/>
                </td>
                <td className="LocalChooser-upload-name">{file.name}</td>
                <td
                  className="LocalChooser-upload-size">{humanFileSize(file.size)}</td>
                <td className="LocalChooser-upload-type">{file.type}</td>
                <td
                  className="LocalChooser-upload-progress">{this.renderProgress(i)}</td>
                <td onClick={this.removeUploadFile.bind(this, file)}
                    className="LocalChooser-upload-cancel">
                  <div className="icon-cancel-circle"/>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        { this.renderSelectFiles() }
      </div>
    )
  }

  renderSelectFiles () {
    if (!this.props.onImport) return
    return (
      <div className="LocalChooser-dropzone-select-file">
        <input className="LocalChooser-dropzone-select-file-input"
               type="file"
               multiple id="source"
               onChange={this.changeFile}/>
        <label htmlFor="source"
               className="LocalChooser-dropzone-select-file-label">
          Select Files
        </label>
      </div>
    )
  }

  renderDropzone () {
    const { isDroppable } = this.state
    return (
      <div className="LocalChooser-activity-region">
        <div
          className={classnames('LocalChooser-dropzone', {isDroppable})}
          onDragEnter={this.dragEnter}
          onDragOver={this.dragOver}
          onDragLeave={this.dragLeave}
          onDrop={this.dropFile}>
          Drag & Drop Assets to Import
          <div className="LocalChooser-dropzone-options">
            <div className="LocalChooser-dropzone-option-label">
              Or Browse Files
            </div>
            { this.renderSelectFiles() }
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { onImport, onDone, onBack } = this.props
    const { uploadFiles, progressEvent } = this.state
    const uploadsCompleted = progressEvent && progressEvent.loaded >= progressEvent.total
    const disabled = (progressEvent && !uploadsCompleted) || !uploadFiles.length
    const step = onImport ? 2 : 3
    let title = onImport ? 'Upload' : 'Dismiss'
    if (onImport && uploadFiles.length) title += ` ${uploadFiles.length} File${uploadFiles.length > 1 ? 's': ''}`
    return (
      <div className="LocalChooser">
        <div className="Import-back" onClick={onBack}>
          <div className="icon-chevron-right" style={{transform:'rotate(180deg)'}}/>
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step {step}:</div>
          { step === 2 ? 'Drop files to import.' : 'Uploading files.' }
        </div>
        <div className="LocalChooser-body">
          { uploadFiles.length ? this.renderFileList() : this.renderDropzone() }
        </div>
        <div className="LocalChooser-start">
          <div className={classnames('Import-button', {disabled})} onClick={!disabled && (onImport ? (e => onImport(uploadFiles, this.uploadProgress, e)) : (e => onDone(e)))}>
            {title}
          </div>
        </div>
      </div>
    )
  }
}
