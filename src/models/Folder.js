import AclEntry, { hasAccess } from './Acl'
import User from './User'
import AssetSearch from './AssetSearch'

export default class Folder {
  static ROOT_ID = 0

  static Filters = {
    browsing: folder => { return folder.isDyhi() },
    smart: folder => { return !folder.isDyhi() && folder.search },
    simple: folder => { return !folder.isDyhi() && !folder.search }
  }

  constructor (json) {
    if (json) {
      this.id = json.id
      this.parentId = json.parentId
      this.dyhiId = json.dyhiId
      this.name = json.name
      this.user = json.user && new User(json.user)
      this.timeCreated = json.timeCreated
      this.timeModified = json.timeModified
      this.recursive = json.recursive
      this.dyhiRoot = json.dyhiRoot
      this.acl = json.acl && json.acl.map(entry => (new AclEntry(entry)))
      this.search = json.search && new AssetSearch(json.search)
      this.childIds = null // set of childIds.
    }
  }

  isDyhi () {
    return this.dyhiId || this.dyhiRoot
  }

  hasAccess (user, access) {
    if (this.user && user && this.user.id === user.id) return true
    if (!user.permissions) return false
    for (let permission of user.permissions) {
      if (hasAccess(this.acl, permission, access)) return true
    }
    return false
  }

  isDropTarget (user) {
    if (this.search && !this.search.empty()) return false
    return this.hasAccess(user, AclEntry.WriteAccess)
  }
}
