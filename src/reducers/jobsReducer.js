import {
  EXPORT_ASSETS, IMPORT_ASSETS,
  GET_JOBS, GET_PIPELINES,
  QUEUE_FILE_UPLOAD, DEQUEUE_UPLOADED_FILE,
  MARK_JOB_DOWNLOADED, GET_PROCESSORS,
  RESTART_JOB, CANCEL_JOB, UNAUTH_USER } from '../constants/actionTypes'
import Job from '../models/Job'

export const initialState = {
  all: {},
  processors: [],
  uploadFiles: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPORT_ASSETS: {
      const job = action.payload
      job.notDownloaded = true
      const all = { ...state.all, [job.id]: job }
      return { ...state, all }
    }

    case IMPORT_ASSETS: {
      const job = action.payload
      job.state = Job.Active      // Workaround 0.34 Archivist bug
      const all = { ...state.all, [job.id]: job }
      return { ...state, all }
    }

    case GET_PIPELINES: {
      return { ...state, pipelines: action.payload }
    }

    case GET_JOBS: {
      const all = { ...state.all }
      const firstLoad = !Object.keys(all).length
      action.payload.forEach(job => {
        job.notDownloaded = all[job.id] ? all[job.id].notDownloaded : !firstLoad
        all[job.id] = job
      })
      return { ...state, all }
    }

    case MARK_JOB_DOWNLOADED: {
      const jobId = action.payload
      if (state.all[jobId]) {
        const all = { ...state.all }
        all[jobId] = new Job(all[jobId])
        return { ...state, all }
      }
      break
    }

    case RESTART_JOB: {
      const jobId = action.payload
      let job = state.all[jobId]
      if (job) {
        job = new Job(job)
        job.state = Job.Active
        job.notDownloaded = true
        const all = { ...state.all, [job.id]: job }
        return { ...state, all }
      }
      break
    }

    case CANCEL_JOB: {
      const jobId = action.payload
      let job = state.all[jobId]
      if (job) {
        job = new Job(job)
        job.state = Job.Cancelled
        job.notDownloaded = false
        const all = { ...state.all, [job.id]: job }
        return { ...state, all }
      }
      break
    }

    case GET_PROCESSORS: {
      return { ...state, processors: action.payload }
    }

    case QUEUE_FILE_UPLOAD: {
      const files = action.payload
      const uploadFiles = [...state.uploadFiles]
      for (let i = 0; i < files.length; ++i) {
        const file = files[i]
        console.log('Queue: ' + file.name)
        if (file.name.startsWith('.')) continue
        const path = file.webkitRelativePath + file.name
        const index = uploadFiles.findIndex(f => (f.webkitRelativePath + f.name === path))
        console.log('Queued: ' + index + ': ' + path)
        if (index >= 0) {
          uploadFiles[index] = file
        } else {
          uploadFiles.push(file)
        }
      }
      return { ...state, uploadFiles }
    }

    case DEQUEUE_UPLOADED_FILE: {
      const files = action.payload
      const uploadFiles = [...state.uploadFiles]
      for (let i = 0; i < files.length; ++i) {
        const file = files[i]
        const index = uploadFiles.findIndex(f => (f.webkitRelativePath + f.name === file.webkitRelativePath + file.name))
        if (index >= 0) {
          uploadFiles.splice(index, 1)
        }
      }
      return { ...state, uploadFiles }
    }

    case UNAUTH_USER: {
      return initialState
    }
  }

  return state
}
