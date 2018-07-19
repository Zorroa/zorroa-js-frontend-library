import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { resetPassword } from '../../../actions/authAction'

class Onboard extends Component {
  static propTypes = {
    location: PropTypes.object,
    actions: PropTypes.object,
    history: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }),
  }

  static get contextTypes() {
    return {
      router: PropTypes.object,
    }
  }

  componentWillMount() {
    this.changePassword(this.randomPassword())
  }

  randomPassword = () =>
    Math.random()
      .toString(36)
      .substring(7)

  changePassword = password => {
    const token =
      this.props.location &&
      this.props.location.query &&
      this.props.location.query.token
    const origin = window.location.origin
    const source =
      this.props.location &&
      this.props.location.query &&
      this.props.location.query.source
    this.props.actions.resetPassword(password, token, origin, source)
    this.props.history.goBack()
  }

  render() {
    return <div className="Onboard" />
  }
}

const ConnectedOnboard = connect(
  () => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        resetPassword,
      },
      dispatch,
    ),
  }),
)(Onboard)

export default withRouter(ConnectedOnboard)
