import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Filter from '../Filter'
import DropboxChooser from "./DropboxChooser"

export default class ImportFinder extends Component {
  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    onImport: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired
  }

  state = {
    files: new Map(),
    selectedFiles: new Set(),
    addedFiles: new Set(),
    selectedAddedFiles: new Set(),
    addedFilter: ''
  }

  selectFile = (id, selectedFiles, files, event) => {
    this.setState({selectedFiles, files})
  }

  addSelected = (event) => {
    const { selectedFiles } = this.state
    const addedFiles = new Set([...this.state.addedFiles])
    selectedFiles.forEach(id => addedFiles.add(id))
    this.setState({addedFiles})
  }

  removeSelected = (event) => {
    const { selectedAddedFiles } = this.state
    const addedFiles = new Set([...this.state.addedFiles])
    selectedAddedFiles.forEach(id => { addedFiles.delete(id) })
    this.setState({addedFiles, selectedAddedFiles: new Set()})
  }

  selectAddedFile = (id, event) => {
    const selectedAddedFiles = new Set([...this.state.selectedAddedFiles])
    if (selectedAddedFiles.has(id)) {
      selectedAddedFiles.delete(id)
    } else {
      selectedAddedFiles.add(id)
    }
    this.setState({selectedAddedFiles})
  }

  changeAddedFilter = (event) => {
    this.setState({addedFilter: event.target.value})
  }

  clearAddedFilter = (event) => {
    this.setState({addedFilter: ''})
  }

  render () {
    const { accessToken, onImport, onBack } = this.props
    const { files, selectedFiles, addedFiles, selectedAddedFiles, addedFilter } = this.state
    const disabled = !addedFiles.size
    const fileCount = [...addedFiles].filter(id => !files.get(id).childIds).length
    const folderCount = addedFiles.size - fileCount
    let title = 'Import'
    if (fileCount) title += ` ${fileCount} File${fileCount > 1 ? 's' : ''}`
    if (folderCount && fileCount) title += ' and'
    if (folderCount) title += ` ${folderCount} Folder${folderCount > 1 ? 's' : ''}`
    const lcfilter = addedFilter.toLowerCase()
    const added = [...addedFiles].map(id => files.get(id)).filter(file => (
      file.name.toLowerCase().includes(lcfilter) ||
      file.path.toLowerCase().includes(lcfilter)
    )).sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}))
    return (
      <div className="ImportFinder">
        <div className="Import-back" onClick={onBack}>
          <div className="icon-chevron-right" style={{transform:'rotate(180deg)'}}/>
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step 3:</div>
          Choose files & folders to import.
        </div>
        <div className="ImportFinder-body">
          <div className="ImportFinder-finder">
            <DropboxChooser accessToken={accessToken} onSelect={this.selectFile}/>
          </div>
          <div className="ImportFinder-shifters">
            <div className={classnames('ImportFinder-shifter',
              'icon-chevron-right', {disabled: !selectedFiles.size})}
                 onClick={this.addSelected}/>
            <div className={classnames('ImportFinder-shifter',
              'icon-chevron-right', 'flip', {disabled: !selectedAddedFiles.size})}
                 onClick={this.removeSelected}/>
          </div>
          <div className="ImportFinder-added">
            <div className="ImportFinder-added-filter">
              <div className="ImportFinder-added-icon icon-folder-add"/>
              <Filter className="box" value={addedFilter} onChange={this.changeAddedFilter}
                      onClear={this.clearAddedFilter} placeholder="Filter paths"/>
            </div>
            <div className="ImportFinder-added-files">
              { added.map(file => (
                <div key={file.id}
                     className={classnames('ImportFinder-added-file',
                       {selected: selectedAddedFiles.has(file.id)})}
                     onClick={e => this.selectAddedFile(file.id, e)}>
                  <div className={'ImportFinder-added-icon icon-' + (file.childIds ? 'folder' : 'file-empty2')}/>
                  {file.path}
                </div>
              ))}
              { !addedFiles.size && (
                <div className="ImportFinder-added-empty">
                  Select files and
                  <div className="ImportFinder-added-empty-icon icon-chevron-right"/>
                  add to import
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ImportFinder-start">
          <div className={classnames('Import-button', {disabled})}
               onClick={!disabled && (e => onImport([...addedFiles].map(id => files.get(id)), null, e))}>
            {title}
          </div>
        </div>
      </div>
    )
  }
}
