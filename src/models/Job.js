import User from './User'

export default class Job {
  // Types
  static Import = 'Import'
  static Export = 'Export'
  static Batch = 'Batch'

  // States
  static Waiting = 'Waiting'
  static Active = 'Active'
  static Cancelled = 'Cancelled'
  static Finished = 'Finished'
  static Expired = 'Expired'

  static MaxAssets = 500

  constructor ({ id, name, type, user, state, args, timeStarted, timeUpdated, tasks, stats, progress }) {
    this.id = id
    this.name = name
    this.type = type
    this.user = user && new User(user)
    this.state = state
    this.args = args
    this.timeStarted = timeStarted
    this.timeUpdated = timeUpdated
    this.tasks = tasks && new JobTasks(tasks)
    this.stats = stats && new JobStats(stats)
    this.progress = progress && new JobProgress(progress)
  }

  isFinished () {
    return this.state === Job.Finished
  }

  errorCount () {
    return (this.stats && this.stats.frameErrorCount) || (this.tasks && this.tasks.failed)
  }

  warningCount () {
    return (this.stats && this.stats.frameWarningCount) || (this.tasks && this.tasks.skipped)
  }

  exportStream (origin) {
    if (this.type === Job.Export && this.isFinished()) {
      return `${origin}/api/v1/exports/${this.id}/_stream`
    }
  }

  percentCompleted () {
    if (this.progress) return this.progress.percentComplete()
    if (this.tasks) return this.tasks.percentCompleted()
    return -1
  }

  timeElapsed () {
    return this.timeUpdated - this.timeStarted
  }

  timeRemaining () {
    if (!this.timeUpdated || !this.timeStarted || this.timeUpdated < this.timeStarted) return -1
    const elapsed = this.timeElapsed()
    if (elapsed < 0) return -1
    if (!this.tasks) return -1
    const pct = this.tasks.percentCompleted()
    if (pct <= 0) return -1
    return 100 * elapsed / pct
  }

  timeRemainingString () {
    const time = this.timeRemaining()
    if (time < 0) return 'Unknown'
    const s = Math.floor(time / 1000)
    if (s < 60) return `${s} sec`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m} min, ${Math.floor(s - 60 * m)} sec`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} hrs, ${Math.floor(m - 60 * h)} min`
    const d = Math.floor(h / 24)
    return `${d} days, ${Math.floor(h - 24 * d)} hrs`
  }
}

export function jobsOfType (jobs, type) {
  if (!jobs) return
  return Object.keys(jobs).map(key => jobs[key]).filter(job => (job.type === type))
}

export function countOfJobsOfType (jobs, type) {
  if (!jobs) return 0
  return jobsOfType(jobs, type).length
}

export class JobFilter {
  constructor ({ state, type, userId }) {
    this.state = state
    this.type = type
    this.userId = userId
  }
}

export class JobProgress {
  constructor ({ failed, running, skipped, success, total, waiting }) {
    this.failed = failed
    this.running = running
    this.skipped = skipped
    this.success = success
    this.total = total
    this.waiting = waiting
  }

  percentComplete () {
    return this.failed + this.skipped + this.success
  }
}

export class JobTasks {
  constructor ({ total, completed, waiting, queued, running, success, failure, skipped }) {
    this.total = total
    this.completed = completed
    this.waiting = waiting
    this.queued = queued
    this.running = running
    this.success = success
    this.failure = failure
    this.skipped = skipped
  }

  percentCompleted () {
    if (!this.completed || !this.total) return -1
    return 100 * this.completed / this.total
  }
}

export class JobStats {
  constructor ({ frameSuccessCount, frameErrorCount, frameWarningCount, frameTotalCount }) {
    this.frameSuccessCount = frameSuccessCount
    this.frameErrorCount = frameErrorCount
    this.frameWarningCount = frameWarningCount
    this.frameTotalCount = frameTotalCount
  }
}
