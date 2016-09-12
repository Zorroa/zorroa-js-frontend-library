export const SPINNER = 'SPINNER'
export const MODAL = 'MODAL'

export function toggleSpinner (showSpinner) {
  return {
    type: SPINNER,
    payload: showSpinner
  }
}

/*
  content.title
  content.content
  content.size
  content.children
*/
export function updateModal (content) {
  return {
    type: MODAL,
    payload: content
  }
}
