import AssetFilter from './AssetFilter'

export default class AssetSearch {
  constructor (json) {
    if (json) {
      this.scroll = json.scroll   // {string timeout="1m", string id}
      this.query = json.query     // string:           Keyword search string
      this.queryFields = json.queryFields // {string, number}: Map of fields and boost values
      this.fields = json.fields   // [string]:         Fields to return for each asset
      this.filter = json.filter   // AssetFilter:      Filter applied to keyword search
      this.postFilter = json.postFilter   // AssetFilter: Filter for assets after aggs
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
    if (assetSearch.fuzzy) {
      this.fuzzy = this.fuzzy || assetSearch.fuzzy
    }
    if (assetSearch.queryFields) {
      for (let key in assetSearch.queryFields) {
        if (assetSearch.queryFields.hasOwnProperty(key)) {
          if (this.queryFields.hasOwnProperty(key)) {
            this.queryFields[key] = union([this.queryFields[key], assetSearch.queryFields[key]])
          } else {
            this.queryFields[key] = { ...assetSearch.queryFields[key] }
          }
        }
      }
    }
    if (assetSearch.aggs) {
      this.aggs = this.aggs ? { ...this.aggs, ...assetSearch.aggs } : { ...assetSearch.aggs }
    }
  }

  equals (assetSearch) {
    return JSON.stringify(this, equalsReplacer) === JSON.stringify(assetSearch, equalsReplacer)
  }
}

// Combine an array of arrays into an array with unique elements
function union (arr) {
  return [ ...new Set([].concat(...arr)) ]
}

// Skip over from & size for equality comparison
function equalsReplacer (key, value) {
  if (key === 'from' || key === 'size') {
    return undefined
  }
  return value
}
