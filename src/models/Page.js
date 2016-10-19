export default class Page {
  constructor ({ from, size, totalCount }) {
    this.from = from >= 0 ? from : 0
    this.size = size > 0 ? size : 10
    this.totalCount = totalCount
  }

  loadedCount () {
    if (!this.from || !this.size || !this.totalCount) {
      return 0
    }
    return this.from + this.size
  }

  isLast () {
    return this.loadedCount() >= this.totalCount
  }
}
