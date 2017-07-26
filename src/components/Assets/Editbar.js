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
import { similar } from '../../actions/racetrackAction'
import { weights } from '../Racetrack/SimilarHash'
import { equalSets } from '../../services/jsUtil'

class Editbar extends Component {
  static propTypes = {
    children: PropTypes.node,

    selectedAssetIds: PropTypes.instanceOf(Set),
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ofsIds: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    similarAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string,
    isRemoveEnabled: PropTypes.func,
    onRemove: PropTypes.func,
    onDeselectAll: PropTypes.func.isRequired,

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

  sortSimilar = () => {
    const { actions, selectedAssetIds, similarAssets } = this.props
    if (!selectedAssetIds || !selectedAssetIds.size) return
    const selectedAssets = [...selectedAssetIds].map(id => (similarAssets.find(asset => (asset.id === id)))).filter(asset => asset)
    const values = selectedAssets.map(asset => asset.rawValue(this.props.similar.field))
    const ofsIds = selectedAssets.map(asset => asset.closestProxy(256, 256).id)
    const similar = { values, ofsIds, weights: weights(ofsIds) }
    actions.similar(similar)
  }

  render () {
    const { selectedAssetIds, isRemoveEnabled, onRemove, onDeselectAll, similar, similarAssets, isolatedId } = this.props
    const nAssetsSelected = selectedAssetIds ? selectedAssetIds.size : 0
    const disabledSelected = !selectedAssetIds || !selectedAssetIds.size
    const removable = !disabledSelected && isRemoveEnabled && isRemoveEnabled()
    const selectedAssets = nAssetsSelected && [...selectedAssetIds].map(id => (similarAssets.find(asset => (asset.id === id)))).filter(asset => asset)
    const similarHashes = selectedAssets && selectedAssets.map(asset => asset.rawValue(this.props.similar.field))
    const similarActive = similar.field && similar.field.length > 0 && similar.values && similar.values.length > 0
    const similarValuesSelected = similarActive && similar.values && similarHashes && equalSets(new Set([...similar.values]), new Set([...similarHashes]))

    // Only enable similar button if selected assets have the right hash
    const canSortSimilar = selectedAssetIds && selectedAssetIds.size > 0 && similar.field && similar.field.length > 0 && !similarValuesSelected
    const sortSimilar = canSortSimilar ? this.sortSimilar : null
    return (
      <div className="Editbar">
        <div className={classnames('Editbar-selected', {disabled: disabledSelected})}>
          { nAssetsSelected ? `${nAssetsSelected} assets selected` : '' }
          { nAssetsSelected ? (<div onClick={onDeselectAll} className={classnames('Editbar-cancel', 'icon-cancel-circle', {disabledSelected})}/>) : null }
        </div>
        { !isolatedId && (
          <div className="Editbar-similar-section">
            <div className={classnames('Editbar-similar', { 'selected': similarActive, 'disabled': !canSortSimilar })}
                 onClick={sortSimilar} title="Find similar assets">
              <span className="icon-similarity"/>
              Similar
            </div>
          </div>
        )}
        <div onClick={!disabledSelected && this.exportAssets} className={classnames('Editbar-export', {disabled: disabledSelected})}>
          <span onClick={!disabledSelected && this.exportAssets} className="icon-export" />
          Export
        </div>
        { onRemove &&
        <div onClick={removable && onRemove} className={classnames('Editbar-remove', {disabled: !removable})}>
          <span onClick={removable && onRemove} className={classnames('icon-removeasset', {disabled: !removable})} />
          Remove
        </div> }
      </div>
    )
  }
}

export default connect(state => ({
  query: state.assets.query,
  metadataFields: state.app.metadataFields,
  similar: state.racetrack.similar,
  similarAssets: state.assets.similar,
  isolatedId: state.assets.isolatedId
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    similar,
    exportAssets
  }, dispatch)
}))(Editbar)
