import AssetFilter from './AssetFilter'

export default class AssetSearch {

  static autoPageSize = 100

  constructor (json) {
    if (json && 'query' in json && !('fuzzy' in json)) {
      throw new Error('fuzzy is required when searching with a query')
    }

    if (json) {
      // Make an extra copy to handle deep clones
      json = JSON.parse(JSON.stringify(json))
      this.scroll = json.scroll   // {string timeout="1m", string id}
      this.query = json.query     // string:           Keyword search string
      this.queryFields = json.queryFields // {string, number}: Map of fields and boost values
      this.fields = json.fields   // [string]:         Fields to return for each asset
      this.filter = json.filter && new AssetFilter(json.filter) // pre-agg (fast)
      this.postFilter = json.postFilter && new AssetFilter(json.postFilter) // post-agg (slow)
      this.order = json.order     // {string field, bool ascending}
      this.size = json.size       // int:              Number of assets to return
      this.from = json.from       // int:              First asset index to return
      this.fuzzy = json.fuzzy     // bool:             Enable fuzzy search
      this.aggs = json.aggs       // {string, {string, object}}
    }
  }

  merge (assetSearch) {
    if (!assetSearch) {
      return
    }
    // FIXME: How should we merge order, scroll, from & size?
    if (assetSearch.query) {
      this.query = this.query ? `(${this.query}) AND (${assetSearch.query})` : assetSearch.query
    }
    if (assetSearch.fields) {
      this.fields = this.fields ? union([this.fields, assetSearch.fields]) : [ ...assetSearch.fields ]
    }
    if (assetSearch.filter) {
      if (this.filter) {
        this.filter.merge(assetSearch.filter)
      } else {
        this.filter = new AssetFilter(assetSearch.filter)
      }
    }
    if (assetSearch.postFilter) {
      if (this.postFilter) {
        this.postFilter.merge(assetSearch.postFilter)
      } else {
        this.postFilter = new AssetFilter(assetSearch.postFilter)
      }
    }
    this.fuzzy = !!(this.fuzzy || assetSearch.fuzzy)
    if (assetSearch.queryFields) {
      if (!this.queryFields) {
        this.queryFields = { ...assetSearch.queryFields }
      } else {
        for (let key in assetSearch.queryFields) {
          if (assetSearch.queryFields.hasOwnProperty(key)) {
            if (this.queryFields && this.queryFields.hasOwnProperty(key)) {
              this.queryFields[key] = union([this.queryFields[key], assetSearch.queryFields[key]])
            } else {
              this.queryFields[key] = assetSearch.queryFields[key]
            }
          }
        }
      }
    }
    if (assetSearch.aggs) {
      this.aggs = this.aggs ? { ...this.aggs, ...assetSearch.aggs } : { ...assetSearch.aggs }
    }
  }

  equals (assetSearch, skip) {
    const s = skip || new Set(['from', 'size', 'scroll'])
    const replacer = (key, value) => (s.has(key) ? undefined : value)
    return JSON.stringify(new AssetSearch(this), replacer) === JSON.stringify(new AssetSearch(assetSearch), replacer)
  }

  empty () {
    if (this.query && this.query.length) return false
    if (this.filter && !this.filter.empty()) return false
    if (this.postFilter && !this.postFilter.empty()) return false
    return true
  }

  emptyFilters () {
    if (this.filter && !this.filter.empty()) return false
    if (this.postFilter && !this.postFilter.empty()) return false
    return true
  }

  missingField (fields) {
    if (!fields) return false
    if (!this.fields) return true
    for (let i = 0; i < fields.length; ++i) {
      const field = fields[i]
      if (this.fields.findIndex(f => (f === field)) < 0) return true
    }
    return false
  }
}

// Combine an array of arrays into an array with unique elements
function union (arr) {
  return [ ...new Set([].concat(...arr)) ]
}
