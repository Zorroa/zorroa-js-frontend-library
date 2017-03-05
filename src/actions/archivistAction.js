import { ARCHIVIST_INFO, ARCHIVIST_HEALTH, ARCHIVIST_METRICS } from '../constants/actionTypes'
import { getArchivist } from './authAction'

export function archivistInfo () {
  return dispatch => {
    console.log('Update archivist info')
    getArchivist().get('/info')
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
    getArchivist().get('/health')
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
    getArchivist().get('/metrics')
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
