export default class Folder {
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
    }
  }
}
