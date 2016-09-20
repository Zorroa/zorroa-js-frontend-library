import { SYNC_CLICK, ASYNC_CLICK, FETCH_WEATHER } from '../constants/actionTypes'
import axios from 'axios'

export function exampleActionSync () {
  return {
    type: SYNC_CLICK,
    payload: 'test sync click'
  }
}

export function exampleActionAsync () {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: ASYNC_CLICK,
        payload: 'test async click'
      })
    }, 500)
  }
}

//
export function fetchWeather (city) {
  const ROOT_URL = `http://api.openweathermap.org/data/2.5/forecast?appid=4bcf7b5b50dd85ec11470c0333430493`
  const url = `${ROOT_URL}&q=${city},us`
  const request = axios.get(url)

  return {
    type: FETCH_WEATHER,
    payload: request
  }
}
