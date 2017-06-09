import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classnames from 'classnames'

import Job from '../../models/Job'
import User from '../../models/User'
import Asset from '../../models/Asset'
import JobMenu from './JobMenu'
import Logo from '../../components/Logo'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import Feedback from '../../components/Feedback'
import Developer from '../../components/Developer'
import TableToggle from '../Assets/TableToggle'
import { showModal, showTable } from '../../actions/appActions'
import { archivistBaseURL, saveUserSettings } from '../../actions/authAction'
import { similar } from '../../actions/racetrackAction'
import { weights } from '../Racetrack/SimilarHash'
import { equalSets } from '../../services/jsUtil'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    isDeveloper: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    selectedIds: PropTypes.object,
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      assetIds: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    similarAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
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

  sortSimilar = () => {
    const { similarAssets, actions } = this.props
    const values = similarAssets.map(asset => asset.rawValue(this.props.similar.field))
    const assetIds = similarAssets.map(asset => asset.id)
    const similar = { values, assetIds, weights: weights(assetIds) }
    actions.similar(similar)
    console.log('Sort by similar: ' + JSON.stringify(similar))
  }

  render () {
    const { user, isDeveloper, isAdministrator, showTable, similar, similarAssets, selectedIds } = this.props
    const baseURL = archivistBaseURL()
    const similarHashes = similarAssets.map(asset => asset.rawValue(this.props.similar.field))
    const similarActive = similar.field && similar.field.length > 0 && similar.values && similar.values.length > 0
    const similarValuesSelected = similar.values && similarHashes && equalSets(new Set([...similar.values]), new Set([...similarHashes]))

    // Only enable similar button if selected assets have the right hash
    const canSortSimilar = selectedIds && selectedIds.size > 0 && similar.field && similar.field.length > 0 && !similarValuesSelected && similarHashes && similarHashes.length > 0
    const sortSimilar = canSortSimilar ? this.sortSimilar : null

    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo/></Link>
        <div className="header-buttons">
          <TableToggle enabled={showTable} onClick={this.toggleShowTable} />
          <div className={classnames('header-button', 'icon-similarity',
            { 'selected': similarActive, 'disabled': !canSortSimilar })}
               onClick={sortSimilar} title="Find similar assets"/>
        </div>
        <div className="flexOn"></div>
        <div className="header-menu-bar fullHeight flexCenter">
          <JobMenu jobType={Job.Import}/>
          <JobMenu jobType={Job.Export}/>
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
  selectedIds: state.assets.selectedIds,
  similar: state.racetrack.similar,
  similarAssets: state.assets.similar,
  showTable: state.app.showTable,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    similar,
    showTable,
    saveUserSettings
  }, dispatch)
}))(Header)
