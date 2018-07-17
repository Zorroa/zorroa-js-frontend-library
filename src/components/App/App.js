import React, { Component, PropTypes } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Signin from '../auth/Signin'
import Signout from '../auth/Signout'
import Onboard from '../auth/Onboard'
import ResetPassword from '../auth/ResetPassword'
import ForgotPassword from '../auth/ForgotPassword'
import Workspace from '../Workspace'
import Lightbox from '../Lightbox'
import FolderRedirect from '../FolderRedirect'
import RequireAuth from '../RequireAuth'

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
    themeLoadState: PropTypes.oneOf(['pending', 'succeeded', 'failed'])
      .isRequired,
    actions: PropTypes.shape({
      fetchTheme: PropTypes.func.isRequired,
    }).isRequired,
  }

  state = {
    isMandatoryLoadingPeriod: true,
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
  }

  componentDidMount() {
    this.props.actions.fetchTheme()
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldRefetchTheme(this.props, nextProps)) {
      this.props.actions.fetchTheme()
    }
  }

  shouldRefetchTheme(prevProps, nextProps) {
    const wasUnauthenticated =
      prevProps.authenticated === undefined || prevProps.authenticated === false
    const isAuthenticated = nextProps.authenticated
    const isThemeUnavailable = nextProps.themeLoadState !== 'succeeded'
    return wasUnauthenticated && isAuthenticated && isThemeUnavailable
  }

  isLoading() {
    return (
      // Make sure any custom themes are loaded
      this.props.themeLoadState === 'pending' ||
      // Make sure we know the user's auth'ed state before forwarding them
      // (potentially unnecessarily) to the signin screen
      this.props.authenticated === undefined ||
      // Avoid the loading screen flashing by ensure there's a reasonable amount
      // of time it gets displayed for
      this.state.isMandatoryLoadingPeriod
    )
  }

  render() {
    if (this.isLoading()) {
      return <div className="App--loading" title="App is loading" />
    }

    return (
      <Router>
        <div>
          <RequireAuth exact path="/" component={Workspace} />
          <RequireAuth path="/asset/:isolatedId" component={Lightbox} />
          <RequireAuth path="/folder/:folderId" component={FolderRedirect} />
          <Route path="/signin" component={Signin} />
          <Route path="/signout" component={Signout} />
          <Route path="/forgot" component={ForgotPassword} />
          <Route path="/password" component={ResetPassword} />
          <Route path="/onboard" component={Onboard} />
        </div>
      </Router>
    )
  }
}
