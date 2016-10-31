import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import User from '../../models/User'
import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import { updateModal } from '../../actions/appActions'

class Header extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User).isRequired,
    actions: PropTypes.object.isRequired
  }

  dismissPreferences () {
    this.props.actions.updateModal({content: null})
  }

  showPreferences () {
    const { user, actions } = this.props
    actions.updateModal({
      title: 'Preferences',
      content: (<Preferences user={user}/>),
      footer: (<button onClick={this.dismissPreferences.bind(this)}>Close</button>)})
  }

  render () {
    const { user } = this.props
    return (
      <nav className="header flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo/></Link>
        <div className='header-searchbar flexOn'>
          <Searchbar/>
        </div>
        <div className="flexOn"></div>
        <div className="header-menu-bar fullHeight flexCenter">
          <div className="header-menu">
            <DropdownMenu label="Imports">
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label="Exports">
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label="Help">
              <a href="http://zorroa.com/docs/help" className="header-menu-item" >Help</a>
              <div className="header-menu-separator" />
              <a href="http://zorroa.com/docs/tutorials" className="header-menu-item" >Tutorials</a>
              <div className="header-menu-separator" />
              <a href="http://zorroa.com/docs/release-notes" className="header-menu-item" >Release Notes</a>
            </DropdownMenu>
          </div>
          <div className="header-menu">
            <DropdownMenu label={(<div><span className="icon-cog"/>&nbsp;{user.username}</div>)} rightAlign={true}>
              <div className="header-menu-item">
                <button onClick={this.showPreferences.bind(this)}>Preferences</button>
              </div>
              <div className="header-menu-separator" />
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
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({ updateModal }, dispatch)
}))(Header)
