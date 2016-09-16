import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import test from './testReducer'

export default combineReducers({
  test,
  routing: routerReducer
})
