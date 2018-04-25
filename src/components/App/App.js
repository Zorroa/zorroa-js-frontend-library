import React, { Component, PropTypes } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Signin from '../auth/Signin'
import Signout from '../auth/Signout'
import Onboard from '../auth/Onboard'
import ResetPassword from '../auth/ResetPassword'
import ForgotPassword from '../auth/ForgotPassword'
import Workspace from '../Workspace'
import Lightbox from '../Lightbox'
import RequireAuth from '../RequireAuth'

import {
  EMBEDMODE_ITEM,
  LOAD_SEARCH_ITEM,
  CLEAR_SESSION_STATE_ITEM,
  SESSION_STATE_ITEM,
  SHOW_IMPORT_ITEM,
} from '../../constants/localStorageItems'
import domUtils from '../../services/domUtils'

class App extends Component {
  static propTypes = {
    children: PropTypes.object,
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
  }

  render() {
    return (
      <Router>
        <div>
          <RequireAuth exact path="/" component={Workspace} />
          <RequireAuth path="/asset/:isolatedId" component={Lightbox} />
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

export default App
