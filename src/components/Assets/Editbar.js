import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from '../Folders/CreateExport'
import { exportAssets } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class Editbar extends Component {
  static propTypes = {
    children: PropTypes.node,

    selectedAssetIds: PropTypes.instanceOf(Set),
    isRemoveEnabled: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onDeselectAll: PropTypes.func.isRequired,

    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    query: PropTypes.instanceOf(AssetSearch),
    metadataFields: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.object
  }

  exportAssets = () => {
    const width = '460px'
    const body = <CreateExport onCreate={this.createExport} />
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportTable) => {
    const { selectedAssetIds, query, metadataFields } = this.props
    let search = query
    if (selectedAssetIds && selectedAssetIds.size) {
      search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [...selectedAssetIds]} }) })
    }
    const fields = exportTable && metadataFields
    this.props.actions.exportAssets(name, search, fields, exportImages)
  }

  render () {
    const { selectedAssetIds, isRemoveEnabled, onRemove, onDeselectAll, children } = this.props
    const nAssetsSelected = selectedAssetIds ? selectedAssetIds.size : 0
    const disabledSelected = !selectedAssetIds || !selectedAssetIds.size
    const removable = !disabledSelected && isRemoveEnabled()
    return (
      <div className="Editbar">
        {children}
        <div className="Editbar-right-side">
          <div className={classnames('Editbar-selected', {disabled: disabledSelected})}>
            {`${nAssetsSelected || 'no'} assets selected`}
            { nAssetsSelected ? (<div onClick={onDeselectAll} className={classnames('Editbar-cancel', 'icon-cancel-circle', {disabledSelected})}/>) : null }
          </div>
          <div onClick={!disabledSelected && this.exportAssets} className={classnames('Editbar-export', {disabled: disabledSelected})}>
            Export
            <span onClick={!disabledSelected && this.exportAssets} className="Editbar-icon-export" />
          </div>
          <div onClick={removable && onRemove} className={classnames('Editbar-remove', {disabled: !removable})}>
            Remove
            <span onClick={removable && onRemove} className={classnames('Editbar-icon-removeasset', {disabled: !removable})} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  query: state.assets.query,
  metadataFields: state.app.metadataFields
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    exportAssets
  }, dispatch)
}))(Editbar)
