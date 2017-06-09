import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Job from '../../models/Job'
import User from '../../models/User'
import Asset from '../../models/Asset'
import JobMenu from './JobMenu'
import Logo from '../../components/Logo'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import Feedback from '../../components/Feedback'
import Developer from '../../components/Developer'
import Editbar from '../Assets/Editbar'
import TableToggle from '../Assets/TableToggle'
import AssetCounter from '../Assets/AssetCounter'
import { showModal, showTable } from '../../actions/appActions'
import { archivistBaseURL, saveUserSettings } from '../../actions/authAction'
import { selectAssetIds } from '../../actions/assetsAction'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    isDeveloper: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    totalCount: PropTypes.number,
    showTable: PropTypes.bool.isRequired,
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  showPreferences = () => {
    const { user, actions } = this.props
    const width = '480px'
    const body = <Preferences user={user}/>
    actions.showModal({body, width})
  }

  showFeedback = () => {
    const { user, actions } = this.props
    const width = '460px'
    const body = <Feedback user={user}/>
    actions.showModal({body, width})
  }

  showDeveloper = () => {
    const width = '800px'
    const body = <Developer/>
    this.props.actions.showModal({body, width})
  }

  toggleShowTable = () => {
    const { showTable, user, userSettings, actions } = this.props
    actions.showTable(!showTable)
    actions.saveUserSettings(user, { ...userSettings, showTable: !showTable })
  }

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
  }

  render () {
    const { user, isDeveloper, isAdministrator, assets, totalCount, showTable, selectedIds } = this.props
    const baseURL = archivistBaseURL()

    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo/></Link>
        <AssetCounter total={totalCount} collapsed={0} loaded={assets && assets.length || 0}/>
        <div className="header-table-spacer"/>
        <TableToggle enabled={showTable} onClick={this.toggleShowTable} />
        <div className="flexOn"></div>
        <div className="header-menu-bar fullHeight flexCenter">
          <Editbar selectedAssetIds={selectedIds} onDeselectAll={this.deselectAll} />
          <JobMenu jobType={Job.Export}/>
          <JobMenu jobType={Job.Import}/>
          <div className="header-menu">
            <DropdownMenu label="Help">
              <a href="https://zorroa.com/help-center/" target="_blank" className="header-menu-item" >Tutorials</a>
              <a href="https://zorroa.com/help-center/faqs" target="_blank" className="header-menu-item" >FAQ</a>
              <a href="https://zorroa.com/help-center/release-notes/" target="_blank" className="header-menu-item" >Release Notes</a>
              <div className="header-menu-item header-menu-feedback" onClick={this.showFeedback}>
                Send Feedback
              </div>
            </DropdownMenu>
          </div>
          <div className="header-menu header-menu-user icon-zorroa-person-06">
            <DropdownMenu label={(<div>{user.username}</div>)}>
              <div className="header-menu-item header-menu-prefs" onClick={this.showPreferences}>
                Preferences...
              </div>
              { isDeveloper && (
                <div className="header-menu-item header-menu-dev" onClick={this.showDeveloper}>
                  Developer...
                </div>
              )}
              { isAdministrator && baseURL && (
                <a href={`${baseURL}/gui`} target="_blank" className="header-menu-item header-menu-admin">
                  Administrator...
                </a>
              )}
              <Link className="header-menu-item header-menu-logout" to="/signout">Logout</Link>
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
  isDeveloper: state.auth.isDeveloper,
  isAdministrator: state.auth.isAdministrator,
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds,
  totalCount: state.assets.totalCount,
  showTable: state.app.showTable,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    showTable,
    selectAssetIds,
    saveUserSettings
  }, dispatch)
}))(Header)
