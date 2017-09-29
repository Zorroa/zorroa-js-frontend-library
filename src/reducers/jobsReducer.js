import {
  EXPORT_ASSETS, IMPORT_ASSETS,
  GET_JOBS, GET_JOB, GET_PIPELINES, ISOLATE_JOB, SELECT_JOBS,
  QUEUE_UPLOAD_FILE_ENTRIES, DEQUEUE_UPLOADED_FILE_ENTRIES,
  MARK_JOB_DOWNLOADED, GET_PROCESSORS,
  RESTART_JOB, CANCEL_JOB, UNAUTH_USER } from '../constants/actionTypes'
import Job from '../models/Job'

export const initialState = {
  all: {},
  processors: [],
  fileEntries: new Map(),
  selectedIds: new Set()
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

    case GET_JOB: {
      const all = { ...state.all }
      const firstLoad = !Object.keys(all).length
      const job = action.payload
      job.notDownloaded = all[job.id] ? all[job.id].notDownloaded : !firstLoad
      all[job.id] = job
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

    case QUEUE_UPLOAD_FILE_ENTRIES: {
      const fileEntries = new Map(state.fileEntries)
      action.payload.forEach(entry => fileEntries.set(entry.fullPath, entry))
      return { ...state, fileEntries }
    }

    case DEQUEUE_UPLOADED_FILE_ENTRIES: {
      const fileEntries = new Map(state.fileEntries)
      action.payload.forEach(entry => fileEntries.delete(entry.fullPath))
      return { ...state, fileEntries }
    }

    case ISOLATE_JOB: {
      return { ...state, isolated: action.payload }
    }

    case SELECT_JOBS: {
      return { ...state, selectedIds: action.payload }
    }

    case UNAUTH_USER: {
      return initialState
    }
  }

  return state
}
