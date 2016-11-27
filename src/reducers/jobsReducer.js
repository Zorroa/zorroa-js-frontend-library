import { EXPORT_ASSETS, GET_JOBS } from '../constants/actionTypes'
import Job, { JobFilter } from '../models/Job'

export const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPORT_ASSETS: {
      let activeExports = state.activeExports || []
      activeExports.push(action.payload)
      return { ...state, activeExports }
    }

    case GET_JOBS: {
      let activeExports = action.payload.filter(job => (job.type === JobFilter.Export && job.state === Job.Active))
      let finishedExports = action.payload.filter(job => (job.type === JobFilter.Export && job.state === Job.Finished))
      if (state.activeExports) activeExports.concat(state.activeExports)
      if (state.finishedExports) finishedExports.concat(state.finishedExports)
      activeExports = activeExports.slice(0, 10)
      finishedExports = finishedExports.slice(0, 10)
      return { ...state, activeExports, finishedExports }
    }
  }

  return state
}
