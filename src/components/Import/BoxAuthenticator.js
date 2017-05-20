import React from 'react'
import axios from 'axios'

import domUtils from '../../services/domUtils'
import { BOX_ACCESS_TOKEN_ITEM } from '../../constants/localStorageItems'

export const BoxAuth = () => {
  const fragment = domUtils.parseQueryString(window.location.hash)
  const accessToken = fragment.access_token
  if (accessToken && accessToken.length) {
    console.log('Box authorized')
    localStorage.setItem(BOX_ACCESS_TOKEN_ITEM, accessToken)
  } else {
    console.log('Invalid access token, deauthorizing Box')
    BoxAuthenticator.deauthorize()
  }
  window.close()
  return <div>Box Authorized</div>
}

export class BoxAuthenticator {
  constructor (clientID, onAuth) {
    this.clientID = clientID
    this.onAuth = onAuth
  }

  static redirectURL = () => ('https://onboard.zorroa.com:3000/boxauth')
  static accessToken = () => (localStorage.getItem(BOX_ACCESS_TOKEN_ITEM))
  static deauthorize = () => { localStorage.removeItem(BOX_ACCESS_TOKEN_ITEM) }

  authorized = (ev) => {
    if (ev.key === BOX_ACCESS_TOKEN_ITEM) {
      this.accessToken = ev.newValue
      this.authenticating = false
      this.onAuth(this.accessToken)
      window.removeEventListener('storage', this.authorized)
    }
  }

  authorize = () => {
    const accessToken = BoxAuthenticator.accessToken()
    if (accessToken && accessToken.length) {
      const box = axios.create({
        baseURL: 'https://api.box.com/2.0',
        headers: {'Authorization': 'Bearer ' + accessToken}
      })
      box.get('users/me')
        .then(response => { this.onAuth(accessToken) })
        .catch(_ => { this.authenticate() })
    } else {
      this.authenticate()
    }
  }

  authenticate = () => {
    if (this.authenticating) return
    this.authenticating = true
    // Listen for changes to local storage to capture return URL from
    // Box OAuth2 redirect in popup window
    window.addEventListener('storage', this.authorized)
    // const authUrl = 'http://localhost:8066/#access_token=gnXMnC4kaSAAAAAAAAABcjGEFV6hNSMs-L3xJ3D6qGF9SFNW2LJ2YcdSUTwNX4h8&token_type=bearer&uid=542065014&account_id=dbid%3AAAALlZIpNztmWVNtxx53n-gH4N0bhq_YnJQ'
    // Set the login anchors href using dbx.getAuthenticationUrl()
    const url = 'https://account.box.com/api/oauth2/authorize' +
      '?response_type=code&client_id=' + this.clientID +
      '&redirect_uri=' + BoxAuthenticator.redirectURL() +
      '&state=w3@r3n0td@m!' + window.location.origin
    const w = 480
    const h = 640
    const wLeft = window.screenLeft ? window.screenLeft : window.screenX
    const wTop = window.screenTop ? window.screenTop : window.screenY
    const left = wLeft + (window.innerWidth / 2) - (w / 2)
    const top = wTop + (window.innerHeight / 2) - (h / 2)
    const strWindowFeatures = `left=${left},top=${top},width=${w},height=${h},dialog=yes,resizable=no,status=no,dependent=yes,toolbar=no,location=no,directories=no,menubar=no,copyhistory=no`
    const win = window.open(url, 'Zorroa Box', strWindowFeatures)
    if (win) {
      const pollTimer = window.setInterval(_ => {
        if (win.closed !== false) { // !== is required for compatibility with Opera
          window.clearInterval(pollTimer)
          this.authenticating = false
        }
      }, 500)
    }
  }
}
