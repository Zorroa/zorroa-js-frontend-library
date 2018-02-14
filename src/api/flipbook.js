import axios from 'axios'
import * as utils from './utils.js'
import Asset from '../models/Asset.js'

export function get (id) {
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client
    .post('/api/v3/assets/_search', {
      'fields': [
        'proxies*',
        'source*'
      ],
      'filter': {
        'terms': {
          'source.clip.parent.raw': [
            id
          ]
        }
      },
      'postFilter': null,
      'size': 10000, // TODO: Re-evaulate if this is good enough
      'aggs': null
    })
    .then(response => {
      return response
        .data
        .list
        .map(flipbookChildAsset => new Asset(flipbookChildAsset))
    })
}
