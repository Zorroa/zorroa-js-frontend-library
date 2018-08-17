/* eslint-env jest */
jest.mock('../Racetrack/Map')
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Assets from './Assets'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import Widget from '../../models/Widget'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
})

function generateActions() {
  const resetRacetrackWidgets = jest.fn()
  const selectFolderIds = jest.fn()
  const unorderAssets = jest.fn()
  const isolateAssetId = jest.fn()
  const isolateParent = jest.fn()
  const selectAssetIds = jest.fn()
  const searchAssets = jest.fn()
  const updateParentTotals = jest.fn()
  const restoreFolders = jest.fn()
  const setThumbSize = jest.fn()
  const setThumbLayout = jest.fn()
  const showTable = jest.fn()
  const setTableHeight = jest.fn()
  const showModal = jest.fn()
  const hideModal = jest.fn()
  const iconifyRightSidebar = jest.fn()
  const saveUserSettings = jest.fn()
  const showQuickview = jest.fn()

  const actions = {
    isolateAssetId,
    isolateParent,
    selectAssetIds,
    searchAssets,
    updateParentTotals,
    unorderAssets,
    resetRacetrackWidgets,
    restoreFolders,
    selectFolderIds,
    setThumbSize,
    setThumbLayout,
    showTable,
    setTableHeight,
    showModal,
    hideModal,
    iconifyRightSidebar,
    saveUserSettings,
    showQuickview,
  }

  return actions
}

function generateRequiredProps(customProps) {
  return {
    actions: generateActions(),
    assetsCounter: 0,
    selectionCounter: 0,
    thumbSize: 200,
    layout: 'masonry',
    showTable: true,
    tableHeight: 300,
    userSettings: {},
    showQuickview: false,
    ...customProps,
  }
}

describe('<Assets />', () => {
  beforeEach(() => {
    global.requestAnimationFrame = jest.fn()
    Date.now = jest.fn().mockReturnValue(1533586464110)
  })

  describe('getHistory()', () => {
    describe('When no history exists', () => {
      it('Should return an empty object', () => {
        const props = generateRequiredProps()
        const component = shallow(<Assets {...props} />)
        const history = component.instance().getHistory()
        expect(history).toEqual({})
      })
    })

    describe('When history exists', () => {
      it('Should return an object representing the history', () => {
        const props = generateRequiredProps()
        const component = shallow(<Assets {...props} />)
        component.instance().history = {
          '1533586464109': {
            foo: 'bar',
          },
        }
        component.instance().setHistory()
        const history = component.instance().getHistory()
        expect(history).toEqual({
          '1533586464109': {
            foo: 'bar',
          },
        })
      })
    })
  })

  describe('setHistory()', () => {
    describe('When the history entry is recent enough', () => {
      it('It should call localStorage', () => {
        const props = generateRequiredProps()
        const component = shallow(<Assets {...props} />)

        component.instance().history = {
          '1533586464000': {
            foo: 'bar',
          },
        }
        component.instance().setHistory()
        const history = component.instance().getHistory()
        expect(history).toEqual({
          '1533586464000': {
            foo: 'bar',
          },
        })
      })
    })

    describe('When the history entry is expired', () => {
      it('It should set the history, but without the expired entry', () => {
        const props = generateRequiredProps()
        const component = shallow(<Assets {...props} />)

        component.instance().history = {
          '1530586461234': {
            foo: 'bar',
          },
        }
        component.instance().setHistory()
        const history = component.instance().getHistory()
        expect(history).toEqual({})
      })
    })
  })

  describe('hasNoAssets()', () => {
    describe('When assets is undefined', () => {
      it('Should be true', () => {
        const props = generateRequiredProps()
        const component = shallow(<Assets {...props} />)
        const hasNoAssets = component.instance().hasNoAssets()
        expect(hasNoAssets).toBe(true)
      })
    })

    describe('When the assets array has no assets', () => {
      it('Should be true', () => {
        const props = generateRequiredProps({
          assets: [],
        })
        const component = shallow(<Assets {...props} />)
        const hasNoAssets = component.instance().hasNoAssets()
        expect(hasNoAssets).toBe(true)
      })
    })

    describe('When the assets array has assets', () => {
      it('Should be true', () => {
        const props = generateRequiredProps({
          assets: [new Asset({ id: 'a' })],
        })
        const component = shallow(<Assets {...props} />)
        const hasNoAssets = component.instance().hasNoAssets()
        expect(hasNoAssets).toBe(false)
      })
    })
  })

  describe('hasPinnedWidget()', () => {
    describe('When the UX level is non-advanced', () => {
      it('Should be false', () => {
        const props = generateRequiredProps({
          uxLevel: 0,
        })
        const component = shallow(<Assets {...props} />)
        const hasPinnedWidget = component.instance().hasPinnedWidget()
        expect(hasPinnedWidget).toBe(false)
      })
    })

    describe('When the UX level is advanced and there is a pinned widget', () => {
      it('Should be false', () => {
        const props = generateRequiredProps({
          uxLevel: 1,
          widgets: [
            new Widget({
              id: '1',
              isPinned: true,
            }),
          ],
        })
        const component = shallow(<Assets {...props} />)
        const hasPinnedWidget = component.instance().hasPinnedWidget()
        expect(hasPinnedWidget).toBe(true)
      })
    })
  })

  describe('isNewBareSearch()', () => {
    describe('When the query is on the first page', () => {
      it('Should be true', () => {
        const props = generateRequiredProps({
          query: new AssetSearch({}),
        })
        const component = shallow(<Assets {...props} />)
        const isNewBareSearch = component.instance().isNewBareSearch()
        expect(isNewBareSearch).toBe(true)
      })
    })

    describe('When the query is not on the first page', () => {
      it('Should be false', () => {
        const props = generateRequiredProps({
          query: new AssetSearch({
            from: 10,
          }),
        })
        const component = shallow(<Assets {...props} />)
        const isNewBareSearch = component.instance().isNewBareSearch()
        expect(isNewBareSearch).toBe(false)
      })
    })
  })

  describe('shouldShowMultipageBadges()', () => {
    describe('When the isolated ID and the parent ID are the same', () => {
      it('Should be false', () => {
        const asset = new Asset({
          document: {
            media: {
              clip: {
                parent: 'abc-123',
              },
            },
          },
        })
        const props = generateRequiredProps({
          isolatedParent: asset,
        })
        const component = shallow(<Assets {...props} />)
        const shouldShowMultipageBadges = component
          .instance()
          .shouldShowMultipageBadges(asset)
        expect(shouldShowMultipageBadges).toBe(false)
      })
    })

    describe('When the isolated ID and the parent ID are different', () => {
      it('Should be true', () => {
        const assetA = new Asset({
          document: {
            media: {
              clip: {
                parent: 'def-456',
              },
            },
          },
        })
        const assetB = new Asset({
          document: {
            media: {
              clip: {
                parent: 'efg-789',
              },
            },
          },
        })
        const props = generateRequiredProps({
          isolatedParent: assetA,
        })
        const component = shallow(<Assets {...props} />)
        const shouldShowMultipageBadges = component
          .instance()
          .shouldShowMultipageBadges(assetB)
        expect(shouldShowMultipageBadges).toBe(true)
      })
    })
  })
})
