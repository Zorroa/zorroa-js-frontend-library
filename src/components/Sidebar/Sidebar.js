import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="Sidebar">
      <NavLink className="Sidebar__link" to="/">
        Home
      </NavLink>
      <NavLink
        activeClassName="Sidebar__link--active"
        className="Sidebar__link"
        to="/form">
        Form
      </NavLink>
      <NavLink
        activeClassName="Sidebar__link--active"
        className="Sidebar__link"
        to="/paragraph">
        Paragraph
      </NavLink>
    </div>
  )
}
