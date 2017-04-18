import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { resetPassword } from '../../../actions/authAction'

class Onboard extends Component {
  static propTypes = {
    actions: PropTypes.object
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  componentWillMount () {
    this.changePassword(this.randomPassword())
  }

  randomPassword = () => (Math.random().toString(36).substring(7))

  changePassword = (password) => {
    const token = this.props.location && this.props.location.query && this.props.location.query.token
    const protocol = window.location.protocol
    const host = window.location.hostname
    const source = this.props.location && this.props.location.query && this.props.location.query.source
    this.props.actions.resetPassword(password, token, protocol, host, source)
    this.context.router.push('/')
  }

  render () {
    return <div className="Onboard"/>
  }
}

export default connect(state => ({
}), dispatch => ({
  actions: bindActionCreators({
    resetPassword
  }, dispatch)
}))(Onboard)