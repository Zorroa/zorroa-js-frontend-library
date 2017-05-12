import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Job from '../../models/Job'
import User from '../../models/User'
import JobMenu from './JobMenu'
import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import Feedback from '../../components/Feedback'
import Developer from '../../components/Developer'
import { showModal } from '../../actions/appActions'
import { archivistBaseURL } from '../../actions/authAction'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    isDeveloper: PropTypes.bool,
    isAdministrator: PropTypes.bool,
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

  render () {
    const { user, isDeveloper, isAdministrator } = this.props
    const baseURL = archivistBaseURL()
    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo/></Link>
        <div className='header-searchbar flexOn'>
          <Searchbar/>
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
  isAdministrator: state.auth.isAdministrator
}), dispatch => ({
  actions: bindActionCreators({ showModal }, dispatch)
}))(Header)
