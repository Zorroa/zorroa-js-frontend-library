import { combineReducers } from 'redux'

import auth from './authReducer'
import assets from './assetsReducer'
import folders from './foldersReducer'
import app from './appReducer'
import racetrack from './racetrackReducer'
import permissions from './permissionsReducer'
import jobs from './jobsReducer'
import archivist from './archivistReducer'
import users from './usersReducer'

export default combineReducers({
  app,
  auth,
  assets,
  folders,
  racetrack,
  permissions,
  jobs,
  archivist,
  users
})
