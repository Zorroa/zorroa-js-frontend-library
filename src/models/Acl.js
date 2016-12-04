// An access control list (acl) is a list of AclEntry.
// Each folder has an acl to manage user access.
// Users have a list of Permissions. Each Permission.id
// is compared against the folder's acl to check if at least
// one valid permission exists for the requested action.
export default class AclEntry {
  static ReadAccess = 1
  static WriteAccess = 2
  static ExportAccess = 4

  constructor (json) {
    this.permissionId = json.permissionId   // int
    this.access = json.access               // int
  }
}

// Utility method to check for permission
export function hasAccess (acl, permission, access) {
  // Empty Acl gets read access?
  if (acl && !acl.length && access === AclEntry.ReadAccess) {
    return true
  }
  for (let entry of acl) {
    if (entry.permissionId === permission.id &&
      (access & entry.access) === access) {
      return true
    }
  }
  return false
}

export function isPublic (acl, user, userPermissions) {
  return acl && userPermissions &&
    acl.some(aclEntry => {
      const whitelist = [ 'administrator', 'manager' ]
      const index = userPermissions.findIndex(permission => (permission.id === aclEntry.permissionId))
      return index < 0 ||
        (userPermissions[index].type === 'user' && userPermissions[index].name !== user.username) ||
        (userPermissions[index].type === 'group' && whitelist.findIndex(name => (name === userPermissions[index].name)) < 0)
    })
}
