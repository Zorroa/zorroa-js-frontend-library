import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classnames from 'classnames'

import Job, { JobFilter } from '../../models/Job'
import User from '../../models/User'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import CreateExport from '../Folders/CreateExport'
import { getJobs, exportAssets } from '../../actions/jobActions'
import { showModal } from '../../actions/appActions'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    activeExports: PropTypes.arrayOf(PropTypes.instanceOf(Job)),
    finishedExports: PropTypes.arrayOf(PropTypes.instanceOf(Job)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    totalCount: PropTypes.number,
    query: PropTypes.instanceOf(AssetSearch),
    protocol: PropTypes.string,
    host: PropTypes.string,
    actions: PropTypes.object.isRequired
  }

  showPreferences () {
    const { user, actions } = this.props
    const width = '340px'
    const body = <Preferences user={user}/>
    actions.showModal({body, width})
  }

  cancelJob (event, job) {
    this.props.actions.cancelJobId(job.id)
  }

  restartJob (event, job) {
    this.props.actions.restartJobId(job.id)
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

  refreshExports = (event, isVisible) => {
    if (!isVisible) return
    const type = JobFilter.Export
    const userId = this.props.user && this.props.user.id
    const activeFilter = new JobFilter({ state: Job.Active, type, userId })
    this.props.actions.getJobs(activeFilter, 0, 5)
    const finishedFilter = new JobFilter({ state: Job.Finished, type, userId })
    this.props.actions.getJobs(finishedFilter, 0, 5)
  }

  render () {
    const { user, activeExports, finishedExports, selectedAssetIds, totalCount, protocol, host } = this.props
    const assetCount = selectedAssetIds && selectedAssetIds.size ? selectedAssetIds.size : totalCount
    const exportEnabled = assetCount > 0 && assetCount <= Job.MaxAssets
    let exportTitle = selectedAssetIds && selectedAssetIds.size ? `Export ${assetCount} Selected Asset` : `Export ${assetCount} Asset`
    if (assetCount > 1) exportTitle += 's'
    if (!exportEnabled) {
      exportTitle = assetCount > Job.MaxAssets ? 'Export Fewer Assets' : 'Export Assets'
    }
    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo/></Link>
        <div className='header-searchbar flexOn'>
          <Searchbar/>
        </div>
        <div className="flexOn"></div>
        <div className="header-menu-bar fullHeight flexCenter">
          <div className="header-menu">
            <DropdownMenu label="Imports">
              Imports
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label="Exports" onChange={this.refreshExports}>
              <div onClick={this.exportAssets} className={classnames('export', 'icon-plus-square', {disabled: !exportEnabled})}>
                <div>{exportTitle}</div>
              </div>
              {
                activeExports && activeExports.length ? activeExports.map(job => (
                  <div key={job.id} onClick={this.cancelJob.bind(this, job)} className={classnames('header-menu-item', 'icon-cancel-circle', {disabled: !exportEnabled})}>
                    <div className="flexOn">{job.name}</div>
                    <div className="job-state">{job.state}</div>
                  </div>
                )) : <div className="header-menu-item disabled icon-cancel-circle"><div className="title flexOn">No Active Exports</div></div>
              }
              {
                finishedExports && finishedExports.length ? finishedExports.map(job => (
                  <a key={job.id} className="header-menu-item icon-download2" href={job.exportStream(protocol, host)} download={job.name}>
                    <div className="flexOn">{job.name}</div>
                    <div className="job-state">{job.state}</div>
                  </a>
                )) : <div className="header-menu-item disabled">No Finished Exports</div>
              }
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label="Help">
              <a href="http://zorroa.com/docs/help" target="_blank" className="header-menu-item" >Help</a>
              <a href="http://zorroa.com/docs/tutorials" target="_blank" className="header-menu-item" >Tutorials</a>
              <a href="http://zorroa.com/docs/release-notes" target="_blank" className="header-menu-item" >Release Notes</a>
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label={(<div>{user.username}</div>)} rightAlign={true}>
              <div className="header-menu-item" onClick={this.showPreferences.bind(this)}>
                Preferences
              </div>
              <Link className="header-menu-item" to="/signout">Logout</Link>
            </DropdownMenu>
          </div>
        </div>

        {/* this is stupid/ugly, but neede to keep sidebar & header logo widths in sync */}
        <div className='header-padding' style={{width: '22px'}}></div>
      </nav>
    )
  }
}

export default connect(state => ({
  user: state.auth.user,
  activeExports: state.jobs && state.jobs.activeExports,
  finishedExports: state.jobs && state.jobs.finishedExports,
  selectedAssetIds: state.assets && state.assets.selectedIds,
  totalCount: state.assets && state.assets.totalCount,
  query: state.assets && state.assets.query,
  protocol: state.auth && state.auth.protocol,
  host: state.auth && state.auth.host
}), dispatch => ({
  actions: bindActionCreators({ getJobs, exportAssets, showModal }, dispatch)
}))(Header)
