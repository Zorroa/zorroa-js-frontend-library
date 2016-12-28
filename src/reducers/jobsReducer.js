import {
  EXPORT_ASSETS, IMPORT_ASSETS,
  GET_JOBS, GET_PIPELINES,
  MARK_JOB_DOWNLOADED, GET_PROCESSORS,
  RESTART_JOB, CANCEL_JOB } from '../constants/actionTypes'
import Job from '../models/Job'

export const initialState = { all: {}, processors: [] }

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
  }

  return state
}
