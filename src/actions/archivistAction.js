import { ARCHIVIST_INFO, ARCHIVIST_HEALTH, ARCHIVIST_METRICS } from '../constants/actionTypes'
import { archivistGet } from './authAction'

export function archivistInfo () {
  return dispatch => {
    console.log('Update archivist info')
    archivistGet(dispatch, '/info')
      .then(response => {
        dispatch({
          type: ARCHIVIST_INFO,
          payload: response.data
        })
      })
      .catch(error => {
        console.error('Error getting info: ' + error)
      })
  }
}

export function archivistHealth () {
  return dispatch => {
    console.log('Update archivist health')
    archivistGet(dispatch, '/health')
      .then(response => {
        dispatch({
          type: ARCHIVIST_HEALTH,
          payload: response.data
        })
      })
      .catch(error => {
        console.error('Error getting health: ' + error)
      })
  }
}

export function archivistMetrics () {
  return dispatch => {
    console.log('Update archivist metrics')
    archivistGet(dispatch, '/metrics')
      .then(response => {
        dispatch({
          type: ARCHIVIST_METRICS,
          payload: response.data
        })
      })
      .catch(error => {
        console.error('Error getting metrics: ' + error)
      })
  }
}
