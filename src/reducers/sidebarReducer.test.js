import sidebarReducer from './sidebarReducer'
import * as ACTION_TYPE from '../constants/actionTypes'

describe('sidebarReducer', () => {
  it('OPEN_SIDEBAR', () => {
    expect(sidebarReducer([], {
      type: ACTION_TYPE.OPEN_SIDEBAR,
      payload: { sidebarKey: 'racetrack', isOpen: true }
    }))
    .toEqual({ 'racetrack': { isOpen: true } })
  })

  it('CLOSE_SIDEBAR', () => {
    expect(sidebarReducer([], {
      type: ACTION_TYPE.CLOSE_SIDEBAR,
      payload: { sidebarKey: 'racetrack', isOpen: false }
    }))
    .toEqual({ 'racetrack': { isOpen: false } })
  })
})
