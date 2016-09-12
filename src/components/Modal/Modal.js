import React, { Component, PropTypes } from 'react'
import modalStyles from './modalStyles'
import dom from 'utils/dom'

/** Class representing a ReactJS Modal */
export default class Modal extends Component {
  static get displayName () {
    return 'Modal'
  }

  static propTypes () {
    return {
      children: PropTypes.node,
      content: PropTypes.string,
      footer: PropTypes.string,
      ondismiss: PropTypes.func.isRequired,
      size: PropTypes.number,
      title: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    this.dismiss = this.dismiss.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.content) {
      dom.disableScroll()
    } else {
      dom.enableScroll()
    }

    return nextProps
  }

  dismiss () {
    const {ondismiss} = this.props
    if (ondismiss && ondismiss instanceof Function) {
      ondismiss()
    }
  }

  render () {
    if (!this.props.content && !this.props.children) {
      return null
    }

    return (
      <div style={modalStyles.container}>
        <div style={modalStyles.modal}>
          <header style={modalStyles.header}>
            {this.props.title ? this.props.title : null}
          </header>
          <div style={modalStyles.body}>
            {this.props.children ? this.props.children : null}
            {this.props.content ? this.props.content : null}
          </div>
          <footer style={modalStyles.footer}>{this.props.footer}</footer>
          <button style={modalStyles.dismiss} onClick={this.dismiss}><div>x</div></button>
        </div>
      </div>
    )
  }
}
