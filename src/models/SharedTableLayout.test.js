/* eslint-env jest */

import SharedTableLayout from './SharedTableLayout'

describe('SharedTableLayout()', () => {
  describe('When there is corrupted blob data', () => {
    describe('isEmpty()', () => {
      it('Should return true', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: undefined,
        })
        expect(layout.isEmpty()).toBe(true)
      })

      it('Should not crash if the name is not defined', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: undefined,
        })
        expect(layout.getName()).toBe('')
      })

      it('Should not crash if the fields are undefined', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: undefined,
        })
        expect(layout.getFields().length).toBe(0)
      })
    })
  })

  describe('When there is blob data', () => {
    describe('isEmpty()', () => {
      it('Should return true', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: {
            fields: ['height', 'type'],
            name: 'Joe Default',
          },
        })
        expect(layout.isEmpty()).toBe(false)
      })

      it('Should return the name set in the data', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: {
            fields: ['height', 'type'],
            name: 'Joe Default',
          },
        })
        expect(layout.getName()).toBe('Joe Default')
      })

      it('Should return the fields', () => {
        const layout = new SharedTableLayout({
          blobId: '1',
          name: 'joeDefault',
          data: {
            fields: ['height', 'type'],
            name: 'Joe Default',
          },
        })
        expect(layout.getFields().length).toBe(2)
      })
    })
  })

  describe('getBlobName()', () => {
    const layout = new SharedTableLayout({
      blobId: '1',
      name: 'joeDefault',
      data: {
        name: "Not Joe's Default",
      },
    })
    it('Should return the blob name', () => {
      expect(layout.getBlobName()).toBe('joeDefault')
    })
  })

  describe('getId()', () => {
    const layout = new SharedTableLayout({
      blobId: '1',
    })

    it('Should return the ID', () => {
      expect(layout.getId()).toBe('1')
    })
  })

  describe('getName()', () => {
    const layout = new SharedTableLayout({
      blobId: '1',
      name: 'somethingThatsNotTheDisplayName',
      data: {
        name: 'Lovely Field Layout Name',
      },
    })
    it('Should return the layout name', () => {
      expect(layout.getName()).toBe('Lovely Field Layout Name')
    })
  })
})
