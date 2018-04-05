export default class CloudproxySettings {
  constructor({
    startNow,
    archivistUrl,
    hmacKey,
    authUser,
    paths,
    schedule,
    threads,
    pipelineId,
  }) {
    this.startNow = startNow
    this.archivistUrl = archivistUrl
    this.hmacKey = hmacKey
    this.authUser = authUser
    this.paths = paths
    this.schedule = schedule
    this.threads = threads
    this.pipelineId = pipelineId
  }

  isScheduled() {
    return this.startNow || (this.schedule && this.schedule.length)
  }
}
