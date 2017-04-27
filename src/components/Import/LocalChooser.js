import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { humanFileSize, makePromiseQueue } from '../../services/jsUtil'
import { queueFileEntrysUpload, dequeueUploadFileEntrys } from '../../actions/jobActions'

const initialState = {
  isDroppable: false,     // true when file over drop target
  selectedFiles: new Map(),
  directoryCount: 0,
  uploadedSize: 0,
  totalSize: 0,
  entryInfos: new Map(),
  cancelUpload: false,
  onImport: null          // retained copy during upload processing
}

class LocalChooser extends Component {
  static propTypes = {
    onImport: PropTypes.func,
    onBack: PropTypes.func.isRequired,
    onDone: PropTypes.func,
    onCloudproxy: PropTypes.func,
    fileEntries: PropTypes.instanceOf(Map),
    actions: PropTypes.object
  }

  state = initialState

  fileEntriesCount = 0
  selectedFilesCount = 0

  componentDidMount () {
    this.collectFiles(this.props.fileEntries, this.state.selectedFiles)
  }

  componentWillReceiveProps (nextProps) {
    this.collectFiles(nextProps.fileEntries, this.state.selectedFiles)
  }

  collectFiles (fileEntries, selectedFiles) {
    // Invalidate cache whenever fileEntries or selectedFiles change size (*should* be ok)
    if (this.fileEntriesCount === fileEntries.size && this.selectedFilesCount === selectedFiles.size) return
    this.fileEntriesCount = fileEntries.size
    this.selectedFilesCount = selectedFiles.size

    const traverseFileTree = (item) => (
      new Promise(resolve => {
        if (item.isFile) {
          item.file(file => { resolve({size: file.size, fileCount: 1}) })
        } else if (item.isDirectory) {
          const dirReader = item.createReader()
          dirReader.readEntries(entries => {
            const promises = []
            for (var i = 0; i < entries.length; ++i) {
              promises.push(traverseFileTree(entries[i]))
            }
            Promise.all(promises).then(values => {
              let size = 0
              let fileCount = 0
              values.forEach(b => {
                size += b.size
                fileCount += b.fileCount
              })
              resolve({size, fileCount})
            })
              .catch(error => {
                console.log('Cannot resolve directory ' + item.name + ': ' + error)
              })
          })
        } else {
          console.log('Unknown file type for ' + item.name)
          resolve({size: 0, fileCount: 0})
        }
      })
    )

    const entries = [...fileEntries.values()]
    let directoryCount = 0
    const promises = entries.map(entry => {
      if (entry.isDirectory) ++directoryCount
      return traverseFileTree(entry)
    })
    Promise.all(promises)
      .then(values => {
        const entryInfos = new Map()
        values.forEach((info, i) => { entryInfos.set(entries[i].fullPath, info) })
        this.setState({entryInfos, directoryCount})
      })
      .catch(error => {
        console.log('Cannot traverse files: ' + error)
      })
  }

  fileName (file) { return (file.webkitRelativePath ? file.webkitRelativePath : '') + file.name }

  changeFile = (event) => {
    // FIXME: The <input> only returns File, not FilesystemEntry, so we
    // need a special path to handle these.
    const files = event.target.files
    const selectedFiles = new Map(this.state.selectedFiles)
    for (let i = 0; i < files.length; ++i) {
      const file = files[i]
      selectedFiles.set(this.fileName(file), file)
    }
    this.setState({selectedFiles}, _ => this.collectFiles(this.props.fileEntries, selectedFiles))
  }

  dropFile = (event) => {
    const items = event.dataTransfer.items
    const entries = []
    for (let i = 0; i < items.length; ++i) {
      entries.push(items[i].webkitGetAsEntry())
    }
    this.props.actions.queueFileEntrysUpload(entries)
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

  removeUploadFile = (file) => {
    console.log('Cancel upload ' + file.name)
    if (file instanceof File) {
      const selectedFiles = new Map(this.state.selectedFiles)
      selectedFiles.delete(this.fileName(file))
    } else {
      this.props.actions.dequeueUploadFileEntrys([file])
    }
  }

  sortedFiles () {
    const options = { numeric: true, sensitivity: 'base' }
    const items = [ ...this.props.fileEntries.values(), ...this.state.selectedFiles.values() ]
    return items.sort((a, b) => {
      const na = a instanceof File ? this.fileName(a) : a.fullPath
      const nb = b instanceof File ? this.fileName(b) : b.fullPath
      return na.localeCompare(nb, undefined, options)
    })
  }

  // We only know the total progress in bytes, not which file.
  // Compute per-file progress assuming in-order uploads.
  progressForFileIndex (uploadFiles, i) {
    const { progressEvent, entryInfos, uploadedSize } = this.state
    if (!progressEvent) return -1
    let bytes = 0
    const uploaded = uploadedSize + progressEvent.loaded
    for (let j = 0; j <= i && j < uploadFiles.length; ++j) {
      if (uploaded <= bytes) return 0
      const file = uploadFiles[j]
      const info = !(file instanceof File) && entryInfos.get(file.fullPath)
      const size = info ? info.size : file.size
      if (bytes + size > uploaded) {
        if (i === j) return (uploaded - bytes) / size
        return 0
      }
      bytes += size
    }
    return 1
  }

  uploadProgress = (resolve, progressEvent) => {
    this.setState({progressEvent})
    const uploadsCompleted = progressEvent && progressEvent.loaded >= progressEvent.total
    if (uploadsCompleted) {
      const uploadedSize = this.state.uploadedSize + progressEvent.loaded
      this.setState({uploadedSize})
      if (uploadedSize >= this.state.totalSize) {
        setTimeout(() => { this.props.onDone() }, 1500)
      }
      console.log('Finished upload batch')
      resolve()      // Move on to the next batch of uploads
    }
  }

  upload = (event) => {
    if (this.state.progressEvent) {
      this.setState({cancelUpload: true})
    }
    let totalSize = 0
    let fileCount = this.state.selectedFiles.size
    this.state.selectedFiles.forEach(file => { totalSize += file.size })
    this.state.entryInfos.forEach(info => {
      totalSize += info.size
      fileCount += info.fileCount
    })
    const maxSize = 128 * 1024 * 1024
    const maxCount = 500
    if (this.props.onCloudproxy && (totalSize > maxSize || fileCount > maxCount)) {
      this.props.onCloudproxy()
    } else if (this.props.onImport) {
      this.setState({totalSize})
      this.generateFileBatches(event)
    } else {
      this.onDone(event)
    }
  }

  generateFileBatches = (event) => {
    const batchSize = 20
    const files = []      // const so it can be used in recursive promises
    const batches = []
    const traverseFileTree = (item) => (
      new Promise(resolve => {
        if (item.isFile) {
          item.file(file => {
            files.push(file)
            if (files.length >= batchSize) {
              // splice to keep the files array "global" to all promises
              batches.push(files.splice(0, files.length))
            }
            resolve()
          })
        } else if (item.isDirectory) {
          const dirReader = item.createReader()
          dirReader.readEntries(entries => {
            const promises = []
            for (var i = 0; i < entries.length; ++i) {
              promises.push(traverseFileTree(entries[i]))
            }
            Promise.all(promises).then(resolve)
              .catch(error => {
                console.log('Cannot resolve directory ' + item.name + ': ' + error)
              })
          })
        } else {
          resolve()
        }
      })
    )

    const promises = []
    const sortedFiles = this.sortedFiles()
    sortedFiles.forEach(item => {
      if (item instanceof File) {
        files.push(item)
        if (files.length > batchSize) {
          batches.push(files.splice(0, files.length))
        }
      } else {
        promises.push(traverseFileTree(item))
      }
    })
    Promise.all(promises)
      .then(_ => {
        if (files.length) batches.push(files)
        this.setState({uploadedSize: 0, onImport: this.props.onImport, cancelUpload: false})
        makePromiseQueue(batches, this.launchImport, 1, this.launchProgress)
      })
  }

  launchImport = (batch) => (
    new Promise(resolve => {
      console.log('Launching batch')
      if (this.state.cancelUpload) {
        // Immediately resolve any outstanding promises if canceled
        resolve()
      } else {
        // We need to wait until the upload progress is complete before
        // resolving this promise, so pass the resolve in to progress
        const uploadProgress = this.uploadProgress.bind(this, resolve)

        // Note that we use a private copy of the import callback because
        // props.onImport is not passed after initiating an upload.
        this.state.onImport(batch, uploadProgress)
      }
    })
  )

  launchProgress = (finished, total) => {
    console.log('Finished ' + finished + ' out of ' + total + ' total ' + this.state.totalSize)
  }

  renderProgress (value) {
    if (value < 0) return <div>Pending</div>
    return <progress max={1} value={value}/>
  }

  back = (event) => {
    this.props.actions.dequeueUploadFileEntrys(this.props.fileEntries)
    this.setState(initialState)
    this.props.onBack()
  }

  renderFileList () {
    const { isDroppable, entryInfos } = this.state
    const isDraggable = !this.props.onImport
    const uploadFiles = this.sortedFiles()
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
            { uploadFiles.map((file, i) => {
              const progress = this.progressForFileIndex(uploadFiles, i)
              const info = !(file instanceof File) && entryInfos.get(file.fullPath)
              const size = info ? (info.fileCount > 1 ? `${info.fileCount} file${info.fileCount > 1 ? 's' : ''}, ${humanFileSize(info.size)}` : humanFileSize(info.size)) : humanFileSize(file.size)
              const icon = (file instanceof File) || file.isFile ? (progress >= 1 ? 'icon-file-empty' : 'icon-file-empty2') : 'icon-folder'
              return (
                <tr key={i} className="LocalChooser-upload">
                  <td className="LocalChooser-upload-status"><div className={icon}/></td>
                  <td className="LocalChooser-upload-name">{this.fileName(file)}</td>
                  <td className="LocalChooser-upload-size">{size}</td>
                  <td className="LocalChooser-upload-progress">{this.renderProgress(progress)}</td>
                  <td onClick={_ => this.removeUploadFile(file)} className="LocalChooser-upload-cancel">
                    <div className="icon-cancel-circle"/>
                  </td>
                </tr>
              )
            })}
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
               type="file" multiple="multiple" id="source"
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
    const { onImport, onBack } = this.props
    const { progressEvent, directoryCount } = this.state
    const fileCount = this.props.fileEntries.size - directoryCount
    const uploadsCompleted = progressEvent && progressEvent.loaded >= progressEvent.total
    const disabled = (progressEvent && !uploadsCompleted) || (!fileCount && !directoryCount)
    const step = onImport ? 2 : 3
    let title = onImport ? 'Upload' : 'Stop'
    if (onImport && fileCount) title += ` ${fileCount} File${fileCount > 1 ? 's' : ''}`
    if (onImport && fileCount && directoryCount) title += ' and'
    if (onImport && directoryCount) title += ` ${directoryCount} Folder${directoryCount > 1 ? 's' : ''}`
    return (
      <div className="LocalChooser">
        <div className="Import-back" onClick={this.back}>
          <div className="icon-chevron-right" style={{transform: 'rotate(180deg)'}}/>
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step {step}:</div>
          { step === 2 ? 'Drop files to import.' : 'Uploading files.' }
        </div>
        <div className="LocalChooser-body">
          { fileCount || directoryCount ? this.renderFileList() : this.renderDropzone() }
        </div>
        <div className="LocalChooser-start">
          <div className={classnames('Import-button', {disabled})} onClick={!disabled && this.upload}>
            {title}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  fileEntries: state.jobs.fileEntries
}), dispatch => ({
  actions: bindActionCreators({
    queueFileEntrysUpload,
    dequeueUploadFileEntrys
  }, dispatch)
}))(LocalChooser)
