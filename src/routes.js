import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './components/App'
import Signin from './components/auth/Signin'
import Signout from './components/auth/Signout'
import Onboard from './components/auth/Onboard'
import RequireAuth from './components/auth/RequireAuth'
import ResetPassword from './components/auth/ResetPassword'
import ForgotPassword from './components/auth/ForgotPassword'
import Workspace from './components/Workspace'
import { DropboxAuth } from './components/Import/DropboxAuthenticator'
import { BoxAuth } from './components/Import/BoxAuthenticator'
import { GDriveAuth } from './components/Import/GDriveAuthenticator'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={RequireAuth(Workspace, '/signin')} />
    <Route path="signin" component={Signin} />
    <Route path="signout" component={Signout} />
    <Route path="forgot" component={ForgotPassword} />
    <Route path="password" component={ResetPassword} />
    <Route path="onboard" component={Onboard} />
    <Route path="dbxauth" component={DropboxAuth} />
    <Route path="boxauth" component={BoxAuth} />
    <Route path="gdriveauth" component={GDriveAuth} />
  </Route>
)
