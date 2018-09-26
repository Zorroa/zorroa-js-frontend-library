import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Signin from '../auth/Signin'
import Signout from '../auth/Signout'
import TimedLogout from '../auth/TimedLogout'
import ResetPassword from '../auth/ResetPassword'
import ForgotPassword from '../auth/ForgotPassword'
import Workspace from '../Workspace'
import Lightbox from '../Lightbox'
import FolderRedirect from '../FolderRedirect'
import RequireAuth from '../RequireAuth'
import api from '../../api'
import axios from 'axios'
import ModalOverlay, { ModalOverlayBody } from '../ModalOverlay'

import {
  EMBEDMODE_ITEM,
  LOAD_SEARCH_ITEM,
  CLEAR_SESSION_STATE_ITEM,
  SESSION_STATE_ITEM,
  SHOW_IMPORT_ITEM,
} from '../../constants/localStorageItems'
import domUtils from '../../services/domUtils'

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object,
    authenticated: PropTypes.bool,
    sessionExpired: PropTypes.bool,
    themeLoadState: PropTypes.oneOf(['pending', 'succeeded', 'failed'])
      .isRequired,
    actions: PropTypes.shape({
      fetchTheme: PropTypes.func.isRequired,
      samlOptionsRequest: PropTypes.func.isRequired,
      checkSession: PropTypes.func.isRequired,
    }).isRequired,
    samlOptionsStatus: PropTypes.oneOf(['pending', 'success', 'error']),
  }

  state = {
    isMandatoryLoadingPeriod: true,
    isInTimeout: false,
  }

  componentWillMount() {
    var queryParams = domUtils.parseQueryString(window.location.search)
    if (queryParams[EMBEDMODE_ITEM]) {
      localStorage.setItem(EMBEDMODE_ITEM, queryParams[EMBEDMODE_ITEM])
    }
    if (queryParams[LOAD_SEARCH_ITEM]) {
      localStorage.setItem(LOAD_SEARCH_ITEM, queryParams[LOAD_SEARCH_ITEM])
    }
    if (queryParams[CLEAR_SESSION_STATE_ITEM]) {
      localStorage.removeItem(SESSION_STATE_ITEM)
    }
    if (queryParams[SHOW_IMPORT_ITEM]) {
      localStorage.setItem(SHOW_IMPORT_ITEM, queryParams[SHOW_IMPORT_ITEM])
    }

    setTimeout(() => {
      this.setState({
        isMandatoryLoadingPeriod: false,
      })
    }, 750)

    setTimeout(() => {
      this.setState({
        isInTimeout: true,
      })
    }, 5000)
  }

  componentDidMount() {
    this.props.actions.fetchTheme()
    this.createRootFolderId()
    this.props.actions.samlOptionsRequest()
    this.checkSessionIntervalId = setInterval(this.checkSession, 2000)
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldRefetchTheme(this.props, nextProps)) {
      this.props.actions.fetchTheme()
    }

    if (this.shouldRecreateRootFolderId(this.props, nextProps)) {
      this.createRootFolderId()
    }
  }

  componentDidUnmount() {
    clearInterval(this.checkSessionIntervalId)
  }

  setSessionExpiration(error) {
    if (error.response.status === 401) {
      this.props.actions.checkSession()
    }
  }

  checkSession = () => {
    if (!this.props.authenticated) {
      return
    }
    axios.get('/api/v1/who').catch(error => {
      this.setSessionExpiration(error)
    })
  }

  shouldRefetchTheme(prevProps, nextProps) {
    const wasUnauthenticated =
      prevProps.authenticated === undefined || prevProps.authenticated === false
    const isAuthenticated = nextProps.authenticated
    const isThemeUnavailable = nextProps.themeLoadState !== 'succeeded'
    return wasUnauthenticated && isAuthenticated && isThemeUnavailable
  }

  shouldRecreateRootFolderId(prevProps, nextProps) {
    const wasUnauthenticated =
      prevProps.authenticated === undefined || prevProps.authenticated === false
    const isAuthenticated = nextProps.authenticated
    return wasUnauthenticated && isAuthenticated
  }

  createRootFolderId() {
    api.folders.getRootFolder().then(folder => {
      window.ZORROA_ROOT_FOLDER_ID = folder.id
    })
  }

  isLoading() {
    const isLoading =
      // Check if user is logged in using saml
      this.props.samlOptionsStatus === 'pending' ||
      // Make sure any custom themes are loaded
      this.props.themeLoadState === 'pending' ||
      // Make sure we know the user's auth'ed state before forwarding them
      // (potentially unnecessarily) to the signin screen
      this.props.authenticated === undefined ||
      // Avoid the loading screen flashing by ensure there's a reasonable amount
      // of time it gets displayed for
      this.state.isMandatoryLoadingPeriod

    // If there's some kind of problem loading these values, do something
    // instead of just showing a loading spinner forever
    const isWithinTimeoutPeriod = this.state.isInTimeout === false

    return isLoading && isWithinTimeoutPeriod
  }

  sessionIsExpired() {
    if (this.props.sessionExpired) {
      return (
        <ModalOverlay size="small">
          <ModalOverlayBody>
            <TimedLogout size="small" />
          </ModalOverlayBody>
        </ModalOverlay>
      )
    }
  }

  render() {
    if (this.isLoading()) {
      return <div className="App--loading" title="App is loading" />
    }
    return (
      <Router>
        <div>
          {this.sessionIsExpired()}
          <RequireAuth exact path="/" component={Workspace} />
          <RequireAuth path="/asset/:isolatedId" component={Lightbox} />
          <RequireAuth path="/folder/:folderId" component={FolderRedirect} />
          <Route path="/signin" component={Signin} />
          <Route path="/signout" component={Signout} />
          <Route path="/sso/loggedout" component={TimedLogout} />
          <Route path="/forgot" component={ForgotPassword} />
          <Route path="/password" component={ResetPassword} />
        </div>
      </Router>
    )
  }
}
