import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class Modal extends Component {
  static propTypes = {
    body: PropTypes.node,
    width: PropTypes.node
  }

  static defaultProps = { width: '75%' }

  render () {
    const {body, width} = this.props
    if (!body) return null
    return (
      <div className="modal-container">
        <ReactCSSTransitionGroup
          transitionName="modal"
          transitionAppear={true}
          transitionEnterTimeout={500}
          transitionAppearTimeout={500}
          transitionLeaveTimeout={300}
          component="div" >
          <div className="modal" key="modal" style={{width}}>
            <div className="modal-body">{body}</div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
