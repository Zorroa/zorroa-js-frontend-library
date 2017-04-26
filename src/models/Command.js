export default class Command {
  constructor ({ id, user, type, args, state, totalCount, successCount, errorCount, message }) {
    this.id = id
    this.user = user
    this.type = type
    this.args = args
    this.state = state
    this.totalCount = totalCount
    this.successCount = successCount
    this.errorCount = errorCount
    this.message = message
  }
}
