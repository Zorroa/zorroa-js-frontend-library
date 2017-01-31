export default class AssetFilter {
  constructor (json) {
    if (json) {
      // Make an extra copy to handle deep clones
      json = JSON.parse(JSON.stringify(json))
      this.missing = json.missing   // [string]
      this.terms = json.terms       // {string, [object]}
      this.exists = json.exists     // [string]
      this.range = json.range       // {string, RangeQuery}
      this.scripts = json.scripts   // [AssetScript]
      this.colors = json.colors     // {string, [ColorFilters]
      this.links = json.links       // {string, [object]}
    }
  }

  empty () {
    if (
      (this.missing && this.missing.length) ||
      (this.terms && Object.keys(this.terms).length) ||
      (this.exists && this.exists.length) ||
      (this.range && Object.keys(this.range).length) ||
      (this.scripts && this.scripts.length) ||
      (this.colors && Object.keys(this.colors).length) ||
      (this.links && Object.keys(this.links).length)) {
      return false
    }
    return true
  }

  merge (filter) {
    // Combine each array, removing duplicates and merging terms.
    if (!filter) {
      return
    }
    if (filter.missing) {
      this.missing = this.missing ? union([this.missing, filter.missing]) : [ ...filter.missing ]
    }
    if (filter.exists) {
      this.exists = this.exists ? union([this.exists, filter.exists]) : [ ...filter.exists ]
    }
    if (filter.links) {
      if (this.links) {
        for (let key in filter.links) {
          if (key in filter.links) {
            if (key in this.links) {
              this.links[key] = union([this.links[key], filter.links[key]])
            } else {
              this.links[key] = [ ...filter.links[key] ]
            }
          }
        }
      } else {
        this.links = { ...filter.links }
      }
    }
    if (filter.terms) {
      if (this.terms) {
        for (let key in filter.terms) {
          if (key in filter.terms) {
            if (key in this.terms) {
              this.terms[key] = union([this.terms[key], filter.terms[key]])
            } else {
              this.terms[key] = [ ...filter.terms[key] ]
            }
          }
        }
      } else {
        this.terms = { ...filter.terms }
      }
    }
    if (filter.range) {
      if (this.range) {
        for (let key in filter.range) {
          // No duplicate fields allowed in multiple range queries, let
          // the incoming filter replace anything that's there.
          this.range[key] = filter.range[key]
        }
      } else {
        this.range = { ...filter.range }
      }
    }
  }

  convertToBool () {
    // convert to elasticSearch schema:
    // multiple terms in the aggs fields need to be boolean queries
    if (this.terms && Object.keys(this.terms).length > 1) {
      let terms = this.terms
      delete this.terms
      let boolMust = []
      for (let termKey in terms) {
        boolMust.push({ terms: { [termKey]: terms[termKey] }})
      }
      this.bool = { must: boolMust }
    }
    return this   // Allow chaining
  }
}

// Combine an array of arrays into an array with unique elements
function union (arr) {
  return [ ...new Set([].concat(...arr)) ]
}
