export default class User {
  constructor ({
      id,
      username,
      email,
      enabled,
      firstName,
      lastName,
      permissionId,
      homeFolderId,
      timeLastLogin,
      loginCount
  }) {
    this.id = id
    this.username = username
    this.email = email
    this.enabled = enabled
    this.firstName = firstName
    this.lastName = lastName
    this.permissionId = permissionId
    this.timeLastLogin = timeLastLogin
    this.loginCount = loginCount
    this.homeFolderId = homeFolderId
  }

  get loginDate () {
    // The server responds with a date of 0 if the user has never logged in
    if (!this.timeLastLogin) {
      return undefined
    }

    return new Date(this.timeLastLogin)
  }

  get name () {
    return (this.firstName + ' ' + this.lastName)
  }
}
