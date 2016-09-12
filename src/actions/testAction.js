export const SYNC_CLICK = 'SYNC_CLICK'
export const ASYNC_CLICK = 'ASYNC_CLICK'

export function testActionSync () {
  return {
    type: SYNC_CLICK,
    payload: 'test sync click'
  }
}

export function testActionAsync () {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: ASYNC_CLICK,
        payload: 'test async click'
      })
    }, 500)
  }
}
