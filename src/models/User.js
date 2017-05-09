export default class User {
  constructor ({ id, username, email, enabled, firstName, lastName, permissionId, homeFolderId }) {
    this.id = id
    this.username = username
    this.email = email
    this.enabled = enabled
    this.firstName = firstName
    this.lastName = lastName
    this.permissionId = permissionId
    this.homeFolderId = homeFolderId
  }

  get name () { return (this.firstName + ' ' + this.lastName) }
}
