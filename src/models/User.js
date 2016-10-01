export default class User {
  constructor ({ id, username, email, enabled, firstName, lastName }) {
    this.id = id
    this.username = username
    this.email = email
    this.enabled = enabled
    this.firstName = firstName
    this.lastName = lastName
  }

  get name () { return (this.firstName + ' ' + this.lastName) }
}
