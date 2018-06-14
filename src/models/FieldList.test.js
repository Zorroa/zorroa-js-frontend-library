/* eslint-env jest */

import FieldList from './FieldList'

describe('FieldList()', () => {
  describe('isEqual()', () => {
    describe('When the field list and the name are the same', () => {
      it('Should return true', () => {
        const fieldList1 = new FieldList({
          id: '1',
          name: 'Joe Default',
          fields: ['date'],
        })
        const fieldList2 = new FieldList({
          id: '2',
          name: 'Joe Default',
          fields: ['date'],
        })

        expect(fieldList1.isEqual(fieldList2)).toBe(true)
      })
    })

    describe('When the field list is different', () => {
      it('Should return false', () => {
        const fieldList1 = new FieldList({
          id: '1',
          name: 'Joe Default',
          fields: ['date'],
        })
        const fieldList2 = new FieldList({
          id: '2',
          name: 'Joe Default',
          fields: ['time'],
        })

        expect(fieldList1.isEqual(fieldList2)).toBe(false)
      })
    })

    describe('When the name is different', () => {
      it('Should return false', () => {
        const fieldList1 = new FieldList({
          id: '1',
          name: 'Joe Default',
          fields: ['date'],
        })
        const fieldList2 = new FieldList({
          id: '2',
          name: 'Joe Default (copy)',
          fields: ['date'],
        })

        expect(fieldList1.isEqual(fieldList2)).toBe(false)
      })
    })
  })
})
