import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

import auth from './authReducer'
import assets from './assetsReducer'

export default combineReducers({
  auth,
  assets,
  form: formReducer
})
