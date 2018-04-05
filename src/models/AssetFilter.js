export default class AssetFilter {
  constructor(json) {
    if (json) {
      // Make an extra copy to handle deep clones
      json = JSON.parse(JSON.stringify(json))
      this.missing = json.missing // [string]
      this.terms = json.terms // {string, [object]}
      this.exists = json.exists // [string]
      this.range = json.range // {string, RangeQuery}
      this.scripts = json.scripts // [AssetScript]
      this.colors = json.colors // {string, [ColorFilters]
      this.links = json.links // {string, [object]}
      this.similarity = json.similarity // {field, {minScore, hashes[{hash,weight}, ...]}}
      if (json.must)
        this.must = json.must.map(filter => new AssetFilter(filter))
      if (json.must_not)
        this.must_not = json.must_not.map(filter => new AssetFilter(filter))
      if (json.should)
        this.should = json.should.map(filter => new AssetFilter(filter))
    }
  }

  empty() {
    if (
      (this.missing && this.missing.length) ||
      (this.terms && Object.keys(this.terms).length) ||
      (this.exists && this.exists.length) ||
      (this.range && Object.keys(this.range).length) ||
      (this.scripts && this.scripts.length) ||
      (this.colors && Object.keys(this.colors).length) ||
      (this.links && Object.keys(this.links).length) ||
      (this.similarity &&
        Object.keys(this.similarity).length &&
        Object.keys(this.similarity).findIndex(
          key =>
            this.similarity[key].hashes && this.similarity[key].hashes.length,
        ) >= 0) ||
      (this.must && this.must.findIndex(f => !f.empty()) >= 0) ||
      (this.must_not && this.must_not.findIndex(f => !f.empty()) >= 0) ||
      (this.should && this.should.findIndex(f => !f.empty()) >= 0)
    ) {
      return false
    }
    return true
  }

  merge(filter) {
    // Combine each array, removing duplicates and merging terms.
    if (!filter) {
      return
    }
    if (filter.missing) {
      this.missing = this.missing
        ? union([this.missing, filter.missing])
        : [...filter.missing]
    }
    if (filter.exists) {
      this.exists = this.exists
        ? union([this.exists, filter.exists])
        : [...filter.exists]
    }
    if (filter.links) {
      if (this.links) {
        for (let key in filter.links) {
          if (key in filter.links) {
            if (key in this.links) {
              this.links[key] = union([this.links[key], filter.links[key]])
            } else {
              this.links[key] = [...filter.links[key]]
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
              this.terms[key] = [...filter.terms[key]]
            }
          }
        }
      } else {
        this.terms = { ...filter.terms }
      }
    }
    if (filter.similarity) {
      if (this.similarity) {
        for (let key in filter.similarity) {
          if (key in filter.similarity) {
            if (key in this.similarity) {
              // Average min scores and concatenate hashes
              this.similarity[key].minScore =
                0.5 *
                (this.similarity[key].minScore +
                  filter.similarity[key].minScore)
              this.similarity[key].hashes = this.similarity[key].hashes.concat(
                filter.similarity[key].hashes,
              )
            } else {
              this.similarity[key] = { ...filter.similarity[key] }
            }
          }
        }
      } else {
        this.similarity = { ...filter.similarity }
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
        filter.must.forEach(f => {
          this.must.push(new AssetFilter(f))
        })
      } else {
        this.must = filter.must.map(f => new AssetFilter(f))
      }
    }
    if (filter.must_not) {
      if (this.must_not) {
        filter.must_not.forEach(f => {
          this.must_not.push(new AssetFilter(f))
        })
      } else {
        this.must_not = filter.must_not.map(f => new AssetFilter(f))
      }
    }
    if (filter.should) {
      if (this.should) {
        filter.should.forEach(f => {
          this.should.push(new AssetFilter(f))
        })
      } else {
        this.should = filter.should.map(f => new AssetFilter(f))
      }
    }
  }

  convertToBool() {
    // convert to elasticSearch schema:
    // multiple terms in the aggs fields need to be boolean queries
    const count =
      (this.terms ? Object.keys(this.terms).length : 0) +
      (this.range ? Object.keys(this.range).length : 0) +
      (this.exists ? this.exists.length : 0) +
      (this.missing ? this.missing.length : 0) +
      (this.scripts ? this.scripts.length : 0) +
      (this.similarity ? Object.keys(this.similarity).length : 0)

    if (count > 1) {
      const filter = new AssetFilter(this)
      const must = []
      if (filter.terms) {
        let terms = filter.terms
        delete filter.terms
        for (let termKey in terms) {
          must.push({ terms: { [termKey]: terms[termKey] } })
        }
      }
      if (filter.range) {
        let range = filter.range
        delete filter.range
        for (let rangeKey in range) {
          must.push({ range: { [rangeKey]: range[rangeKey] } })
        }
      }
      if (filter.exists) {
        let exists = filter.exists
        delete filter.exists
        must.push({ exists })
      }
      if (filter.missing) {
        let missing = filter.missing
        delete filter.missing
        must.push({ missing })
      }
      if (filter.scripts) {
        let scripts = filter.scripts
        delete filter.scripts
        must.push({ scripts })
      }
      filter.bool = { must }
      return filter // Allow chaining
    }
    return this
  }
}

// Combine an array of arrays into an array with unique elements
function union(arr) {
  return [...new Set([].concat(...arr))]
}
