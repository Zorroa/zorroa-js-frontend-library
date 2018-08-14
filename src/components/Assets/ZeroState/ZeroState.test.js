/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import renderer from 'react-test-renderer'
import Adapter from 'enzyme-adapter-react-15'
import ZeroState from './ZeroState'
import Asset from '../../../models/Asset'
import AssetSearch from '../../../models/AssetSearch'

configure({ adapter: new Adapter() })

function generateActions() {
  const resetRacetrackWidgets = jest.fn()
  const selectFolderIds = jest.fn()
  const unorderAssets = jest.fn()
  const selectJobIds = jest.fn()
  const isolateParent = jest.fn()
  const actions = {
    resetRacetrackWidgets,
    selectFolderIds,
    unorderAssets,
    selectJobIds,
    isolateParent,
  }

  return actions
}

describe('<AssetsZeroState />', () => {
  describe('clearSearch()', () => {
    it('Should call the correct actions to reset the search state', () => {
      const actions = generateActions()
      const assets = [new Asset({ id: 'a' })]
      const query = new AssetSearch({
        query: 'airplane',
      })
      const component = shallow(
        <ZeroState actions={actions} assets={assets} query={query} />,
      )
      component.instance().clearSearch()
      expect(actions.resetRacetrackWidgets.mock.calls.length).toBe(1)
      expect(actions.selectFolderIds.mock.calls.length).toBe(1)
      expect(actions.unorderAssets.mock.calls.length).toBe(1)
      expect(actions.selectJobIds.mock.calls.length).toBe(1)
      expect(actions.isolateParent.mock.calls.length).toBe(1)
    })
  })

  describe('hasAssets()', () => {
    describe('When there are assets', () => {
      it('Should return true', () => {
        const actions = generateActions()
        const assets = [new Asset({ id: 'c' })]
        const query = new AssetSearch({
          query: 'truck',
        })
        const component = shallow(
          <ZeroState actions={actions} assets={assets} query={query} />,
        )
        const hasAssets = component.instance().hasAssets()
        expect(hasAssets).toBe(true)
      })
    })

    describe('When there are no assets', () => {
      it('Should return false', () => {
        const actions = generateActions()
        const assets = []
        const query = new AssetSearch({
          query: 'car',
        })
        const component = shallow(
          <ZeroState actions={actions} assets={assets} query={query} />,
        )
        const hasAssets = component.instance().hasAssets()
        expect(hasAssets).toBe(false)
      })
    })
  })

  describe('hasHydratedQuery()', () => {
    describe('When there is a query', () => {
      it('Should return true', () => {
        const actions = generateActions()
        const assets = []
        const query = new AssetSearch({
          query: 'airplane',
        })
        const component = shallow(
          <ZeroState actions={actions} assets={assets} query={query} />,
        )
        const hasHydratedQuery = component.instance().hasHydratedQuery()
        expect(hasHydratedQuery).toBe(true)
      })
    })

    describe('When there is no query', () => {
      it('Should return false', () => {
        const actions = generateActions()
        const assets = []
        const query = new AssetSearch({})
        const component = shallow(
          <ZeroState actions={actions} assets={assets} query={query} />,
        )
        const hasHydratedQuery = component.instance().hasHydratedQuery()
        expect(hasHydratedQuery).toBe(false)
      })
    })
  })

  describe('render()', () => {
    describe('When there are assets', () => {
      it('Should not render anything', () => {
        const actions = generateActions()
        const assets = [new Asset({ id: 'a' })]
        const query = new AssetSearch({
          query: 'boat',
        })
        const tree = renderer
          .create(<ZeroState actions={actions} assets={assets} query={query} />)
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('When there are no assets but there is a valid query', () => {
      it('Should render a zero state message', () => {
        const actions = generateActions()
        const assets = []
        const query = new AssetSearch({
          query: 'train',
        })
        const tree = renderer
          .create(<ZeroState actions={actions} assets={assets} query={query} />)
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
