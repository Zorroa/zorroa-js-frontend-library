import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Job from '../../models/Job'
import Jobs from './Jobs'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from '../Folders/CreateExport'
import { exportAssets } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class ExportJobs extends Component {
  static propTypes = {
    selectedAssetIds: PropTypes.instanceOf(Set),
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
    const { selectedAssetIds } = this.props
    const disabled = !selectedAssetIds || !selectedAssetIds.size
    const addButton = (
      <div className={classnames('Jobs-controls-add', {disabled})}
           title={`Export selected assets`} onClick={this.exportAssets}>
        <div className="icon-export"/>
        <div className="Jobs-controls-add-label">EXPORT</div>
      </div>
    )
    return (
      <Jobs jobType={Job.Export} addButton={addButton}/>
    )
  }
}

export default connect(state => ({
  query: state.assets.query,
  selectedAssetIds: state.assets.selectedIds,
  metadataFields: state.app.metadataFields
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    exportAssets
  }, dispatch)
}))(ExportJobs)
