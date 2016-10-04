import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'

class Header extends Component {
  static propTypes () {
    return {
      authenticated: PropTypes.boolean.isRequired
    }
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  renderLinks () {
    if (this.props.authenticated) {
      return (
        <li className="header-menu-item">
          <Link className="nav-link" to="/signout">Sign Out</Link>
        </li>
      )
    }
    return [
      <li className="header-menu-item" key={1}>
        <Link className="nav-link" to="/signin">Sign In</Link>
      </li>,
      <li className="header-menu-item" key={2}>
        <Link className="nav-link" to="/signup">Sign Up</Link>
      </li>
    ]
  }

  render () {
    return (
      <nav className="header">
        <div className="header-logo-search">
          <Link to="/" className="header-logo"><Logo/></Link>
          <Searchbar/>
        </div>
        <ul className="header-menu">
          {this.renderLinks()}
        </ul>
      </nav>
    )
  }
}

function mapStateToProps (state) {
  return {
    authenticated: state.auth.authenticated
  }
}

export default connect(mapStateToProps)(Header)
