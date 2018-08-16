/* eslint-env jest */

import AssetSearch from './AssetSearch'
import AssetFilter from './AssetFilter'

describe('AssetSearch()', () => {
  describe('toJSON()', () => {
    describe('When the filter is not set', () => {
      it('Should remove the filter', () => {
        const layout = new AssetSearch({
          query: 'smoke',
          filter: null,
        })
        const filter = layout.toJSON().filter
        expect(filter).toBe(undefined)
      })
    })

    describe('When the filter is an empty object', () => {
      it('Should remove the filter', () => {
        const layout = new AssetSearch({
          query: 'fire',
          filter: {},
        })
        const filter = layout.toJSON().filter
        expect(filter).toBe(undefined)
      })
    })

    describe('When the filter has data', () => {
      it('Should keep the filter', () => {
        const layout = new AssetSearch({
          query: 'explosion',
          filter: new AssetFilter({
            terms: {
              _id: 'a',
            },
          }),
        })
        const filter = layout.toJSON().filter
        expect(filter).not.toBe(undefined)
      })
    })
  })
})
