'use strict'

import debug from 'debug'
import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import multi from 'redux-multi'
import thunk from 'redux-thunk'
import ReduxPromise from 'redux-promise'

import routes from './routes'
import reducers from './reducers'
import { USER_ITEM, HOST_ITEM } from './constants/localStorageItems'
import { validateUser } from './actions/authAction'
import User from './models/User'

const log = debug('application:bootstrap')

log('creating state container')
const middleware = [thunk, multi, ReduxPromise]
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)
const store = createStoreWithMiddleware(reducers)

log('creating application node')
const applicationNode = (
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
)

// If we have a token, consider the user to be signed in, and update local state
// FIXME: Remove localStorage
console.log('loading token')
const userItem = JSON.parse(localStorage.getItem(USER_ITEM))
const user = userItem ? new User(userItem) : null
const host = localStorage.getItem(HOST_ITEM)
if (user && host) {
  store.dispatch(validateUser(user, host))
}

log('creating dom node')
const domNode = document.createElement('div')
domNode.id = 'application'
document.body.appendChild(domNode)

log('rendering application to DOM')
render(applicationNode, domNode, () => {
  log('finished mounting application')
})
