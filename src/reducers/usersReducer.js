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
  UPDATE_USER_SUCCESS
} from '../constants/actionTypes'
import User from '../models/User'

const initialState = {
  isLoadingUsers: false,
  loadUsersError: false,
  users: [],
  usersBeingDisabled: [],
  usersBeingEnabled: [],
  usersWithDisablementError: [],
  isCreatingUser: false,
  createUserError: false,
  createUserErrorMessage: '',
  user: {},
  isLoadingUser: false,
  isUpdatingUser: false,
  updateUserError: false
}

function removeFromArray (array, item) {
  if (typeof item === 'object') {
    console.warn('Remove from array may behave unpredictiblity with objects')
  }

  return array
    .map(element => element === item ? undefined : element)
    .filter(element => element !== undefined)
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS: {
      const isLoadingUsers = true
      const loadUsersError = false
      return {
        ...state,
        isLoadingUsers,
        loadUsersError
      }
    }
    case LOAD_USERS_ERROR: {
      const isLoadingUsers = false
      const loadUsersError = true
      return {
        ...state,
        isLoadingUsers,
        loadUsersError
      }
    }
    case LOAD_USERS_SUCCESS: {
      const isLoadingUsers = false
      const loadUsersError = false
      const users = action.payload
      return {
        ...state,
        isLoadingUsers,
        loadUsersError,
        users
      }
    }
    case DISABLE_USER: {
      // Using array.concat to adhere with non-mutability of state
      const usersBeingDisabled = state.usersBeingDisabled.concat([action.payload])
      return {
        ...state,
        usersBeingDisabled
      }
    }
    case DISABLE_USER_ERROR: {
      const usersBeingDisabled = removeFromArray(state.usersBeingEnabled, action.payload)
      return {
        ...state,
        usersBeingDisabled
      }
    }
    case DISABLE_USER_SUCCESS: {
      const usersBeingDisabled = removeFromArray(state.usersBeingEnabled, action.payload)

      const users = state.users.map(user => {
        if (user.id !== action.payload) {
          return user
        }

        const newUser = new User(user)
        newUser.enabled = false

        return newUser
      })
      return {
        ...state,
        usersBeingDisabled,
        users
      }
    }
    case ENABLE_USER: {
      // Using array.concat to adhere with non-mutability of state
      const usersBeingEnabled = state.usersBeingEnabled.concat([action.payload])
      return {
        ...state,
        usersBeingEnabled
      }
    }
    case ENABLE_USER_ERROR: {
      const usersBeingEnabled = removeFromArray(state.usersBeingEnabled, action.payload)
      return {
        ...state,
        usersBeingEnabled
      }
    }
    case ENABLE_USER_SUCCESS: {
      const usersBeingEnabled = removeFromArray(state.usersBeingEnabled, action.payload)
      const users = state.users.map(user => {
        if (user.id !== action.payload) {
          return user
        }

        const newUser = new User(user)
        newUser.enabled = true

        return newUser
      })
      return {
        ...state,
        usersBeingEnabled,
        users
      }
    }
    case BUILD_USER: {
      return {
        ...state,
        user: Object.assign({}, state.user, action.payload)
      }
    }
    case RESET_USER: {
      return {
        ...state,
        user: action.payload
      }
    }
    case CREATE_USER: {
      const isCreatingUser = true
      const createUserError = false
      return {
        ...state,
        isCreatingUser,
        createUserError
      }
    }
    case CREATE_USER_ERROR: {
      const isCreatingUser = false
      const createUserError = true
      let createUserErrorMessage = 'Unable to save the user. Ensure all data is valid and that your network works.'
      console.log(action)
      if (action.payload.exception === 'com.zorroa.sdk.client.exception.DuplicateElementException') {
        createUserErrorMessage = action.payload.message
      }

      return {
        ...state,
        isCreatingUser,
        createUserError,
        createUserErrorMessage
      }
    }
    case CREATE_USER_SUCCESS: {
      const createUserError = false
      const isCreatingUser = false
      const users = state.users.concat([action.payload])
      const user = {}
      return {
        ...state,
        isCreatingUser,
        users,
        user,
        createUserError
      }
    }
    case LOAD_USER: {
      const isLoadingUser = true
      const loadUserError = false
      return {
        ...state,
        isLoadingUser,
        loadUserError
      }
    }
    case LOAD_USER_ERROR: {
      const isLoadingUser = false
      const loadUserError = true

      return {
        ...state,
        isLoadingUser,
        loadUserError
      }
    }
    case LOAD_USER_SUCCESS: {
      const loadUserError = false
      const isLoadingUser = false
      const userPayload = action.payload
      const users = state.users.map(user => {
        if (userPayload.id === user.id) {
          return userPayload
        }

        return user
      })

      return {
        ...state,
        isLoadingUser,
        users,
        user: userPayload,
        loadUserError
      }
    }
    case UPDATE_USER: {
      const isUpdatingUser = true
      const updateUserError = false

      return {
        ...state,
        isUpdatingUser,
        updateUserError
      }
    }
    case UPDATE_USER_ERROR: {
      const isUpdatingUser = false
      const updateUserError = true
      return {
        ...state,
        isUpdatingUser,
        updateUserError
      }
    }
    case UPDATE_USER_SUCCESS: {
      const isUpdatingUser = false
      const updateUserError = false
      return {
        ...state,
        isUpdatingUser,
        updateUserError
      }
    }

  }

  return state
}
