jest.mock('../../components/Logo')
jest.mock('../../components/ToggleButton')
import React from 'react'
import { render, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import { MemoryRouter } from 'react-router-dom'

import Header from './Header'
import User from '../../models/User'

configure({ adapter: new Adapter(), disableLifecycleMethods: false })

function generateActions() {
  const archivistInfo = jest.fn()
  const showModal = jest.fn()
  const hideModal = jest.fn()
  const selectAssetIds = jest.fn()
  const saveUserSettings = jest.fn()
  const dialogAlertPromise = jest.fn()
  const findSimilarFields = jest.fn()
  const resetRacetrackWidgets = jest.fn()
  const showPreferencesModal = jest.fn()
  const actions = {
    archivistInfo,
    showModal,
    hideModal,
    selectAssetIds,
    saveUserSettings,
    dialogAlertPromise,
    findSimilarFields,
    resetRacetrackWidgets,
    showPreferencesModal,
  }

  return actions
}

function generateProps(customProps) {
  const user = new User({ id: 1 })
  return {
    sync: true,
    user: user,
    userSettings: {},
    signoutUrl: '',
    tutorialUrl: '',
    releaseNotesUrl: '',
    faqUrl: '',
    supportUrl: '',
    actions: generateActions(),
    ...customProps,
  }
}

describe('Selected assets label', () => {
  describe('No assets selected', () => {
    it('Label should be disabled', () => {
      const props = generateProps()
      const component = render(
        <MemoryRouter>
          <Header {...props} />
        </MemoryRouter>,
      )
      expect(component.html().includes('Editbar-selected disabled')).toBe(true)
    })
  })

  describe('One asset selected', () => {
    it('Label should read "1 asset selected"', () => {
      const selectedIds = new Set([1])
      const props = generateProps({ selectedIds: selectedIds })
      const component = render(
        <MemoryRouter>
          <Header {...props} />
        </MemoryRouter>,
      )
      expect(component.html().includes('Editbar-selected disabled')).toBe(false)
      expect(component.html().includes('1 assets selected')).toBe(false)
      expect(component.html().includes('1 asset selected')).toBe(true)
    })
  })

  describe('More than one asset selected', () => {
    it('Label should read "2 assets selected"', () => {
      const selectedIds = new Set([1, 2])
      const props = generateProps({ selectedIds: selectedIds })
      const component = render(
        <MemoryRouter>
          <Header {...props} />
        </MemoryRouter>,
      )
      expect(component.html().includes('Editbar-selected disabled')).toBe(false)
      expect(component.html().includes('2 assets selected')).toBe(true)
      expect(component.html().includes('2 asset selected')).toBe(false)
    })
  })
})
