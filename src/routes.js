import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/App'
import Signin from './components/auth/Signin'
import Signup from './components/auth/Signup'
import Signout from './components/auth/Signout'
import RequireAuth from './components/auth/RequireAuth'
import Workspace from './components/Workspace'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={RequireAuth(Workspace, '/signin')} />
    <Route path="signin" component={Signin} />
    <Route path="signup" component={Signup} />
    <Route path="signout" component={Signout} />
  </Route>
)
