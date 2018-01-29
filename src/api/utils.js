import { ORIGIN_ITEM } from '../constants/localStorageItems'

export function getOrigin () {
  try {
    return localStorage.getItem(ORIGIN_ITEM)
  } catch (error) {

  }
}

export function handleError (errorResponse) {
  if (typeof errorResponse === 'object' &&
    errorResponse.response &&
    errorResponse.response.data
  ) {
    return Promise.reject(errorResponse.response.data)
  }

  return Promise.reject({
    error: JSON.stringify(errorResponse)
  })
}
