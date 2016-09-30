'use strict'

import debug from 'debug'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import multi from 'redux-multi'
import thunk from 'redux-thunk'
import ReduxPromise from 'redux-promise'

import App from './containers/App'
import Welcome from './components/Welcome'
import Signin from './components/auth/Signin'
import Signup from './components/auth/Signup'
import Signout from './components/auth/Signout'
import RequireAuth from './components/auth/RequireAuth'
import Feature from './components/Feature'

import reducers from './reducers'
import { AUTH_USER } from './constants/actionTypes'

const log = debug('application:bootstrap')

log('creating state container')
const middleware = [thunk, multi, ReduxPromise]
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)
const store = createStoreWithMiddleware(reducers)

log('creating application node')
const applicationNode = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={Welcome}/>
        <Route path="signin" component={Signin}/>
        <Route path="signup" component={Signup}/>
        <Route path="signout" component={Signout}/>
        <Route path="feature" component={RequireAuth(Feature)}/>
      </Route>
    </Router>
  </Provider>
)

// If we have a token, consider the user to be signed in, and update local state
console.log('loading token')
const token = localStorage.getItem('token')
if (token) {
  store.dispatch({ type: AUTH_USER })
}

log('creating dom node')
const domNode = document.createElement('div')
domNode.id = 'application'
document.body.appendChild(domNode)

log('rendering application to DOM')
render(applicationNode, domNode, () => {
  log('finished mounting application')
})
