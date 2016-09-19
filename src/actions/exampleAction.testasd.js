import {exampleActionSync, exampleActionAsync, ASYNC_CLICK, SYNC_CLICK} from './exampleActions'

xdescribe('exampleActions: exampleActionSync', () => {
  it('should create a synchronous action', () => {
    const text = 'Sample Message'
    const expectedAction = {
      type: SYNC_CLICK,
      payload: text
    }

    test(exampleActionSync(text)).toBe(expectedAction)
  })
})

xdescribe('exampleActions: exampleActionSync', () => {
  it('should create an asynchronous action', () => {
    console.log(exampleActionAsync)
    console.log(ASYNC_CLICK)
  })
})
