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

// Include all our app-wide style classes
require('./styles/core-globals.scss')
// The custom icon set Amber made for us
// To update icons, see /src/assets/fonts/zorroa-icons/how-to-update.txt
require('./assets/fonts/zorroa-icons/style.css')

// We can require the custom fonts if we want to serve the font files separately.
// The reason to do that would be to allow caching of the font files.
// As it stands, this file is imported in core-globals.scss, and the fonts get
// put in the app js bundle.
// require('./assets/fonts/zorroa-icons/style.css')

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
