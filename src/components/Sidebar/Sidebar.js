import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Folders from '../../components/Folders'
import Racetrack from '../../components/Racetrack'
import Metadata from '../../components/Metadata'

export default class Sidebar extends Component {
  static displayName () {
    return 'Sidebar'
  }

  static get propTypes () {
    return {
      isRightEdge: PropTypes.bool,
      children: PropTypes.node
    }
  }

  static get defaultProps () {
    return {
      isRightEdge: false
    }
  }

  constructor (props) {
    super(props)
    this.state = { open: true }
  }

  handleClick () {
    this.setState({ open: !this.state.open })
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.state.open !== this.props.isRightEdge ? '\u25C0' : '\u25B6'
  }

  buttonClassNames () {
    return classnames('sidebar-button', {
      'left': !this.props.isRightEdge
    })
  }

  sidebarClassNames () {
    return classnames('sidebar', {
      'open': this.state.open
    })
  }

  render () {
    const arrow = this.buttonChar()
    return (
      <div className={this.sidebarClassNames()}>
        <div className={this.buttonClassNames()}>
          <label onClick={this.handleClick.bind(this)}>{arrow}{arrow}</label>
        </div>
        {this.props.children}
      </div>
    )
  }
}

export const SidebarWithFolders = () =>
  <Sidebar>
    <Folders/>
    <Metadata/>
  </Sidebar>

export const SidebarWithRacetrack = () =>
  <Sidebar isRightEdge={true}>
    <Racetrack/>
  </Sidebar>
