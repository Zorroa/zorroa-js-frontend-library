export default class Page {
  constructor ({ display, next, number, prev, size, totalCount, totalPages }) {
    this.display = display
    this.number = number > 0 ? number : 1
    this.next = next > 0 ? next : this.number + 1
    this.prev = prev >= 0 ? prev : this.number - 1
    this.size = size > 0 ? size : 10
    this.totalCount = totalCount
    this.totalPages = totalPages
  }

  firstIndex () {
    return (this.number - 1) * this.size
  }

  lastIndex () {
    return this.number * this.size
  }

  loaded () {
    const lastIndex = this.lastIndex()
    return lastIndex > this.totalCount ? this.totalCount : lastIndex
  }

  isLast () {
    return this.loaded() >= this.totalCount
  }
}
