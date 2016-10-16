import React from 'react'

export default class Filter {
  constructor ({ icon, label, body, args }) {
    this.icon = icon
    this.label = label
    this.body = body
    this.args = args
  }

  static filtersForQuery (query) {
    const filters = []
    if (SimpleSearchFilter.matchesQuery(query)) {
      filters.push(new SimpleSearchFilter(query.query))
    }
    return filters
  }
}

export class SimpleSearchFilter extends Filter {
  constructor (query) {
    const icon = <span className="icon-search" />
    const label = 'SIMPLE SEARCH'
    const body = SimpleSearchFilter.renderBody()
    const args = { query }
    super({ icon, label, body, args })
  }

  static renderBody () {
    return (
      <div className="simple-search">
        <input className="simple-search-query" placeholder="Search..." />
        <div className="simple-search-radio">
          <form>
            <input type="radio" name="all-fields" value="all" />All fields
            <input type="radio" name="all-fields" value="some" />Some fields
          </form>
        </div>
      </div>
    )
  }

  static matchesQuery (query) {
    return query && query.query && query.query.length
  }
}
