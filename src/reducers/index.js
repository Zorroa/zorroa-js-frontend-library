import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

import auth from './authReducer'
import assets from './assetsReducer'
import folders from './foldersReducer'

export default combineReducers({
  auth,
  assets,
  folders,
  form: formReducer
})
