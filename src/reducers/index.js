import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import auth from './authReducer'

export default combineReducers({
  auth,
  form: formReducer,
  routing: routerReducer
})
