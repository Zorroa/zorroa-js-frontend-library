import * as assert from 'assert'

import Job from '../models/Job'
import AssetSearch from '../models/AssetSearch'
import { EXPORT_ASSETS, GET_JOBS } from '../constants/actionTypes'
import { getArchivist } from './authAction'

export function exportAssets (name, search) {
  assert.ok(search instanceof AssetSearch)
  return dispatch => {
    console.log('Export: ' + JSON.stringify(search))
    getArchivist().post('/api/v1/exports', {name, search})
      .then(response => {
        dispatch({
          type: EXPORT_ASSETS,
          payload: new Job(response.data)
        })
      })
      .catch(error => {
        console.error('Error creating export with search ' + JSON.stringify(search) + ', error: ' + error)
      })
  }
}

export function getJobs (jobFilter, from, count) {
  return dispatch => {
    console.log('Get jobs: ' + JSON.stringify(jobFilter) + ' from=' + from + ' count=' + count)
    getArchivist().get('/api/v1/jobs', jobFilter, { params: { from, count } })
      .then(response => {
        dispatch({
          type: GET_JOBS,
          payload: response.data.list.map(job => (new Job(job)))
        })
      })
      .catch(error => {
        console.error('Error getting jobs filter=' + JSON.stringify(jobFilter) + ' from=' + from + ' count=' + count + ' error:' + error)
      })
  }
}
