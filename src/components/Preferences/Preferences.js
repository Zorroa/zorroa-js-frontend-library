import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'

class Preferences extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    onCreate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
    actions: PropTypes.object
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  render () {
    const { user } = this.props
    return (
      <div className="Preferences">
        <div className="header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="icon-plus-square"/>
            <div>Create Export</div>
          </div>
          <div onClick={this.dismiss} className="icon-cross2"/>
        </div>
        <div className="body">
          {user.firstName} {user.lastName}&rsquo;s personal preferences.
        </div>
        <div className="footer">
          <button onClick={this.dismiss}>Done</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(Preferences)
