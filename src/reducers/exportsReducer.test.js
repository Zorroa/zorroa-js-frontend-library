import {
  GET_EXPORT_PROCESSORS,
  GET_EXPORT_PROCESSORS_SUCCESS,
  GET_EXPORT_PROCESSORS_ERROR,
  UPDATE_EXPORT_UI,
} from '../constants/actionTypes'
import exportsReducer from './exportsReducer'

describe('exportsReducer', () => {
  describe(UPDATE_EXPORT_UI, () => {
    it('Should count the number of files based on extensions', () => {
      const action = {
        type: UPDATE_EXPORT_UI,
        payload: {
          clipParentCounts: {
            type: {
              flipbook: 0,
            },
          },
          exportPreviewAssets: [
            {
              id: 'd079d5bc-a5c2-5088-b7cf-997808259e85',
              score: 1,
              document: {
                source: {
                  extension: 'jpg',
                },
              },
            },
          ],
          totalAssetCount: 1,
          unrestrictedAssetCount: 1,
          documentCounts: { extension: { jpg: 1 } },
        },
      }
      const {
        totalAssetCount,
        imageAssetCount,
        videoAssetCount,
        hasRestrictedAssets,
      } = exportsReducer({}, action)
      expect(imageAssetCount).toBe(1)
      expect(totalAssetCount).toBe(1)
      expect(videoAssetCount).toBe(0)
      expect(hasRestrictedAssets).toBe(false)
    })

    describe('When there is a difference between total assets restricted assets', () => {
      it('Should marked hasRestrictedAssets as true', () => {
        const action = {
          type: UPDATE_EXPORT_UI,
          payload: {
            clipParentCounts: {
              type: {
                flipbook: 0,
              },
            },
            exportPreviewAssets: [
              {
                id: 'd079d5bc-a5c2-5088-b7cf-997808259e85',
                score: 1,
                document: {
                  source: {
                    extension: 'jpg',
                  },
                },
              },
            ],
            totalAssetCount: 1,
            unrestrictedAssetCount: 0,
            documentCounts: { extension: { jpg: 1 } },
          },
        }
        const { hasRestrictedAssets } = exportsReducer({}, action)
        expect(hasRestrictedAssets).toBe(true)
      })
    })
  })

  describe(GET_EXPORT_PROCESSORS, () => {
    it('Should set the loading state of export processors to true', () => {
      const getExportProcessorsAction = {
        type: GET_EXPORT_PROCESSORS,
        payload: {},
      }
      expect(exportsReducer({}, getExportProcessorsAction)).toEqual({
        loadingProcessors: true,
        loadingProcessorsSuccess: false,
        loadingProcessorsError: false,
        processors: [],
      })
    })
  })

  describe(GET_EXPORT_PROCESSORS_SUCCESS, () => {
    it('Should set the loading processors success to true', () => {
      const getExportProcessorsAction = {
        type: GET_EXPORT_PROCESSORS_SUCCESS,
        payload: {
          processors: [
            {
              className: 'zplugins.export.processors.PdfExporter',
              args: {
                exportOriginal: true,
                pageMode: 'separate',
              },
              execute: [],
              filters: [],
              fileTypes: [],
              language: 'python',
            },
          ],
        },
      }
      const exportsState = exportsReducer({}, getExportProcessorsAction)
      const processorClassName = exportsState.processors[0].className
      expect(exportsState.loadingProcessors).toBe(false)
      expect(exportsState.loadingProcessorsSuccess).toBe(true)
      expect(exportsState.loadingProcessorsError).toBe(false)
      expect(processorClassName).toBe('zplugins.export.processors.PdfExporter')
    })

    it('Should only set the processors value to an array', () => {
      const getExportProcessorsAction = {
        type: GET_EXPORT_PROCESSORS_SUCCESS,
        payload: {},
      }
      const exportsState = exportsReducer({}, getExportProcessorsAction)
      expect(exportsState.processors.length).toBe(0)
    })
  })

  describe(GET_EXPORT_PROCESSORS_ERROR, () => {
    it('Should set the loading processors error to true', () => {
      const getExportProcessorsAction = {
        type: GET_EXPORT_PROCESSORS_ERROR,
        payload: {
          message: 'ERROR!',
        },
      }
      const exportsState = exportsReducer({}, getExportProcessorsAction)
      expect(exportsState.loadingProcessors).toBe(false)
      expect(exportsState.loadingProcessorsSuccess).toBe(false)
      expect(exportsState.loadingProcessorsError).toBe(true)
    })
  })
})
