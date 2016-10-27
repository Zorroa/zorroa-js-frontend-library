import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { setSidebarFoldersOpen, setSidebarRacetrackOpen } from '../../actions/sidebarAction'

import Folders from '../../components/Folders'
import Racetrack from '../../components/Racetrack'
import Metadata from '../../components/Metadata'

class Sidebar extends Component {
  static get displayName () {
    return 'Sidebar'
  }

  static get propTypes () {
    return {
      isRightEdge: PropTypes.bool,
      children: PropTypes.node,
      sidebarKey: PropTypes.string.isRequired,
      sidebar: PropTypes.object.isRequired
    }
  }

  static get defaultProps () {
    return {
      isRightEdge: false
    }
  }

  constructor (props) {
    super(props)
    // this.state = { open: true }
  }

  handleClick () {
    // this.setState({ open: !this.state.open })

    debugger
    const sidebarState = this.props.sidebar
    const sidebarKey = this.props.sidebarKey
    const open = sidebarState[sidebarKey].open
    setSidebarFoldersOpen(!open)
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    // return this.state.open !== this.props.isRightEdge ? '\u25C0' : '\u25B6'
    return '\u25C0'
  }

  buttonClassNames () {
    return classnames('sidebar-button', {
      'left': !this.props.isRightEdge
    })
  }

  sidebarClassNames () {
    return classnames('sidebar', {
      'open': true//this.state.open
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

const SidebarWithFoldersFn = () =>
  <Sidebar sidebarKey={'folders'}>
    <Folders/>
    <Metadata/>
  </Sidebar>

const SidebarWithRacetrackFn = () =>
  <Sidebar sidebarKey={'racetrack'} isRightEdge={true}>
    <Racetrack/>
  </Sidebar>

//----------------------------------------------------------------------

function mapStateToProps(state) {
  // whatever is returned will show up as props
  // inside of Component
  return { sidebar: state.sidebar }
}

// Anything returned from this func will end up as props
// on the Component container
function mapDispatchToProps(dispatch) {
  // When action is called, the result should
  // be passed to all our reducers
  return bindActionCreators({setSidebarFoldersOpen, setSidebarRacetrackOpen}, dispatch);
}

// Promote Component from a component to a container-
// it needs to know about this new dispatch method.
// Make it available as a prop.
const a = connect(mapStateToProps, mapDispatchToProps)(Sidebar)
const SidebarWithFolders = connect(mapStateToProps, mapDispatchToProps)(SidebarWithFoldersFn)
const SidebarWithRacetrack = connect(mapStateToProps, mapDispatchToProps)(SidebarWithRacetrackFn)
export { a as default, SidebarWithFolders, SidebarWithRacetrack }

