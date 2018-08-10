import {
  GET_EXPORT_PROCESSORS,
  GET_EXPORT_PROCESSORS_SUCCESS,
  GET_EXPORT_PROCESSORS_ERROR,
} from '../constants/actionTypes'
import exportsReducer from './exportsReducer'

describe('exportsReducer', () => {
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
