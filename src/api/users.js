import axios from 'axios'
import * as utils from './utils.js'
import User from '../models/User.js'

export function get () {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client
    .get('/api/v1/users')
    .then(response => response.data.map(user => new User(user)))
}

export function post (user) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client
    .post('/api/v1/users', user)
    .then(response => new User(response.data))
    .catch(utils.handleError)
}
