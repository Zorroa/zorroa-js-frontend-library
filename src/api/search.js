import axios from 'axios'
import * as utils from './utils.js'
import Asset from '../models/Asset'
import Page from '../models/Page'

export default function post (search) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client
    .post('/api/v3/assets/_search', search)
    .then(({data}) => {
      return {
        ...data,
        page: new Page(data.page),
        assets: data.list.map(asset => new Asset(asset))
      }
    })
}
