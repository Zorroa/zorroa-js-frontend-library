import React, { Component, PropTypes, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import setSidebarOpen from '../../actions/sidebarAction'

class Sidebar extends Component {
  static get displayName () {
    return 'Sidebar'
  }

  static get propTypes () {
    return {
      actions: PropTypes.object.isRequired,
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

  isOpen () {
    const sidebarState = this.props.sidebar
    const sidebarKey = this.props.sidebarKey
    return sidebarState[sidebarKey].open
  }

  // constructor (props) {
  //   super(props)
  // }

  toggleOpenClosed () {
    this.props.actions.setSidebarOpen(this.props.sidebarKey, !this.isOpen())
  }

  openWhenClosed () {
    if (!this.isOpen()) {
      this.props.actions.setSidebarOpen(this.props.sidebarKey, true)
    }
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.isOpen() !== this.props.isRightEdge ? '\u25C0' : '\u25B6'
  }

  buttonClassNames () {
    return classnames('sidebar-button', {
      'left': !this.props.isRightEdge
    })
  }

  sidebarClassNames () {
    return classnames('sidebar', {
      'open': this.isOpen()
    })
  }

  render () {
    const arrow = this.buttonChar()
    return (
      <div className={this.sidebarClassNames()}>
        <div className={this.buttonClassNames()}>
          <label onClick={this.toggleOpenClosed.bind(this)}>{arrow}{arrow}</label>
        </div>
        <div onClick={this.openWhenClosed.bind(this)}>
          {
            React.Children.map(this.props.children,
              child => cloneElement(child, { sidebarIsOpen: this.isOpen() }))
          }
        </div>
      </div>
    )
  }
}

// ----------------------------------------------------------------------

function mapStateToProps (state) {
  // whatever is returned will show up as props
  // inside of Component
  return { sidebar: state.sidebar }
}

// Anything returned from this func will end up as props
// on the Component container
function mapDispatchToProps (dispatch) {
  // When action is called, the result should
  // be passed to all our reducers
  return {
    actions: bindActionCreators({setSidebarOpen}, dispatch)
  }
}

// Promote Component from a component to a container-
// it needs to know about this new dispatch method.
// Make it available as a prop.
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
