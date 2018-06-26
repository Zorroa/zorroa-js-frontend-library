/* eslint-env jest */

import Asset from './Asset'

describe('Asset()', () => {
  describe('height()', () => {
    it('Should return the height', () => {
      const asset = new Asset({
        id: '1',
        document: {
          media: {
            height: 120,
          },
        },
      })
      expect(asset.height()).toBe(120)
    })

    it('Should not crash if the height is unavailable', () => {
      const asset = new Asset({
        id: '1',
        document: {},
      })
      expect(asset.height()).toBe(undefined)
    })
  })

  describe('height()', () => {
    it('Should return the height', () => {
      const asset = new Asset({
        id: '2',
        document: {
          media: {
            width: 120,
          },
        },
      })
      expect(asset.width()).toBe(120)
    })

    it('Should not crash if the height is unavailable', () => {
      const asset = new Asset({
        id: '2',
        document: {},
      })
      expect(asset.width()).toBe(undefined)
    })
  })
})
