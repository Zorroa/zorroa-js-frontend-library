import { resizeByAspectRatio } from './size'

describe('size', () => {
  describe('resizeByAspectRatio()', () => {
    it("Should return a new size that respects the original size's aspect ratio for a portrait orientation", () => {
      const newDimensionsUpscale = resizeByAspectRatio({
        height: 3,
        width: 2,
        newHeight: 6,
      })

      expect(newDimensionsUpscale.height).toBe(6)
      expect(newDimensionsUpscale.width).toBe(4)

      const newDimensionsDownscale = resizeByAspectRatio({
        height: 6,
        width: 4,
        newHeight: 3,
      })

      expect(newDimensionsDownscale.height).toBe(3)
      expect(newDimensionsDownscale.width).toBe(2)
    })

    it("Should return a new size that respects the original size's aspect ratio for a landscape orientation", () => {
      const newDimensionsUpscale = resizeByAspectRatio({
        height: 3,
        width: 2,
        newWidth: 4,
      })

      expect(newDimensionsUpscale.width).toBe(4)
      expect(newDimensionsUpscale.height).toBe(6)

      const newDimensionsDownscale = resizeByAspectRatio({
        height: 6,
        width: 4,
        newWidth: 2,
      })

      expect(newDimensionsDownscale.width).toBe(2)
      expect(newDimensionsDownscale.height).toBe(3)
    })
  })
})
