import * as types from '../constants/actionTypes'
import * as actions from './exampleAction'

describe('exampleActions', () => {
  describe('exampleActionSync', () => {
    it('should create a synchronous action', () => {
      const expectedAction = {
        type: types.SYNC_CLICK,
        payload: 'test sync click'
      }

      expect(actions.exampleActionSync()).toEqual(expectedAction)
    })
  })

  describe('exampleAsyncAction', () => {
    xit('should create an asynchronous action', () => {
      const expectedAction = {
        type: types.ASYNC_CLICK,
        payload: 'test sync click'
      }
    })
  })
})

// import * as actions from '../../actions/TodoActions'
// import * as types from '../../constants/ActionTypes'
//
// describe('actions', () => {
//   it('should create an action to add a todo', () => {
//     const text = 'Finish docs'
//     const expectedAction = {
//       type: types.ADD_TODO,
//       text
//     }
//     expect(actions.addTodo(text)).toEqual(expectedAction)
//   })
// })
