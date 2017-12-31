import AclEntry, { hasAccess } from './Acl'
import Permission from './Permission'

export default class FieldList {
  constructor (json) {
    this.id = json.id
    this.name = json.name
    this.acl = json.acl && json.acl.map(entry => new AclEntry(entry))
    this.fields = json.fields && [...json.fields]
    this.widths = json.widths && {...json.widths}
  }

  hasAccess (user, access) {
    if (!user.permissions) return false
    let isAdministrator = false
    for (let permission of user.permissions) {
      if (permission.type === Permission.GroupType &&
        permission.name === Permission.Administrator) isAdministrator = true
      if (hasAccess(this.acl, permission, access)) return true
    }
    if (isAdministrator) return true
    return false
  }

}
