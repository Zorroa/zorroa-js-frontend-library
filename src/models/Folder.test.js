import Folder from './Folder'

describe('Folder()', () => {
  describe('rootId()', () => {
    describe('When there is a value for the ZORROA_ROOT_FOLDER_ID', () => {
      it('Should return back the global ID', () => {
        global.ZORROA_ROOT_FOLDER_ID = 'abcd-1234'
        expect(Folder.getRootId()).toBe('abcd-1234')
      })
    })

    describe('When there is no value for the ZORROA_ROOT_FOLDER_ID', () => {
      it('Should return back the global ID', () => {
        global.ZORROA_ROOT_FOLDER_ID = undefined
        expect(Folder.getRootId()).toBe('00000000-0000-0000-0000-000000000000')
      })
    })
  })
})
