import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import domUtils from '../../services/domUtils'

export default class Modal extends Component {
  static get propTypes () {
    return {
      children: PropTypes.node,
      content: PropTypes.string,
      footer: PropTypes.node,
      dismiss: PropTypes.func,
      title: PropTypes.string
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.content) {
      domUtils.disableScroll()
    } else {
      domUtils.enableScroll()
    }
  }

  render () {
    if (!this.props.content && !this.props.children) {
      return null
    }

    const {dismiss, title, content, children, footer} = this.props

    return (
      <div className="modal-container">
        <ReactCSSTransitionGroup
          transitionName="modal"
          transitionAppear={true}
          transitionEnterTimeout={500}
          transitionAppearTimeout={500}
          transitionLeaveTimeout={300}
          component="div"
        >
          <div className="modal" key="modal">
            <header className="modal-header">{title}</header>
            <div className="modal-body">{children}{content}</div>
            <footer className="modal-footer">{footer}</footer>
            <button className="modal-dismiss" onClick={dismiss}><div>X</div></button>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
