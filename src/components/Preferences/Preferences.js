import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'

class Preferences extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
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
        <div className="Preferences-header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="Preferences-icon icon-cog"/>
            <div>Preferences</div>
          </div>
          <div onClick={this.dismiss} className="Preferences-close icon-cross2"/>
        </div>
        <div className="body">
          {user.firstName} {user.lastName}&rsquo;s personal preferences.
          <div className='Preferences-build flexCol'>
            <div>Build number: {`${zvCount} (${zvCommit} ${zvBranch})`}</div>
            <div>Build date: {`${zvDateStr}`}</div>
          </div>
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
