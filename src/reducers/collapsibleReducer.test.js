import collapsibleReducer from './collapsibleReducer'
import * as ACTION_TYPE from '../constants/actionTypes'

describe('collapsibleReducer', () => {
  it('OPEN_COLLAPSIBLE', () => {
    expect(collapsibleReducer([], {
      type: ACTION_TYPE.OPEN_COLLAPSIBLE,
      payload: { collapsibleKey: 'folders', isOpen: true }
    }))
    .toEqual({ 'folders': { isOpen: true } })
  })

  it('CLOSE_COLLAPSIBLE', () => {
    expect(collapsibleReducer([], {
      type: ACTION_TYPE.CLOSE_COLLAPSIBLE,
      payload: { collapsibleKey: 'folders', isOpen: false }
    }))
    .toEqual({ 'folders': { isOpen: false } })
  })
})
