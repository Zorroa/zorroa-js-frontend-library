import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'
import ModalHeader from '../ModalHeader'
import General from './General'
import UserAdministrator from './UserAdministrator'
import PreferencesPaneMenuItem from './PreferencesPaneMenuItem'
import './PreferencesPane.scss'

class PreferencesPane extends Component {
  static propTypes = {
    onDismiss: PropTypes.func,
    actions: PropTypes.shape({
      hideModal: PropTypes.func.isRequired
    }),
    user: PropTypes.instanceOf(User),
    activePane: PropTypes.string,
    isDeveloper: PropTypes.bool.isRequired,
    isAdministrator: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      activePane: props.activePane || 'general'
    }
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  setActivePane = pane => {
    this.setState({
      activePane: pane
    })
  }

  canAccessAdministratorMenu () {
    const { isAdministrator } = this.props
    return isAdministrator
  }

  render () {
    return (
      <div className="PreferencesPane">
        <div className="PreferencesPane__header">
          <ModalHeader icon="icon-cog" closeFn={this.dismiss}>
            Preferences
          </ModalHeader>
        </div>
        <div className="PreferencesPane__body">
          <div className="PreferencesPane__sidebar">
            <ul className="PreferencesPane__menu">
              <li className="PreferencesPane__menu-item">
                General
                <ul className="PreferencesPane__menu">
                  <PreferencesPaneMenuItem
                    onClick={this.setActivePane}
                    paneName="general"
                    activePaneName={this.state.activePane}
                  >
                    My Settings
                  </PreferencesPaneMenuItem>
                </ul>
              </li>
            </ul>
            { this.canAccessAdministratorMenu() && (
              <ul className="PreferencesPane__menu">
                <li className="PreferencesPane__menu-item">
                  Adminstrator
                  <ul className="PreferencesPane__menu">
                    <PreferencesPaneMenuItem
                      onClick={this.setActivePane}
                      paneName="user"
                      activePaneName={this.state.activePane}
                    >
                      Users
                    </PreferencesPaneMenuItem>
                  </ul>
                </li>
              </ul>
            )}
          </div>
          <div className="PreferencesPane__main">
            { this.state.activePane === 'general' && (
              <General user={this.props.user} />

            )}
            { this.state.activePane === 'user' && (
              <UserAdministrator />
            )}
          </div>
        </div>

      </div>
    )
  }
}

export default connect(state => ({
  isDeveloper: state.auth.isDeveloper,
  isAdministrator: state.auth.isAdministrator
}), dispatch => ({
  actions: bindActionCreators({
    hideModal
  }, dispatch)
}))(PreferencesPane)
