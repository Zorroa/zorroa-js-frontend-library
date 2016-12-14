import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Job from '../../models/Job'
import User from '../../models/User'
import AssetSearch from '../../models/AssetSearch'
import JobMenu from './JobMenu'
import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import { showModal } from '../../actions/appActions'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    actions: PropTypes.object.isRequired
  }

  showPreferences () {
    const { user, actions } = this.props
    const width = '460px'
    const body = <Preferences user={user}/>
    actions.showModal({body, width})
  }

  render () {
    const { user } = this.props
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
              <a href="http://zorroa.com/docs/help" target="_blank" className="header-menu-item" >Help</a>
              <a href="http://zorroa.com/docs/tutorials" target="_blank" className="header-menu-item" >Tutorials</a>
              <a href="http://zorroa.com/docs/release-notes" target="_blank" className="header-menu-item" >Release Notes</a>
            </DropdownMenu>
          </div>
          <div className="header-menu header-menu-user icon-zorroa-person-06">
            <DropdownMenu label={(<div>{user.username}</div>)}>
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
  selectedAssetIds: state.assets && state.assets.selectedIds,
  totalCount: state.assets && state.assets.totalCount,
  query: state.assets && state.assets.query
}), dispatch => ({
  actions: bindActionCreators({ showModal }, dispatch)
}))(Header)
