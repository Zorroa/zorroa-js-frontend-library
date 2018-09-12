/* eslint-env jest */
import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Assets from './Assets'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import Widget from '../../models/Widget'
jest.mock('../Racetrack/Map')

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

  describe('When assets are selected', () => {
    describe('Without shift or cmd', () => {
      it('Should select one asset', () => {
        const props = generateRequiredProps({
          assets: [
            new Asset({ id: 'a' }),
            new Asset({ id: 'b' }),
            new Asset({ id: 'c' }),
          ],
        })
        const component = shallow(<Assets {...props} />)
        const asset = component.instance().props.assets[0]
        const event = {}
        component.instance().select(asset, event)
        expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
          new Set('a'),
        )
      })
    })

    describe('With shift', () => {
      const shiftSelect = { shiftKey: true }
      describe('When no other assets are selected', () => {
        it('Should select one asset', () => {
          const props = generateRequiredProps({
            assets: [new Asset({ id: 'a' })],
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[0]
          component.instance().select(asset, shiftSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a']),
          )
        })
      })
      describe('When another asset is selected', () => {
        it(`Should select all assets between selected
            assets (inclusive) in ascending order`, () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
            ],
            selectedIds: new Set(['a']),
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[2]
          component.instance().setState({ selectAnchor: 'a' })
          component.instance().select(asset, shiftSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a', 'b', 'c']),
          )
        })
        it(`Should select all assets between selected
            assets (inclusive) in descending order`, () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
            ],
            selectedIds: new Set(['c']),
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[0]
          component.instance().setState({ selectAnchor: 'c' })
          component.instance().select(asset, shiftSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a', 'b', 'c']),
          )
        })
      })
    })
    describe('With cmd', () => {
      const cmdSelect = { metaKey: true }
      describe('Select single asset', () => {
        it('Should select one asset', () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
            ],
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[0]
          component.instance().select(asset, cmdSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a']),
          )
        })
      })
      describe('Select multiple, non-consecutive assets', () => {
        it('Should batch select all assets', () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
            ],
            selectedIds: new Set(['a']),
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[2]
          component.instance().select(asset, cmdSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a', 'c']),
          )
        })
      })
      describe('Cmd selecting an asset that is batch selected', () => {
        it('Should deselect asset, keep other assets selected', () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
            ],
            selectedIds: new Set(['a', 'b', 'c']),
          })
          const component = shallow(<Assets {...props} />)
          const asset = component.instance().props.assets[1]
          component.instance().select(asset, cmdSelect)
          expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
            new Set(['a', 'c']),
          )
        })
      })
      describe('Shift and cmd select used together', () => {
        const shiftSelect = { shiftKey: true }
        const props = generateRequiredProps({
          assets: [
            new Asset({ id: 'a' }),
            new Asset({ id: 'b' }),
            new Asset({ id: 'c' }),
            new Asset({ id: 'd' }),
            new Asset({ id: 'e' }),
            new Asset({ id: 'f' }),
          ],
          selectedIds: new Set(['b', 'c']),
        })
        const component = shallow(<Assets {...props} />)
        describe('Cmd select new asset', () => {
          it(`Sets asset as the new anchor and
              adds other selected assets to reserves`, () => {
            const asset = component.instance().props.assets[4]
            component.instance().select(asset, cmdSelect)
            expect(component.instance().state.selectAnchor).toEqual('e')
            expect(component.instance().state.reserves).toEqual(
              new Set(['b', 'c']),
            )
            expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
              new Set(['b', 'c', 'e']),
            )
          })
        })
        describe('Shift select new asset', () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
              new Asset({ id: 'd' }),
              new Asset({ id: 'e' }),
              new Asset({ id: 'f' }),
            ],
            selectedIds: new Set(['b', 'c', 'e']),
          })
          const component = shallow(<Assets {...props} />)
          component
            .instance()
            .setState({ selectAnchor: 'e', reserves: new Set(['b', 'c']) })
          it(`Should call selectAssetIds()
              with new batch of assets plus reserves`, () => {
            const asset = component.instance().props.assets[5]
            component.instance().select(asset, shiftSelect)
            expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
              new Set(['b', 'c', 'e', 'f']),
            )
          })
        })
        describe(`Shift select asset with index less than
                  lowest index of reserve assets`, () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
              new Asset({ id: 'd' }),
              new Asset({ id: 'e' }),
              new Asset({ id: 'f' }),
            ],
            selectedIds: new Set(['b', 'c', 'e', 'f']),
          })
          const component = shallow(<Assets {...props} />)
          component
            .instance()
            .setState({ selectAnchor: 'e', reserves: new Set(['b', 'c']) })
          it(`Should set reserves to empty Set() and call
              selectAssetIds() with all assets between
              selected asset and anchor asset (inclusive)`, () => {
            const asset = component.instance().props.assets[0]
            component.instance().select(asset, shiftSelect)
            expect(component.instance().state.reserves).toEqual(new Set())
            expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
              new Set(['a', 'b', 'c', 'd', 'e']),
            )
          })
        })
        describe(`Shift select asset with index greater
                  than index of anchor asset`, () => {
          const props = generateRequiredProps({
            assets: [
              new Asset({ id: 'a' }),
              new Asset({ id: 'b' }),
              new Asset({ id: 'c' }),
              new Asset({ id: 'd' }),
              new Asset({ id: 'e' }),
              new Asset({ id: 'f' }),
            ],
            selectedIds: new Set(['a', 'b', 'c', 'd', 'e']),
          })
          const component = shallow(<Assets {...props} />)
          component.instance().setState({ selectAnchor: 'e' })
          it(`Should call selectAssetIds() with
              anchor asset and selected asset`, () => {
            const asset = component.instance().props.assets[5]
            component.instance().select(asset, shiftSelect)
            expect(props.actions.selectAssetIds.mock.calls[0][0]).toEqual(
              new Set(['e', 'f']),
            )
          })
        })
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
