import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './components/App'
import Signin from './components/auth/Signin'
import Signout from './components/auth/Signout'
import RequireAuth from './components/auth/RequireAuth'
import Workspace from './components/Workspace'
import Lightbox from './components/Lightbox'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={RequireAuth(Workspace, '/signin')} />
    <Route path="signin" component={Signin} />
    <Route path="signup" component={Signin} />
    <Route path="signout" component={Signout} />
    <Route path="lightbox" component={Lightbox} />
  </Route>
)
