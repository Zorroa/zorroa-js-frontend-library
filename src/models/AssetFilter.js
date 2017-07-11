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
      this.hamming = json.hamming   // {string, [object]}
      if (json.must) this.must = json.must.map(filter => new AssetFilter(filter))
      if (json.must_not) this.must_not = json.must_not.map(filter => new AssetFilter(filter))
      if (json.should) this.should = json.should.map(filter => new AssetFilter(filter))
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
      (this.links && Object.keys(this.links).length) ||
      (this.hamming && Object.keys(this.hamming).length) ||
      (this.must && this.must.findIndex(f => !f.empty()) >= 0) ||
      (this.must_not && this.must_not.findIndex(f => !f.empty()) >= 0) ||
      (this.should && this.should.findIndex(f => !f.empty()) >= 0)) {
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
    if (filter.hamming) {
      if (this.hamming) {
        for (let key in filter.hamming) {
          if (key === 'field') continue   // FIXME: breaks for mixed similarity fields!
          if (key in filter.hamming) {
            if (key in this.hamming) {
              this.hamming[key] = union([this.hamming[key], filter.hamming[key]])
            } else {
              this.hamming[key] = [ ...filter.hamming[key] ]
            }
          }
        }
      } else {
        this.hamming = { ...filter.hamming }
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
    if (filter.colors) {
      if (this.colors) {
        for (let key in filter.colors) {
          this.colors[key] = filter.colors[key]
        }
      } else {
        this.colors = { ...filter.colors }
      }
    }

    if (filter.scripts) {
      if (this.scripts) {
        this.scripts = [...this.scripts, filter.scripts]
      } else {
        this.scripts = [...filter.scripts]
      }
    }

    if (filter.must) {
      if (this.must) {
        filter.must.forEach(f => { this.must.push(new AssetFilter(f)) })
      } else {
        this.must = filter.must.map(f => new AssetFilter(f))
      }
    }
    if (filter.must_not) {
      if (this.must_not) {
        filter.must_not.forEach(f => { this.must_not.push(new AssetFilter(f)) })
      } else {
        this.must_not = filter.must_not.map(f => new AssetFilter(f))
      }
    }
    if (filter.should) {
      if (this.should) {
        filter.should.forEach(f => { this.should.push(new AssetFilter(f)) })
      } else {
        this.should = filter.should.map(f => new AssetFilter(f))
      }
    }
  }

  convertToBool () {
    // convert to elasticSearch schema:
    // multiple terms in the aggs fields need to be boolean queries
    const count =
      (this.terms ? Object.keys(this.terms).length : 0) +
      (this.range ? Object.keys(this.range).length : 0) +
      (this.exists ? this.exists.length : 0) +
      (this.missing ? this.missing.length : 0) +
      (this.scripts ? this.scripts.length : 0) +
      (this.hamming ? 1 : 0)

    if (count > 1) {
      const must = []
      if (this.terms) {
        let terms = this.terms
        delete this.terms
        for (let termKey in terms) {
          must.push({terms: {[termKey]: terms[termKey]}})
        }
      }
      if (this.range) {
        let range = this.range
        delete this.range
        for (let rangeKey in range) {
          must.push({range: {[rangeKey]: range[rangeKey]}})
        }
      }
      if (this.exists) {
        let exists = this.exists
        delete this.exists
        must.push({exists})
      }
      if (this.missing) {
        let missing = this.missing
        delete this.missing
        must.push({missing})
      }
      if (this.scripts) {
        let scripts = this.scripts
        delete this.scripts
        must.push({scripts})
      }
      this.bool = { must }
    }
    return this   // Allow chaining
  }
}

// Combine an array of arrays into an array with unique elements
function union (arr) {
  return [ ...new Set([].concat(...arr)) ]
}
