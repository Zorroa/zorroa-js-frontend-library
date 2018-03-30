import axios from 'axios'
import * as utils from './utils.js'

function putEnabled (client, enabled) {
  return client.put(`/_enabled`, {
    enabled: enabled
  }).catch(utils.handleError)
}

function putProfile (client, profile) {
  return client.put(`/_profile`, profile).catch(utils.handleError)
}

function putPassword (client, password, oldPassword) {
  const passwordPayload = {
    newPassword: password
  }

  if (oldPassword !== undefined) {
    passwordPayload.oldPassword = oldPassword
  }

  return client.put(`/_password`, passwordPayload).catch(utils.handleError)
}

function getPermissions (client) {
  return client.get(`/permissions`).catch(utils.handleError)
}

function putPermissions (client, permissions) {
  return client.put(`/permissions`, permissions).catch(utils.handleError)
}

function getUser (client) {
  return client.get('').catch(utils.handleError)
}

export default function user (userId) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: `${origin}/api/v1/users/${userId}`,
    withCredentials: true
  })

  return {
    get: () => {
      return Promise.all([
        getUser(client),
        getPermissions(client)
      ]).then(([userResponse, permissionsResponse]) => {
        const user = Object.assign({
          permissions: permissionsResponse.data
        }, userResponse.data)
        return user
      })
    },

    password: {
      put: (password, oldPassword) => {
        return putPassword(client, password, oldPassword)
      }
    },

    profile: {
      put: (profile) => {
        return putProfile(client, profile)
      }
    },

    permissions: {
      put: (permissions) => {
        return putPermissions(client, permissions)
      }
    },

    enabled: {
      put: (enabled) => {
        return putEnabled(client, enabled)
      }
    }
  }
}
