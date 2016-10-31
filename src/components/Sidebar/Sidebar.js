import React, { Component, PropTypes, Children, cloneElement } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'

import { iconifyLeftSidebar, iconifyRightSidebar } from '../../actions/appActions'

class Sidebar extends Component {
  static displayName () {
    return 'Sidebar'
  }

  static propTypes = {
    isRightEdge: PropTypes.bool,
    children: PropTypes.node,
    app: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  static get defaultProps () {
    return {
      isRightEdge: false
    }
  }

  handleClick () {
    const { app, isRightEdge, actions } = this.props
    const isIconified = isRightEdge ? app.rightSidebarIsIconified : app.leftSidebarIsIconified
    if (isRightEdge) {
      actions.iconifyRightSidebar(!isIconified)
    } else {
      actions.iconifyLeftSidebar(!isIconified)
    }
  }

  isIconified () {
    const { app, isRightEdge } = this.props
    return isRightEdge ? app.rightSidebarIsIconified : app.leftSidebarIsIconified
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.isIconified() === this.props.isRightEdge ? '\u25C0' : '\u25B6'
  }

  render () {
    const arrow = this.buttonChar()
    const isIconified = this.isIconified()
    return (
      <div className={classnames('sidebar flexCol fullHeight', { 'isOpen': !this.isIconified() })}>
        <div className={classnames('sidebar-button', { 'left': !this.props.isRightEdge })}>
          <label onClick={this.handleClick.bind(this)}>{arrow}{arrow}</label>
        </div>
        <div className={'sidebar-scroll fullheight'} >
          { Children.map(this.props.children, child => cloneElement(child, {isIconified})) }
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app
}), dispatch => ({
  actions: bindActionCreators({ iconifyLeftSidebar, iconifyRightSidebar }, dispatch)
}))(Sidebar)
