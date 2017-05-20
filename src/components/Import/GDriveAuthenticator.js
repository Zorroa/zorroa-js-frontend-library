import React from 'react'
import axios from 'axios'

import domUtils from '../../services/domUtils'
import { GDRIVE_ACCESS_TOKEN_ITEM } from '../../constants/localStorageItems'

export const GDriveAuth = () => {
  const fragment = domUtils.parseQueryString(window.location.hash)
  const accessToken = fragment.access_token
  if (accessToken && accessToken.length) {
    console.log('GDrive authorized')
    localStorage.setItem(GDRIVE_ACCESS_TOKEN_ITEM, accessToken)
  } else {
    console.log('Invalid access token, deauthorizing GDrive')
    GDriveAuthenticator.deauthorize()
  }
  window.close()
  return <div>GDrive Authorized</div>
}

export class GDriveAuthenticator {
  constructor (clientID, onAuth) {
    this.clientID = clientID
    this.onAuth = onAuth
  }

  static redirectURL = () => ('https://onboard.zorroa.com:3000/gdriveauth')
  static accessToken = () => (localStorage.getItem(GDRIVE_ACCESS_TOKEN_ITEM))
  static deauthorize = () => { localStorage.removeItem(GDRIVE_ACCESS_TOKEN_ITEM) }

  authorized = (ev) => {
    if (ev.key === GDRIVE_ACCESS_TOKEN_ITEM) {
      this.accessToken = ev.newValue
      this.authenticating = false
      this.onAuth(this.accessToken)
      window.removeEventListener('storage', this.authorized)
    }
  }

  authorize = () => {
    const accessToken = GDriveAuthenticator.accessToken()
    if (accessToken && accessToken.length) {
      const gdrive = axios.create({
        baseURL: 'https://www.googleapis.com/auth/drive.readonly',
        headers: {'Authorization': 'Bearer ' + accessToken}
      })
      gdrive.get('users/me')
        .then(response => { this.onAuth(accessToken) })
        .catch(_ => { this.authenticate() })
    } else {
      this.authenticate()
    }
  }

  authenticate = () => {
    this.authenticating = true
    if (this.authenticating) return
    // Listen for changes to local storage to capture return URL from
    // GDrive OAuth2 redirect in popup window
    window.addEventListener('storage', this.authorized)
    // const authUrl = 'http://localhost:8066/#access_token=gnXMnC4kaSAAAAAAAAABcjGEFV6hNSMs-L3xJ3D6qGF9SFNW2LJ2YcdSUTwNX4h8&token_type=bearer&uid=542065014&account_id=dbid%3AAAALlZIpNztmWVNtxx53n-gH4N0bhq_YnJQ'
    // Set the login anchors href using dbx.getAuthenticationUrl()
    const url = 'https://www.googleapis.com/auth/drive.readonly/oauth2/authorize' +
      '?response_type=code&client_id=' + this.clientID +
      '&redirect_uri=' + GDriveAuthenticator.redirectURL() +
      '&state=w3@r3n0td@m!' + window.location.origin
    const w = 480
    const h = 640
    const wLeft = window.screenLeft ? window.screenLeft : window.screenX
    const wTop = window.screenTop ? window.screenTop : window.screenY
    const left = wLeft + (window.innerWidth / 2) - (w / 2)
    const top = wTop + (window.innerHeight / 2) - (h / 2)
    const strWindowFeatures = `left=${left},top=${top},width=${w},height=${h},dialog=yes,resizable=no,status=no,dependent=yes,toolbar=no,location=no,directories=no,menubar=no,copyhistory=no`
    const win = window.open(url, 'Zorroa GDrive', strWindowFeatures)
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
