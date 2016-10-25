import React from 'react'
import { Link } from 'react-router'

import Logo from '../../components/Logo'
import Searchbar from '../../components/Searchbar'

const Header = () => (
  <nav className="header flexCenter fullWidth">
    <Link to="/" className='header-logo'><Logo/></Link>
    <Searchbar/>
    <div className="flexOn"></div>
    <div className="header-menu fullHeight flexCenter">
      <div id="header-menu-imports" className="header-menu-item">
        <span>Imports</span>
      </div>
      <div id="header-menu-layouts" className="header-menu-item">
        <span>Layouts</span>
        <span className='header-menu-icon icon-arrow-down'></span>
      </div>
      <div id="header-menu-exports" className="header-menu-item">
        <span>Exports</span>
        <span className='header-menu-icon icon-arrow-down'></span>
      </div>
      <div id="header-menu-admin" className="header-menu-item">
        <span>Admin</span>
        <span className='header-menu-icon icon-arrow-down'></span>
      </div>
      <div id="header-menu-help" className="header-menu-item">
        <span>Help</span>
        <span className='header-menu-icon icon-arrow-down'></span>
      </div>
      <div id="header-menu-signout" className="header-menu-item">
        <Link className="nav-link" to="/signout">Sign Out</Link>
      </div>
    </div>
  </nav>
)

export default Header
