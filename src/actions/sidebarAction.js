import '../constants/actionTypes'

export function setSidebarFoldersOpen (isOpen) {
  return {
    type: (isOpen) ? CLOSE_SIDEBAR_FOLDERS : OPEN_SIDEBAR_FOLDERS,
    payload: isOpen
  }
}

export function setSidebarRacetrackOpen (isOpen) {
  return {
    type: (isOpen) ? CLOSE_SIDEBAR_RACETRACK : OPEN_SIDEBAR_RACETRACK,
    payload: isOpen
  }
}
