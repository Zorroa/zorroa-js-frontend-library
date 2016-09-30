import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

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
      return <li className="nav-item">
        <Link className="nav-link" to="/signout">Sign Out</Link>
      </li>
    }
    return [
      <li className="nav-item" key={1}>
        <Link className="nav-link" to="/signin">Sign In</Link>
      </li>,
      <li className="nav-item" key={2}>
        <Link className="nav-link" to="/signup">Sign Up</Link>
      </li>
    ]
  }

  render () {
    return (
      <nav className="navbar navbar-light">
        <Link to="/" className="navbar-brand">Zorroa</Link>
        <ul className="nav navbar-nav">
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
