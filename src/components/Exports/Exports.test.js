/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Exports from './Exports.js'
import AssetSearch from '../../models/AssetSearch'
import Asset from '../../models/Asset'

configure({ adapter: new Adapter() })

function generateActions() {
  const hideExportInterface = jest.fn()
  const loadExportProfiles = jest.fn()
  const postExportProfiles = jest.fn()
  const clearPostExportLoadingStates = jest.fn()
  const exportRequest = jest.fn()
  const createExport = jest.fn()
  const onlineStatus = jest.fn()
  const getJobs = jest.fn()
  const getProcessors = jest.fn()

  const actions = {
    hideExportInterface,
    loadExportProfiles,
    postExportProfiles,
    clearPostExportLoadingStates,
    exportRequest,
    createExport,
    onlineStatus,
    getProcessors,
    getJobs,
  }

  return actions
}

function generateRequiredProps(customProps) {
  return {
    actions: generateActions(),
    userEmail: 'abc@zorroa.ai',
    userFullName: 'Alpha Charlie',
    userId: '1-a',
    assetSearch: new AssetSearch({}),
    hasRestrictedAssets: false,
    videoAssetCount: 0,
    imageAssetCount: 0,
    flipbookAssetCount: 0,
    documentAssetCount: 0,
    totalAssetCount: 0,
    selectedAssets: [],
    shouldShow: true,
    origin: 'localhost',
    exportProfiles: [],
    packageName: 'My Test Exports',
    exportProfilesPostingError: false,
    exportProfilesSuccess: false,
    exportProfilesPosting: false,
    isLoading: false,
    exportRequestPosting: false,
    exportRequestPostingError: false,
    exportRequestPostingSuccess: false,
    loadingCreateExport: false,
    loadingCreateExportError: false,
    loadingCreateExportSuccess: false,
    onlineAssets: 0,
    offlineAssets: 0,
    errorMessage: undefined,
    metadataFields: ['a.b'],
    processors: [],
    maxExportableAssets: 100,
    ...customProps,
  }
}

describe('<Exports />', () => {
  describe('serializeExporterArguments()', () => {
    describe('When there are custom exporters', () => {
      it('Should map arguments to the exporter names from exports state tree', () => {
        const props = generateRequiredProps({
          selectedAssets: [
            new Asset({
              document: {
                source: {
                  extension: 'pdf',
                },
              },
            }),
          ],
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
        })
        const component = shallow(<Exports {...props} />)
        component.instance().updateAssetExportability()
        const serializedArgs = component.instance().serializeExporterArguments()
        expect(serializedArgs).toEqual({
          compress: true,
          name: 'My Test Exports',
          processors: [
            {
              args: {
                exportOriginal: true,
                pageMode: 'separate',
              },
              className: 'zplugins.export.processors.PdfExporter',
            },
          ],
          search: {
            filter: undefined,
          },
        })
      })
    })

    describe('serializeExporterArguments()', () => {
      it('Should map arguments to the fully qualified exporter names', () => {
        const props = generateRequiredProps({
          selectedAssets: [
            new Asset({
              document: {
                source: {
                  extension: 'jpg',
                },
              },
            }),
            new Asset({
              document: {
                source: {
                  extension: 'mov',
                },
              },
            }),
            new Asset({
              document: {
                source: {
                  extension: 'pdf',
                },
              },
            }),
          ],
        })
        const component = shallow(<Exports {...props} />)
        component.instance().updateAssetExportability()
        const serializedArgs = component.instance().serializeExporterArguments()
        expect(serializedArgs).toEqual({
          compress: true,
          name: 'My Test Exports',
          processors: [
            {
              args: {
                exportOriginal: true,
                format: 'jpg',
                quality: 100,
                size: 1024,
              },
              className: 'com.zorroa.core.exporter.ImageExporter',
            },
            {
              args: {
                exportOriginal: true,
                format: 'mp4',
                quality: 'medium',
                scale: '960:540',
              },
              className: 'com.zorroa.core.exporter.VideoExporter',
            },
            {
              args: {
                exportOriginal: true,
                pageMode: 'separate',
              },
              className: 'com.zorroa.core.exporter.PdfExporter',
            },
            {
              args: { fields: ['a.b'] },
              className: 'com.zorroa.core.exporter.CsvExporter',
            },
          ],
          search: {
            filter: undefined,
          },
        })
      })
    })
  })
})
