import {
  ARCHIVIST_INFO,
  ARCHIVIST_HEALTH,
  ARCHIVIST_METRICS,
  ARCHIVIST_SETTING,
  ARCHIVIST_SETTINGS,
} from '../constants/actionTypes'
import { archivistGet, archivistPut } from './authAction'

export function archivistInfo() {
  return dispatch => {
    archivistGet(dispatch, '/actuator/info')
      .then(response => {
        dispatch({
          type: ARCHIVIST_INFO,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting info: ' + error)
      })
  }
}

export function archivistHealth() {
  return dispatch => {
    console.log('Update archivist health')
    archivistGet(dispatch, '/actuator/health')
      .then(response => {
        dispatch({
          type: ARCHIVIST_HEALTH,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting health: ' + error)
      })
  }
}

export function archivistMetrics() {
  return dispatch => {
    console.log('Update archivist metrics')
    archivistGet(dispatch, '/actuator/metrics')
      .then(response => {
        dispatch({
          type: ARCHIVIST_METRICS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting metrics: ' + error)
      })
  }
}

export function archivistSetting(name) {
  return dispatch => {
    archivistGet(dispatch, `/api/v1/settings/${name}`)
      .then(response => {
        dispatch({
          type: ARCHIVIST_SETTING,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting setting ' + name + ': ' + error)
      })
  }
}

export function archivistSettings() {
  return dispatch => {
    console.log('Get all archivist settings')
    archivistGet(dispatch, '/api/v1/settings')
      .then(response => {
        dispatch({
          type: ARCHIVIST_SETTINGS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error getting all settings: ' + error)
      })
  }
}

export function setArchivistSettings(settings) {
  return dispatch => {
    console.log('Set archivist settings: ' + JSON.stringify(settings))
    archivistPut(dispatch, '/api/v1/settings', settings)
      .then(response => {
        dispatch({
          type: ARCHIVIST_SETTINGS,
          payload: response.data,
        })
      })
      .catch(error => {
        console.error('Error setting archivist settings: ' + error)
      })
  }
}
