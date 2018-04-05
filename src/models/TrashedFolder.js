import AclEntry from './Acl'
import User from './User'
import AssetSearch from './AssetSearch'

export default class TrashedFolder {
  constructor(json) {
    this.id = json.id
    this.opId = json.opId
    this.folderId = json.folderId
    this.parentId = json.parentId
    this.name = json.name
    this.user = json.user && new User(json.user)
    this.userDeleted = json.userDeleted
    this.timeCreated = json.timeCreated
    this.timeModified = json.timeModified
    this.timeDeleted = json.timeDeleted
    this.recursive = json.recursive
    this.acl = json.acl && json.acl.map(entry => new AclEntry(entry))
    this.search = json.search && new AssetSearch(json.search)
  }
}
