import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class Modal extends Component {
  static get displayName () {
    return 'Modal'
  }

  static propTypes () {
    return {
      children: PropTypes.node,
      content: PropTypes.string,
      footer: PropTypes.string,
      dismiss: PropTypes.func.isRequired,
      size: PropTypes.number,
      title: PropTypes.string
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.content) {
      // disable dom scroll
    } else {
      // enable dom scroll
    }

    return nextProps
  }

  render () {
    if (!this.props.content && !this.props.children) {
      return null
    }

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
            <header className="modal-header">
              {this.props.title ? this.props.title : null}
            </header>
            <div className="modal-body">
              {this.props.children ? this.props.children : null}
              {this.props.content ? this.props.content : null}
            </div>
            <footer className="modal-footer">{this.props.footer}</footer>
            <button className="modal-dismiss" onClick={this.props.dismiss}><div>X</div></button>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
