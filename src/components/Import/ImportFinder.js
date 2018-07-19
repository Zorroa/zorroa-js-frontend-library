import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

import Filter from '../Filter'
import DropboxChooser from './DropboxChooser'
import BoxChooser from './BoxChooser'
import GDriveChooser from './GDriveChooser'
import CloudproxyChooser from './CloudproxyChooser'
import ServerPathChooser from './ServerPathChooser'
import {
  DROPBOX_CLOUD,
  BOX_CLOUD,
  GDRIVE_CLOUD,
  CLOUDPROXY_CLOUD,
  SERVER_PATH_CLOUD,
} from './ImportConstants'

export default class ImportFinder extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    mode: PropTypes.string.isRequired,
    onImport: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
  }

  state = {
    files: new Map(),
    selectedFiles: new Set(),
    addedFiles: new Set(),
    selectedAddedFiles: new Set(),
    addedFilter: '',
  }

  selectFile = (id, selectedFiles, files, event) => {
    this.setState({ selectedFiles, files })
  }

  addSelected = event => {
    const { selectedFiles } = this.state
    const addedFiles = new Set([...this.state.addedFiles])
    selectedFiles.forEach(id => addedFiles.add(id))
    this.setState({ addedFiles })
  }

  removeSelected = event => {
    const { selectedAddedFiles } = this.state
    const addedFiles = new Set([...this.state.addedFiles])
    selectedAddedFiles.forEach(id => {
      addedFiles.delete(id)
    })
    this.setState({ addedFiles, selectedAddedFiles: new Set() })
  }

  selectAddedFile = (id, event) => {
    const selectedAddedFiles = new Set([...this.state.selectedAddedFiles])
    if (selectedAddedFiles.has(id)) {
      selectedAddedFiles.delete(id)
    } else {
      selectedAddedFiles.add(id)
    }
    this.setState({ selectedAddedFiles })
  }

  changeAddedFilter = event => {
    this.setState({ addedFilter: event.target.value })
  }

  clearAddedFilter = event => {
    this.setState({ addedFilter: '' })
  }

  renderChooser() {
    const { mode, accessToken, onBack } = this.props
    switch (mode) {
      case DROPBOX_CLOUD:
        return (
          <DropboxChooser
            accessToken={accessToken}
            onSelect={this.selectFile}
            onBack={onBack}
          />
        )
      case BOX_CLOUD:
        return (
          <BoxChooser
            onSelect={this.selectFile}
            onBack={onBack}
            accessToken={accessToken}
            clientID="nvjb3koff9j86go05crt24o0br60gk2r"
            clientSecret="sPX3HUXU98pRMj1QDCVjW3xeTw8ccmPy"
          />
        )
      case CLOUDPROXY_CLOUD:
        return <CloudproxyChooser onSelect={this.selectFile} onBack={onBack} />
      case GDRIVE_CLOUD:
        return (
          <GDriveChooser
            onSelect={this.selectFile}
            onBack={onBack}
            accessToken=""
          />
        )
      case SERVER_PATH_CLOUD:
        return <ServerPathChooser onSelect={this.selectFile} onBack={onBack} />
    }
  }

  render() {
    const { onImport, onBack } = this.props
    const {
      files,
      selectedFiles,
      addedFiles,
      selectedAddedFiles,
      addedFilter,
    } = this.state
    const disabled = !addedFiles.size
    const fileCount = [...addedFiles].filter(id => !files.get(id).childIds)
      .length
    const folderCount = addedFiles.size - fileCount
    let title = 'Import'
    if (fileCount) title += ` ${fileCount} File${fileCount > 1 ? 's' : ''}`
    if (folderCount && fileCount) title += ' and'
    if (folderCount)
      title += ` ${folderCount} Folder${folderCount > 1 ? 's' : ''}`
    const lcfilter = addedFilter.toLowerCase()
    const added = [...addedFiles]
      .map(id => files.get(id))
      .filter(file => file.name.toLowerCase().includes(lcfilter))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
    return (
      <div className="ImportFinder">
        <div className="Import-back" onClick={onBack}>
          <div
            className="icon-arrow-down"
            style={{ transform: 'rotate(90deg)' }}
          />
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step 3:</div>
          Choose files & folders to import.
        </div>
        <div className="ImportFinder-body">
          <div className="ImportFinder-finder">{this.renderChooser()}</div>
          <div className="ImportFinder-shifters">
            <div
              className={classnames('ImportFinder-shifter', 'icon-arrow-down', {
                disabled: !selectedFiles.size,
              })}
              onClick={this.addSelected}
              style={{ transform: 'rotate(-90deg)' }}
            />
            <div
              className={classnames(
                'ImportFinder-shifter',
                'icon-arrow-down',
                'flip',
                { disabled: !selectedAddedFiles.size },
              )}
              onClick={this.removeSelected}
              style={{ transform: 'rotate(90deg)' }}
            />
          </div>
          <div className="ImportFinder-added">
            <div className="ImportFinder-added-filter">
              <div className="ImportFinder-added-icon icon-folder-add" />
              <Filter
                className="box"
                value={addedFilter}
                onChange={this.changeAddedFilter}
                onClear={this.clearAddedFilter}
                placeholder="Filter paths"
              />
            </div>
            <div className="ImportFinder-added-files">
              {added.map(file => (
                <div
                  key={file.id}
                  className={classnames('ImportFinder-added-file', {
                    selected: selectedAddedFiles.has(file.id),
                  })}
                  onClick={e => this.selectAddedFile(file.id, e)}>
                  <div
                    className={
                      'ImportFinder-added-icon icon-' +
                      (file.childIds ? 'folder' : 'file-empty2')
                    }
                  />
                  {file.name}
                </div>
              ))}
              {!addedFiles.size && (
                <div className="ImportFinder-added-empty">
                  Select files and
                  <div
                    className="ImportFinder-added-empty-icon icon-arrow-down"
                    style={{ transform: 'rotate(-90deg)' }}
                  />
                  add to import
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ImportFinder-start">
          <div
            className={classnames('Import-button', { disabled })}
            onClick={
              !disabled &&
              (e => onImport([...addedFiles].map(id => files.get(id)), null, e))
            }>
            {title}
          </div>
        </div>
      </div>
    )
  }
}
