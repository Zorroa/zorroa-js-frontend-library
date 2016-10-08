import React from 'react'
import { Link } from 'react-router'

import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'

const Header = () => (
  <nav className="header">
    <div className="header-logo-search">
      <Link to="/" className="header-logo"><Logo/></Link>
      <Searchbar/>
    </div>
    <ul className="header-menu">
      <li className="header-menu-item">
        <Link className="nav-link" to="/signout">Sign Out</Link>
      </li>
    </ul>
  </nav>
)

export default Header
