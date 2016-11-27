import User from './User'

export default class Job {
  static Active = 'Active'
  static Cancelled = 'Cancelled'
  static Finished = 'Finished'
  static Expired = 'Expired'

  static MaxAssets = 500

  constructor ({ id, name, type, user, state, args }) {
    this.id = id
    this.name = name
    this.type = type
    this.user = user && new User(user)
    this.state = state
    this.args = args
  }

  isFinished () {
    return this.state === Job.Finished
  }

  exportStream (protocol, host) {
    if (this.isFinished()) {
      return `${protocol}//${host}:8066/api/v1/exports/${this.id}/_stream`
    }
  }
}

export class JobFilter {
  static Import = 'Import'
  static Export = 'Export'
  static Batch = 'Batch'

  constructor ({ state, type, userId }) {
    this.state = state
    this.type = type
    this.userId = userId
  }
}
