import React from 'react'
import Dropbox from 'dropbox'

import domUtils from '../../services/domUtils'

export const DropboxAuth = () => {
  const response = domUtils.parseQueryString(window.location.toString())
  const accessToken = response[DropboxAuthenticator.redirectURL()]
  localStorage.setItem('DropboxAccessToken', accessToken)
  window.close()
  return <div>Dropbox Authorized</div>
}

export class DropboxAuthenticator {
  constructor (appKey, onAuth) {
    this.appKey = appKey
    this.onAuth = onAuth
  }

  static redirectURL = () => (`${window.location.origin}/dbxauth#access_token`)

  authorized = (ev) => {
    if (ev.key === 'DropboxAccessToken') {
      this.accessToken = ev.newValue
      console.log('Received: ' + this.accessToken)
      this.authenticating = false
      this.onAuth(this.accessToken)
      window.removeEventListener('storage', this.authorized)
    }
  }

  deauthorize = () => {
    localStorage.removeItem('DropboxURL')
    localStorage.removeItem('DropboxAccessToken')
    this.onAuth()
  }

  authorize = () => {
    const accessToken = localStorage.getItem('DropboxAccessToken')
    if (accessToken && accessToken.length) {
      const dbx = new Dropbox({ clientId: this.appKey, accessToken })
      if (dbx && dbx.getClientId()) {
        this.onAuth(accessToken)
        return
      }
    }
    if (this.authenticating) return
    this.authenticating = true
    // Listen for changes to local storage to capture return URL from
    // Dropbox OAuth2 redirect in popup window
    window.addEventListener('storage', this.authorized)
    // const authUrl = 'http://localhost:8066/#access_token=gnXMnC4kaSAAAAAAAAABcjGEFV6hNSMs-L3xJ3D6qGF9SFNW2LJ2YcdSUTwNX4h8&token_type=bearer&uid=542065014&account_id=dbid%3AAAALlZIpNztmWVNtxx53n-gH4N0bhq_YnJQ'
    // Set the login anchors href using dbx.getAuthenticationUrl()
    const dbx = new Dropbox({ clientId: this.appKey })
    const state = Math.random().toString(36).substring(7)
    const authUrl = dbx.getAuthenticationUrl(DropboxAuthenticator.redirectURL(), state)
    console.log('Auth URL: ' + authUrl)
    console.log('Popup Dropbox authenticator')
    const w = 480
    const h = 640
    const wLeft = window.screenLeft ? window.screenLeft : window.screenX
    const wTop = window.screenTop ? window.screenTop : window.screenY
    const left = wLeft + (window.innerWidth / 2) - (w / 2)
    const top = wTop + (window.innerHeight / 2) - (h / 2)
    const strWindowFeatures = `left=${left},top=${top},width=${w},height=${h},dialog=yes,resizable=no,status=no,dependent=yes,toolbar=no,location=no,directories=no,menubar=no,copyhistory=no`
    window.open(authUrl, 'Zorroa Dropbox', strWindowFeatures)
  }
}
