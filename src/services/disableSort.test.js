import { disableSort } from './disableSort'

describe('disableSort', () => {
  describe('disableSort()', () => {
    it('Should return true if the field is not sortable', () => {
      const notSortable = disableSort('analysis.faceRecognition.keywords')
      expect(notSortable).toBe(true)
    })

    it('Should return false if the field is sortable', () => {
      const notSortable = disableSort('source.type')
      expect(notSortable).toBe(false)
    })
  })
})
