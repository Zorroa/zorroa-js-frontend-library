import * as assert from 'assert'

import Job from '../models/Job'
import Asset from '../models/Asset'
import Pipeline from '../models/Pipeline'
import AssetSearch from '../models/AssetSearch'
import {
  EXPORT_ASSETS,
  IMPORT_ASSETS,
  GET_PIPELINES,
  GET_JOBS,
  GET_JOB,
  ISOLATE_JOB,
  QUEUE_UPLOAD_FILE_ENTRIES,
  DEQUEUE_UPLOADED_FILE_ENTRIES,
  MARK_JOB_DOWNLOADED,
  GET_PROCESSORS,
  CANCEL_JOB,
  RESTART_JOB,
  SELECT_JOBS,
} from '../constants/actionTypes'
import { archivistGet, archivistPost, archivistRequest } from './authAction'
import Processor from '../models/Processor'
import { selectId } from '../services/jsUtil'
import api from '../api'

const jobEndpoint = '/api/v1/jobs'
const importEndpoint = '/api/v1/imports'

export function exportAssets(name, search, fields, includeSource) {
  assert.ok(search instanceof AssetSearch)
  return dispatch => {
    console.log(
      'Export: ' + JSON.stringify(search) + ' and fields: ' + fields
        ? JSON.stringify(fields)
        : 'none',
    )
    return archivistPost(dispatch, '/api/v1/exports', {
      name,
      search,
      fields,
      includeSource,
    })
      .then(response => {
        dispatch({
          type: EXPORT_ASSETS,
          payload: new Job(response.data),
        })
        return response.data.jobId
      })
      .catch(error => {
        console.error(
          'Error creating export with search ' +
            JSON.stringify(search) +
            ', error: ' +
            error,
        )
        return Promise.reject(error)
      })
  }
}

export function importAssets(name, pipelineId, generators, pipeline) {
  return dispatch => {
    if (pipeline) {
      console.log(
        'Import: ' + name + ' with pipeline: ' + JSON.stringify(pipeline),
      )
    } else {
      console.log('Import: ' + name + ' with pipeline id ' + pipelineId)
    }
    pipelineId = pipelineId <= 0 ? undefined : pipelineId
    archivistPost(dispatch, importEndpoint, {
      name,
      pipelineId,
      generators,
      pipeline,
    })
      .then(response => {
        dispatch({
          type: IMPORT_ASSETS,
          payload: new Job(response.data),
        })
      })
      .catch(error => {
        console.error('Error creating import ' + name + ': ' + error)
      })
  }
}

export function getPipelines() {
  return dispatch => {
    console.log('Get pipelines')
    archivistGet(dispatch, '/api/v1/pipelines')
      .then(response => {
        dispatch({
          type: GET_PIPELINES,
          payload: response.data.list.map(json => new Pipeline(json)),
        })
      })
      .catch(error => {
        console.error('Error getting pipelines: ' + error)
      })
  }
}

export function getJobs(jobFilter, from, count) {
  return dispatch => {
    const request = {
      method: 'post',
      url: '/api/v1/jobs/_search',
      data: jobFilter,
      params: { from, count },
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    return archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: GET_JOBS,
          payload: response.data.list.map(job => new Job(job)),
        })
        return response
      })
      .catch(error => {
        console.error(
          'Error getting jobs filter=' +
            JSON.stringify(jobFilter) +
            ' from=' +
            from +
            ' count=' +
            count +
            ' error:' +
            error,
        )
      })
  }
}

export function getJob(jobId) {
  return dispatch => {
    console.log(`Get job ${jobId}`)
    const request = {
      method: 'get',
      url: `${jobEndpoint}/${jobId}`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    return archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: GET_JOB,
          payload: new Job(response.data),
        })
        return response
      })
      .catch(error => {
        console.error('Error getting job id=' + jobId, error)
      })
  }
}

export function markJobDownloaded(jobId) {
  return { type: MARK_JOB_DOWNLOADED, payload: jobId }
}

export function downloadFilesForJob(jobId, origin) {
  return dispatch => {
    api
      .job(jobId)
      .files.get()
      .then(files => {
        return Promise.all(
          files.map(file => {
            const { jobId, id } = file
            const downloadUrl = `${origin}/api/v1/exports/${jobId}/_files/${id}/_stream`
            window.open(downloadUrl, '_blank')
          }),
        )
      })
      .then(() => {
        dispatch({
          type: MARK_JOB_DOWNLOADED,
          payload: jobId,
        })
      })
  }
}

export function cancelJobId(jobId) {
  return dispatch => {
    console.log('Cancel job ' + jobId)
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'put',
      url: `${jobEndpoint}/${jobId}/_cancel`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: CANCEL_JOB,
          payload: jobId,
        })
      })
      .catch(error => {
        console.error('Error canceling job ' + jobId + ': ' + error)
      })
  }
}

export function restartJobId(jobId) {
  return dispatch => {
    console.log('Restart job ' + jobId)
    // Workaround CORS issue in OPTIONS preflight request for axios.delete
    const request = {
      method: 'put',
      url: `${jobEndpoint}/${jobId}/_restart`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
    archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: RESTART_JOB,
          payload: jobId,
        })
      })
      .catch(error => {
        console.error('Error restarting job ' + jobId + ': ' + error)
      })
  }
}

export function uploadFiles(name, pipelineId, files, onUploadProgress) {
  return dispatch => {
    // Pass the Files in FormData, for multipart request headers?
    const formData = new FormData()
    const pipelineIds = []
    if (pipelineId > 0) pipelineIds.push(pipelineId)
    formData.append('body', JSON.stringify({ name, pipelineIds }))
    files.forEach(file => {
      formData.append('files', file, file.name)
    })
    const request = {
      method: 'post',
      url: `${importEndpoint}/_upload`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      onUploadProgress,
      data: formData,
    }
    archivistRequest(dispatch, request)
      .then(response => {
        dispatch({
          type: IMPORT_ASSETS,
          payload: new Job(response.data),
        })
      })
      .catch(error => {
        console.error('Error uploading ' + files.length + ' files: ' + error)
      })
  }
}

export function getProcessors() {
  return dispatch => {
    archivistGet(dispatch, '/api/v1/processors').then(response => {
      dispatch({
        type: GET_PROCESSORS,
        payload: response.data.map(json => new Processor(json)),
      })
    })
  }
}

export function queueFileEntrysUpload(fileEntries) {
  return {
    type: QUEUE_UPLOAD_FILE_ENTRIES,
    payload: fileEntries,
  }
}

export function dequeueUploadFileEntrys(fileEntries) {
  return {
    type: DEQUEUE_UPLOADED_FILE_ENTRIES,
    payload: fileEntries,
  }
}

export function analyzeFileEntries(
  actionType,
  files,
  pipeline,
  args,
  onUploadProgress,
) {
  return dispatch => {
    const body = { pipeline }
    const formData = new FormData()
    formData.append('body', JSON.stringify(body))
    formData.append('args', JSON.stringify(args))
    files.forEach(file => {
      formData.append('files', file, file.name)
    })
    const request = {
      method: 'post',
      url: '/api/v1/analyze/_files',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      onUploadProgress,
      data: formData,
    }
    archivistRequest(dispatch, request)
      .then(response => {
        console.log('Analyze assets: ' + JSON.stringify(response.data))
        const assets = response.data.list.map(asset => new Asset(asset))
        dispatch({
          type: actionType,
          payload: assets,
        })
      })
      .catch(error => {
        console.error('Error uploading ' + files.length + ' files: ' + error)
      })
  }
}

export function isolateJob(job) {
  return {
    type: ISOLATE_JOB,
    payload: job,
  }
}

export function selectJobIds(ids) {
  if (!(ids instanceof Set)) ids = new Set(ids)
  return {
    type: SELECT_JOBS,
    payload: ids,
  }
}

export function selectJobId(id, shiftKey, metaKey, jobs, selectedIds, all) {
  let selectedJobIds = selectId(id, shiftKey, metaKey, jobs, selectedIds)
  return selectJobIds(selectedJobIds, selectedIds, all)
}
