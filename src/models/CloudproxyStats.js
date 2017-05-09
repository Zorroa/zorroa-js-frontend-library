export class CloudproxyProgress {
  constructor ({ total, completed, progress}) {
    this.total = total
    this.completed = completed
    this.progress = progress
  }
}

export default class CloudproxyStats {
  constructor ({ finishTime, startTime, active, currentJobId, lastJobId, progress }) {
    this.finishTime = finishTime
    this.startTime = startTime
    this.active = active
    this.currentJobId = currentJobId
    this.lastJobId = lastJobId
    this.progress = progress && new CloudproxyProgress(progress)
  }
}
