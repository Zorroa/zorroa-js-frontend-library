import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import TrashedFolder from '../../models/TrashedFolder'
import CreateExport from '../Folders/CreateExport'
import SortingSelector from './SortingSelector'
import { selectAssetIds, sortAssets } from '../../actions/assetsAction'
import { removeAssetIdsFromFolderId } from '../../actions/folderAction'
import { exportAssets } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class Editbar extends Component {
  static propTypes = {
    selectedAssetIds: PropTypes.instanceOf(Set),
    selectedFolderIds: PropTypes.instanceOf(Set),
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    folders: PropTypes.instanceOf(Map),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    order: PropTypes.arrayOf(PropTypes.object),
    query: PropTypes.instanceOf(AssetSearch),
    tableFields: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.object
  }

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
  }

  sortAssets = (field, ascending) => {
    this.props.actions.sortAssets(field, ascending)
  }

  exportAssets = () => {
    const width = '460px'
    const body = <CreateExport onCreate={this.createExport} />
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedAssetIds, query, tableFields } = this.props
    let search = query
    if (selectedAssetIds && selectedAssetIds.size) {
      search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [...selectedAssetIds]} }) })
    }
    const fields = exportTable && tableFields
    this.props.actions.exportAssets(name, search, fields, exportImages)
  }

  removeSelected = () => {
    const { selectedAssetIds, selectedFolderIds, actions } = this.props
    selectedFolderIds.forEach(folderId => {
      actions.removeAssetIdsFromFolderId(selectedAssetIds, folderId)
    })
  }

  containsSelected () {
    const { selectedAssetIds, selectedFolderIds, folders, assets } = this.props
    if (!selectedAssetIds || !selectedAssetIds.size || !selectedFolderIds || !selectedFolderIds.size) return false
    const simpleFolderIds = []
    for (let id of selectedFolderIds) {
      const folder = folders.get(id)
      if (folder && !folder.isDyhi() && !folder.search) {
        simpleFolderIds.push(folder.id)
      }
    }
    for (const assetId of selectedAssetIds) {
      const index = assets.findIndex(asset => (asset.id === assetId))
      if (index < 0) continue
      const asset = assets[index]
      if (asset.memberOfAnyFolderIds(simpleFolderIds)) return true
    }
    return false
  }

  render () {
    const { selectedAssetIds, trashedFolders, order } = this.props
    let selectedFolderIds = this.props.selectedFolderIds
    if (trashedFolders && trashedFolders.length) {
      // Server does not support editing of trashed folders
      selectedFolderIds = new Set()
      this.props.selectedFolderIds.forEach(id => {
        const index = trashedFolders.findIndex(trashedFolder => (trashedFolder.folderId === id))
        if (index < 0) selectedFolderIds.add(id)
      })
    }
    const nAssetsSelected = selectedAssetIds ? selectedAssetIds.size : 0
    const disabledSelected = !selectedAssetIds || !selectedAssetIds.size
    const removable = !disabledSelected && this.containsSelected()
    return (
      <div className="Editbar">
        <SortingSelector sortAssets={this.props.actions.sortAssets} order={order}/>
        <div className="Editbar-right-side">
          <div className={classnames('Editbar-selected', {disabled: disabledSelected})}>
            {`${nAssetsSelected || 'no'} assets selected`}
            { nAssetsSelected ? (<div onClick={this.deselectAll} className={classnames('Editbar-cancel', 'icon-cancel-circle', {disabledSelected})}/>) : null }
          </div>
          <div onClick={this.exportAssets} className={classnames('Editbar-export', {disabled: disabledSelected})}>
            Export
            <span onClick={this.exportSelected} className="Editbar-icon-export" />
          </div>
          <div onClick={this.removeSelected} className={classnames('Editbar-remove', {disabled: !removable})}>
            Remove
            <span onClick={this.removeSelected} className={classnames('Editbar-icon-removeasset', {disabled: !removable})} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  selectedAssetIds: state.assets.selectedIds,
  trashedFolders: state.folders.trashedFolders,
  selectedFolderIds: state.folders.selectedFolderIds,
  folders: state.folders.all,
  assets: state.assets.all,
  order: state.assets.order,
  query: state.assets.query,
  tableFields: state.app.tableFields
}), dispatch => ({
  actions: bindActionCreators({
    selectAssetIds,
    removeAssetIdsFromFolderId,
    sortAssets,
    showModal,
    exportAssets
  }, dispatch)
}))(Editbar)
