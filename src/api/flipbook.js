import axios from 'axios'
import * as utils from './utils.js'
import Asset from '../models/Asset.js'

export function get (id, options = {}) {
  const height = options.height || 600
  const width = options.width || 300
  const origin = utils.getOrigin()
  const client = axios.create({
    baseURL: origin,
    withCredentials: true
  })

  return client
    .post('/api/v3/assets/_search', {
      'fields': [
        'proxies*',
        'source.clip*'
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
      return response.data.list.map(flipbookChildAsset => {
        const asset = new Asset(flipbookChildAsset)
        return {
          url: asset.atLeastProxyURL(origin, width, height),
          number: asset.document.source.clip.frame.start
        }
      }).sort((a, b) => {
        if (a.number > b.number) {
          return 1
        }

        return -1
      })
    })
}
