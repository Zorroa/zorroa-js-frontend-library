import {
  LOAD_USERS,
  LOAD_USERS_ERROR,
  LOAD_USERS_SUCCESS,
  DISABLE_USER,
  DISABLE_USER_ERROR,
  DISABLE_USER_SUCCESS,
  ENABLE_USER,
  ENABLE_USER_ERROR,
  ENABLE_USER_SUCCESS,
  BUILD_USER,
  RESET_USER,
  CREATE_USER,
  CREATE_USER_ERROR,
  CREATE_USER_SUCCESS,
  LOAD_USER,
  LOAD_USER_ERROR,
  LOAD_USER_SUCCESS,
  UPDATE_USER,
  UPDATE_USER_ERROR,
  UPDATE_USER_SUCCESS,
} from '../constants/actionTypes'
import api from '../api'

export function loadUsers() {
  return dispatch => {
    dispatch({
      type: LOAD_USERS,
    })

    api.users.get().then(
      response => {
        dispatch({
          type: LOAD_USERS_SUCCESS,
          payload: response,
        })
      },
      errorResponse => {
        dispatch({
          type: LOAD_USERS_ERROR,
          payload: errorResponse.data,
        })
      },
    )
  }
}

export function loadUser(userId) {
  return dispatch => {
    dispatch({
      type: LOAD_USER,
      payload: userId,
    })

    api
      .user(userId)
      .get()
      .then(
        user => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            payload: user,
          })
        },
        errorResponse => {
          dispatch({
            type: LOAD_USER_ERROR,
            payload: errorResponse,
          })
        },
      )
  }
}

export function disableUser(userId) {
  return dispatch => {
    dispatch({
      type: DISABLE_USER,
      payload: userId,
    })

    api
      .user(userId)
      .enabled.put(false)
      .then(
        response => {
          dispatch({
            type: DISABLE_USER_SUCCESS,
            payload: userId,
          })
        },
        errorResponse => {
          console.log(errorResponse)
          dispatch({
            type: DISABLE_USER_ERROR,
            payload: userId,
          })
        },
      )
  }
}

export function enableUser(userId) {
  return dispatch => {
    dispatch({
      type: ENABLE_USER,
      payload: userId,
    })

    api
      .user(userId)
      .enabled.put(true)
      .then(
        response => {
          dispatch({
            type: ENABLE_USER_SUCCESS,
            payload: userId,
          })
        },
        () => {
          dispatch({
            type: ENABLE_USER_ERROR,
            payload: userId,
          })
        },
      )
  }
}

export function buildUser(user) {
  return dispatch => {
    dispatch({
      type: BUILD_USER,
      payload: user,
    })
  }
}

export function resetUser() {
  return dispatch => {
    dispatch({
      type: RESET_USER,
      payload: {},
    })
  }
}

export function createUser(user) {
  return dispatch => {
    dispatch({
      type: CREATE_USER,
      payload: user,
    })

    api.users.post(user).then(
      response => {
        dispatch({
          type: CREATE_USER_SUCCESS,
          payload: response,
        })
      },
      errorResponse => {
        dispatch({
          type: CREATE_USER_ERROR,
          payload: errorResponse,
        })
      },
    )
  }
}

function updateUserPermissions(user) {
  if (Array.isArray(user.permissions) === false) {
    // Nothing to do here, just resolve
    return Promise.resolve()
  }

  return api.user(user.id).permissions.put(user.permissions)
}

function updateUserProfile(user) {
  return api.user(user.id).profile.put({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })
}

function updateUserPassword(user) {
  if (user.password === undefined) {
    // There's no password to change, so just carry on about our business
    return Promise.resolve()
  }

  return api.user(user.id).password.put(user.password, user.oldPassword)
}

export function updateUser(user) {
  const userUpdatePromises = Promise.all([
    updateUserPermissions(user),
    updateUserProfile(user),
    updateUserPassword(user),
  ])

  return dispatch => {
    dispatch({
      type: UPDATE_USER,
      payload: user,
    })

    userUpdatePromises
      .then(() => {
        // Whew, everything got updated. Request the user object for a single source of truth
        return api.user(user.id).get()
      })
      .then(userResponse => {
        dispatch({
          type: UPDATE_USER_SUCCESS,
          payload: userResponse,
        })
      })
      .catch(errorResponse => {
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: errorResponse,
        })
      })
  }
}
