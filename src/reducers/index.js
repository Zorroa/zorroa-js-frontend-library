import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

import auth from './authReducer'
import assets from './assetsReducer'
import folders from './foldersReducer'
import app from './appReducer'
import slivers from './sliversReducer'

export default combineReducers({
  app,
  auth,
  assets,
  folders,
  slivers,
  form: formReducer
})
