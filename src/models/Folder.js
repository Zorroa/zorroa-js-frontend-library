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
      this.userCreated = json.userCreated
      this.userModified = json.userModified
      this.timeCreated = json.timeCreated
      this.timeModified = json.timeModified
      this.recursive = json.recursive
      this.dyhiRoot = json.dyhiRoot
      this.acl = json.acl
      this.search = json.search
      this.childIds = null // set of childIds.
    }
  }

  isDyhi () {
    return this.dyhiId || this.dyhiRoot
  }
}
