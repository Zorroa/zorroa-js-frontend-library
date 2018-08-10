/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import SharedMetadata from './SharedMetadata'
import FlashMessage from '../../FlashMessage'
import SharedTableLayout from '../../../models/SharedTableLayout'
import User from '../../../models/User'
import FieldList from '../../../models/FieldList'

configure({ adapter: new Adapter() })

function getComponent(options = {}) {
  let {
    isAdministrator,
    isSavingSharedTableLayoutsErrorMessage,
    isFetchingSharedTableLayoutsError,
    sharedTableLayouts,
  } = options
  const selectTableLayout = jest.fn()
  const addTableLayout = jest.fn()
  const fetchTableLayouts = jest.fn()
  const preventDefault = jest.fn()
  const deleteMetadataTableLayout = jest.fn()
  const saveUserSettings = jest.fn()
  const user = new User({
    id: '1',
  })
  const tableLayouts = [
    new FieldList({
      name: 'Default Layout',
      fields: ['default.field'],
    }),
  ]
  sharedTableLayouts = sharedTableLayouts || [
    new SharedTableLayout({
      name: 'joeDefault',
      id: '1',
      data: {
        fields: ['a', 'a.b'],
        name: 'Joe Default',
      },
    }),
  ]

  isAdministrator = isAdministrator === true
  isSavingSharedTableLayoutsErrorMessage =
    isSavingSharedTableLayoutsErrorMessage || ''
  isFetchingSharedTableLayoutsError = isFetchingSharedTableLayoutsError === true

  const component = shallow(
    <SharedMetadata
      isAdministrator={isAdministrator}
      sharedTableLayouts={sharedTableLayouts}
      fetchSharedMetadata={frames}
      isFetchingSharedTableLayoutsError={isFetchingSharedTableLayoutsError}
      isSavingSharedTableLayoutsErrorMessage={
        isSavingSharedTableLayoutsErrorMessage
      }
      tableLayouts={tableLayouts}
      user={user}
      userSettings={{}}
      actions={{
        addTableLayout,
        fetchTableLayouts,
        deleteMetadataTableLayout,
        saveUserSettings,
        selectTableLayout,
      }}
    />,
  )

  return {
    saveUserSettings,
    addTableLayout,
    fetchTableLayouts,
    deleteMetadataTableLayout,
    sharedTableLayouts,
    selectTableLayout,
    tableLayouts,
    event: {
      preventDefault,
    },
    component,
  }
}

describe('<SharedMetadata />', () => {
  describe('When there is a loading error', () => {
    const { component } = getComponent({
      isFetchingSharedTableLayoutsError: true,
      isSavingSharedTableLayoutsErrorMessage: 'Nothing for you today',
    })

    it('Should display the error message', () => {
      expect(
        component.contains(
          <FlashMessage look="error">Nothing for you today</FlashMessage>,
        ),
      ).toBe(true)
    })
  })

  describe('When the component is mounted', () => {
    const { fetchTableLayouts, component } = getComponent({
      isAdministrator: false,
    })

    component.instance().componentDidMount()

    it('Should call the fetchTableLayout action', () => {
      expect(fetchTableLayouts.mock.calls.length).toBe(1)
    })
  })

  describe('When the user selects a new metadata layout', () => {
    const {
      component,
      event,
      addTableLayout,
      saveUserSettings,
      selectTableLayout,
    } = getComponent()

    component.find('.SharedMetadata__select-layout').simulate('click', event)

    it('Should call the addTableLayout action', () => {
      expect(addTableLayout.mock.calls.length).toBe(1)
    })

    it('Should call the saveUserSettings action', () => {
      expect(saveUserSettings.mock.calls.length).toBe(1)
    })

    it('Should not call the selectTableLayout action', () => {
      expect(selectTableLayout.mock.calls.length).toBe(0)
    })
  })

  describe.only('When the user selects an exisiting metadata layout', () => {
    const {
      component,
      event,
      addTableLayout,
      saveUserSettings,
      selectTableLayout,
    } = getComponent({
      sharedTableLayouts: [
        new SharedTableLayout({
          name: 'joeDefault',
          id: '1',
          data: {
            fields: ['default.field'],
            name: 'Default Layout',
          },
        }),
      ],
    })

    component.find('.SharedMetadata__select-layout').simulate('click', event)

    it('Should not call the addTableLayout action', () => {
      expect(addTableLayout.mock.calls.length).toBe(0)
    })

    it('Should call the saveUserSettings action', () => {
      expect(saveUserSettings.mock.calls.length).toBe(1)
    })

    it('Should call the selectTableLayout action', () => {
      expect(selectTableLayout.mock.calls.length).toBe(1)
    })
  })

  describe('When the user deletes a metadata layout', () => {
    const { component, event, deleteMetadataTableLayout } = getComponent({
      isAdministrator: true,
    })

    component.find('.SharedMetadata__delete-layout').simulate('click', event)

    it('Should call the deleteMetadataTableLayout action', () => {
      expect(deleteMetadataTableLayout.mock.calls[0][0]).toBe('joeDefault')
    })
  })

  describe('When the user is not an admin', () => {
    const { component } = getComponent({
      isAdministrator: false,
    })

    const deleteButton = component.find('.SharedMetadata__delete-layout')

    it('Should display no metadata delete button', () => {
      expect(deleteButton.length).toBe(0)
    })
  })

  describe('When the user is an admin', () => {
    const { component, sharedTableLayouts } = getComponent({
      isAdministrator: true,
    })

    const deleteButton = component.find('.SharedMetadata__delete-layout')

    it('Should display the delete metadata button', () => {
      expect(deleteButton.length).toBe(sharedTableLayouts.length)
    })
  })

  describe('isLayoutFieldActive()', () => {
    describe('When the active table layout is different from the test', () => {
      const { component } = getComponent({})

      const isLayoutFieldActive = component
        .instance()
        .isLayoutFieldActive(['notarealfield'])

      it('Should return false', () => {
        expect(isLayoutFieldActive).toBe(false)
      })
    })

    describe('When the active table layout is the same as the test', () => {
      const { component } = getComponent({})

      const isLayoutFieldActive = component
        .instance()
        .isLayoutFieldActive(['default.field'])
      it('Should return false', () => {
        expect(isLayoutFieldActive).toBe(true)
      })
    })
  })

  describe('getFieldSummary()', () => {
    describe('When there are zero fields', () => {
      const { component } = getComponent()

      const fieldSummary = component.instance().getFieldSummary([])

      it('Should display one field name', () => {
        expect(fieldSummary).toBe('')
      })
    })

    describe('When there is one field', () => {
      const { component } = getComponent()

      const fieldSummary = component.instance().getFieldSummary(['a'])

      it('Should display one field name', () => {
        expect(fieldSummary).toBe('a')
      })
    })

    describe('When there are two fields', () => {
      const { component } = getComponent()

      const fieldSummary = component.instance().getFieldSummary(['a', 'b'])

      it('Should display the two field names', () => {
        expect(fieldSummary).toBe('a and b')
      })
    })

    describe('When there are three fields', () => {
      const { component } = getComponent()

      const fieldSummary = component.instance().getFieldSummary(['a', 'b', 'c'])

      it('Should display three field names', () => {
        expect(fieldSummary).toBe('a, b and c')
      })
    })

    describe('When there are more than three fields', () => {
      const { component } = getComponent()

      it('Should display three field names and an indicator of extra fields', () => {
        const fieldSummaryA = component
          .instance()
          .getFieldSummary(['a', 'b', 'c', 'd'])
        const fieldSummaryB = component
          .instance()
          .getFieldSummary(['a', 'b', 'c', 'd', 'e'])

        expect(fieldSummaryA).toBe('a, b, c and 1 more')
        expect(fieldSummaryB).toBe('a, b, c and 2 more')
      })
    })
  })
})
