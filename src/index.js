'use strict'

import debug from 'debug'
import React from 'react'
import { render } from 'react-dom'
import App from './App'

const log = debug('application:bootstrap')

log('creating application node')
const domNode = document.createElement('div')
domNode.id = 'application'

log('adding application node to body')
document.body.appendChild(domNode)

render(<App />, domNode, () => {
  log('finished mounting application')
})
