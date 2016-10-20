import { MODAL } from '../constants/actionTypes'

export function updateModal ({title, footer, content}) {
  return {
    type: MODAL,
    payload: {title, footer, content}
  }
}
