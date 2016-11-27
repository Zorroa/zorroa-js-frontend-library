import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from '../Folders/CreateExport'
import { selectAssetIds } from '../../actions/assetsAction'
import { removeAssetIdsFromFolderId } from '../../actions/folderAction'
import { exportAssets } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

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

  exportAssets = () => {
    const width = '340px'
    const body = <CreateExport onCreate={this.createExport} />
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportMetadata) => {
    const { selectedAssetIds, query } = this.props
    let search = query
    if (selectedAssetIds && selectedAssetIds.size) {
      search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [...selectedAssetIds]} }) })
    }
    this.props.actions.exportAssets(name, search)
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
          <div onClick={this.exportAssets} className="export">
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
    removeAssetIdsFromFolderId,
    showModal,
    exportAssets
  }, dispatch)
}))(Editbar)
