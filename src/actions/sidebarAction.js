import '../constants/actionTypes'

export function setSidebarFoldersSqueeze (isSqueezed) {
  return {
    type: (isSqueezed) ? SQUEEZE_SIDEBAR_FOLDERS : EXPAND_SIDEBAR_FOLDERS,
    payload: isSqueezed
  }
}

export function setSidebarRacetrackSqueeze (isSqueezed) {
  return {
    type: (isSqueezed) ? SQUEEZE_SIDEBAR_RACETRACK : EXPAND_SIDEBAR_RACETRACK,
    payload: isSqueezed
  }
}
