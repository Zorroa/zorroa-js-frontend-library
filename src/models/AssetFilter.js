export default class AssetFilter {
  constructor (json) {
    if (json) {
      this.missing = json.missing   // [string]
      this.terms = json.terms       // {string, [object]}
      this.exists = json.exists     // [string]
      this.range = json.range       // {string, RangeQuery}
      this.scripts = json.scripts   // [AssetScript]
      this.colors = json.colors     // {string, [ColorFilters]
      this.links = json.links       // {string, [object]}
    }
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
  }
}

// Combine an array of arrays into an array with unique elements
function union (arr) {
  return [ ...new Set([].concat(...arr)) ]
}
