import * as assert from 'assert'

import Job from '../models/Job'
import Pipeline from '../models/Pipeline'
import AssetSearch from '../models/AssetSearch'
import {
  EXPORT_ASSETS, IMPORT_ASSETS,
  GET_PIPELINES, GET_JOBS,
  MARK_JOB_DOWNLOADED,
  CANCEL_JOB, RESTART_JOB } from '../constants/actionTypes'
import { getArchivist } from './authAction'

const rootEndpoint = '/api/v1/jobs'

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

export function importAssets (name, pipelineId, files) {
  return dispatch => {
    console.log('Import: ' + name + ' with pipeline id ' + pipelineId)
    getArchivist().post('/api/v1/imports', {name, pipelineId, files})
      .then(response => {
        dispatch({
          type: IMPORT_ASSETS,
          payload: new Job(response.data)
        })
      })
      .catch(error => {
        console.error('Error creating import ' + name + ' with pipeline id ' + pipelineId + ': ' + error)
      })
  }
}

export function getPipelines () {
  return dispatch => {
    console.log('Get pipelines')
    getArchivist().get('/api/v1/pipelines')
      .then(response => {
        dispatch({
          type: GET_PIPELINES,
          payload: response.data.list.map(json => new Pipeline(json))
        })
      })
      .catch(error => {
        console.error('Error getting pipelines: ' + error)
      })
  }
}
export function getJobs (jobFilter, from, count) {
  return dispatch => {
    console.log('Get jobs: ' + JSON.stringify(jobFilter) + ' from=' + from + ' count=' + count)
    const request = {
      method: 'get',
      url: rootEndpoint,
      data: jobFilter,
      params: { from, count },
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }
    getArchivist()(request)
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

export function markJobDownloaded (jobId) {
  return ({ type: MARK_JOB_DOWNLOADED, payload: jobId })
}

export function cancelJobId (jobId) {
  return dispatch => {
    console.log('Cancel job ' + jobId)
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'put',
      url: `${rootEndpoint}/${jobId}/_cancel`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }
    getArchivist()(request)
      .then(response => {
        dispatch({
          type: CANCEL_JOB,
          payload: jobId
        })
      })
      .catch(error => {
        console.error('Error canceling job ' + jobId + ': ' + error)
      })
  }
}

export function restartJobId (jobId) {
  return dispatch => {
    console.log('Restart job ' + jobId)
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'put',
      url: `${rootEndpoint}/${jobId}/_restart`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }
    getArchivist()(request)
      .then(response => {
        dispatch({
          type: RESTART_JOB,
          payload: jobId
        })
      })
      .catch(error => {
        console.error('Error restarting job ' + jobId + ': ' + error)
      })
  }
}
