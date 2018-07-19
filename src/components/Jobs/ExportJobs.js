import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import User from '../../models/User'
import Job from '../../models/Job'
import Jobs from './Jobs'
import FieldList from '../../models/FieldList'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { exportAssets, getJob } from '../../actions/jobActions'
import { showModal, dialogAlertPromise } from '../../actions/appActions'
import { updateExportInterface } from '../../actions/exportsAction'

class ExportJobs extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    selectedAssetIds: PropTypes.instanceOf(Set),
    query: PropTypes.instanceOf(AssetSearch),
    selectedTableLayoutId: PropTypes.string,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    actions: PropTypes.object,
    jobs: PropTypes.object,
  }

  exportAssets = () => {
    if (this.areExportsDisabled()) {
      return
    }

    const { selectedAssetIds, query } = this.props
    let assetSearch = query
    if (selectedAssetIds && selectedAssetIds.size) {
      assetSearch = new AssetSearch({
        filter: new AssetFilter({ terms: { _id: [...selectedAssetIds] } }),
      })
    }

    this.props.actions.updateExportInterface({
      packageName: '',
      assetSearch,
      permissionIds: this.props.user.permissions.map(
        permission => permission.id,
      ),
    })
  }

  areExportsDisabled() {
    const { selectedAssetIds } = this.props
    const disabled = !selectedAssetIds || selectedAssetIds.size === 0
    return disabled
  }

  render() {
    const addButton = (
      <div
        className={classnames('Jobs-controls-add', {
          disabled: this.areExportsDisabled(),
        })}
        title={`Export selected assets`}
        onClick={this.exportAssets}>
        <div className="icon-export" />
        <div className="Jobs-controls-add-label">EXPORT</div>
      </div>
    )
    return <Jobs jobType={Job.Export} addButton={addButton} />
  }
}

export default connect(
  state => ({
    query: state.assets.query,
    selectedAssetIds: state.assets.selectedIds,
    selectedTableLayoutId: state.app.selectedTableLayoutId,
    tableLayouts: state.app.tableLayouts,
    user: state.auth.user,
    jobs: state.jobs.all,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        updateExportInterface,
        showModal,
        exportAssets,
        getJob,
        dialogAlertPromise,
      },
      dispatch,
    ),
  }),
)(ExportJobs)
