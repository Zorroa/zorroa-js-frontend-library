import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import AssetSearch from '../../models/AssetSearch'
import { selectAssetIds } from '../../actions/assetsAction'
import { removeAssetIdsFromFolderId } from '../../actions/folderAction'

class Editbar extends Component {
  static propTypes = {
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectedFolderIds: PropTypes.instanceOf(Set),
    folders: PropTypes.instanceOf(Map),
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object
  }

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
  }

  exportSelected = () => {
    const { selectedAssetIds, selectedFolderIds } = this.props
    if (selectedAssetIds && selectedAssetIds.size) {
      console.log('Export ' + JSON.stringify([...selectedAssetIds]))
    } else {
      console.log('Export all folders ' + JSON.stringify([...selectedFolderIds]))
    }
  }

  removeSelected = () => {
    const { selectedAssetIds, selectedFolderIds, actions } = this.props
    selectedFolderIds.forEach(folderId => {
      actions.removeAssetIdsFromFolderId(selectedAssetIds, folderId)
    })
  }

  isSimpleCollectionSelected () {
    const { selectedFolderIds, folders } = this.props
    for (let id of selectedFolderIds) {
      const folder = folders.get(id)
      if (folder && !folder.isDyhi() && !folder.search) {
        return true
      }
    }
    return false
  }

  render () {
    const { selectedAssetIds, selectedFolderIds } = this.props
    if ((!selectedFolderIds || !selectedFolderIds.size) &&
      (!selectedAssetIds || !selectedAssetIds.size)) {
      return (<div className="Editbar"/>)
    }
    let title = 'Selected assets'
    const isSimpleCollectionSelected = this.isSimpleCollectionSelected()
    if (selectedFolderIds && selectedFolderIds.size) {
      if (isSimpleCollectionSelected) {
        const plural = selectedFolderIds.size > 1
        title = 'Assets included in collection' + (plural ? 's' : '')
      } else {
        title = 'Browsing assets'
      }
    }
    const disabled = !selectedAssetIds || !selectedAssetIds.size
    return (
      <div className="Editbar">
        <div className="title">{title}</div>
        <div className="right-side">
            {selectedAssetIds && selectedAssetIds.size && (
              <div className={classnames('selected', {disabled})}>
                {`${selectedAssetIds.size} assets selected`}
                <span onClick={this.deselectAll} className={classnames('icon-cancel-circle', {disabled})} />
              </div>
              )}
          <div onClick={this.exportSelected} className="export">
            { disabled ? 'Export All' : 'Export' }
            <span onClick={this.exportSelected} className="icon-download2" />
          </div>
          { isSimpleCollectionSelected && (
            <div onClick={this.removeSelected} className={classnames('remove', {disabled})}>
              Remove
              <span onClick={this.removeSelected} className={classnames('icon-trash2', {disabled})} />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  selectedAssetIds: state.assets.selectedIds,
  selectedFolderIds: state.folders.selectedFolderIds,
  folders: state.folders.all,
  query: state.assets.query
}), dispatch => ({
  actions: bindActionCreators({
    selectAssetIds,
    removeAssetIdsFromFolderId
  }, dispatch)
}))(Editbar)
