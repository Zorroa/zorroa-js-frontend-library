import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hidePreferencesModal } from '../../actions/appActions'
import User from '../../models/User'
import General from './General'
import CreateUser from './CreateUser'
import EditUser from './EditUser'
import UserTable from './UserTable'
import PreferencesPaneMenuItem from './PreferencesPaneMenuItem'
import './PreferencesPane.scss'
import ModalOverlay, {
  ModalOverlayBody,
  ModalOverlaySidebar,
  ModalOverlayHeader,
} from '../ModalOverlay'

class PreferencesPane extends Component {
  static propTypes = {
    onDismiss: PropTypes.func,
    actions: PropTypes.shape({
      hidePreferencesModal: PropTypes.func.isRequired,
    }),
    user: PropTypes.instanceOf(User),
    activePane: PropTypes.string,
    isDeveloper: PropTypes.bool.isRequired,
    isAdministrator: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      activePane: props.activePane || 'general',
    }
  }

  dismiss = event => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hidePreferencesModal()
  }

  setActivePane = pane => {
    this.setState({
      activePane: pane,
    })
  }

  canAccessAdministratorMenu() {
    const { isAdministrator } = this.props
    return isAdministrator
  }

  render() {
    return (
      <ModalOverlay
        onClose={this.dismiss}
        className="PreferencesPane"
        size="narrow">
        <ModalOverlayHeader onClose={this.dismiss} icon="icon-cog">
          Preferences
        </ModalOverlayHeader>
        <ModalOverlaySidebar>
          <ul className="PreferencesPane__menu">
            <li className="PreferencesPane__menu-item">
              General
              <ul className="PreferencesPane__menu">
                <PreferencesPaneMenuItem
                  onClick={this.setActivePane}
                  paneName="general"
                  activePaneName={this.state.activePane}>
                  My Settings
                </PreferencesPaneMenuItem>
              </ul>
            </li>
          </ul>
          {this.canAccessAdministratorMenu() && (
            <ul className="PreferencesPane__menu">
              <li className="PreferencesPane__menu-item">
                Adminstrator
                <ul className="PreferencesPane__menu">
                  <PreferencesPaneMenuItem
                    onClick={this.setActivePane}
                    paneName="user"
                    activePaneName={this.state.activePane}>
                    Users
                  </PreferencesPaneMenuItem>
                  <PreferencesPaneMenuItem
                    onClick={this.setActivePane}
                    paneName="userCreate"
                    activePaneName={this.state.activePane}>
                    Create User
                  </PreferencesPaneMenuItem>
                </ul>
              </li>
            </ul>
          )}
        </ModalOverlaySidebar>
        <ModalOverlayBody>
          {this.state.activePane === 'general' && (
            <General user={this.props.user} />
          )}
          {this.state.activePane === 'userCreate' && (
            <CreateUser onSetActivePane={this.setActivePane} />
          )}
          {this.state.activePane === 'user' && (
            <UserTable onSetActivePane={this.setActivePane} />
          )}
          {this.state.activePane === 'userEdit' && (
            <EditUser onSetActivePane={this.setActivePane} />
          )}
        </ModalOverlayBody>
      </ModalOverlay>
    )
  }
}

export default connect(
  state => ({
    isDeveloper: state.auth.isDeveloper,
    isAdministrator: state.auth.isAdministrator,
    activePane: state.app.activePreferencesPane,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        hidePreferencesModal,
      },
      dispatch,
    ),
  }),
)(PreferencesPane)
