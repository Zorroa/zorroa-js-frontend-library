export class AclEntry {
  constructor (json) {
    this.permissionId = json.permissionId   // int
    this.access = json.access               // int
  }
}

export const ReadAccess = 1
export const WriteAccess = 2
export const ExportAccess = 4

export class Access {
  constructor (json) {
    this.value = json.value
  }
}

export default class Acl {
  constructor (json) {
    this.delegate = json.map(e => (new AclEntry(e)))
  }

  add (entry) {
    this.delegate.push(entry)
  }

  hasAccess (permission, access) {
    for (let entry of this.delegate) {
      if (entry.permissionId === permission &&
        (access.value & entry.access) === access.value) {
        return true
      }
    }
    return false
  }
}
