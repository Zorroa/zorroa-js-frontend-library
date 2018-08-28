import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

import Filetype from './Filetype'
import Widget from '../../../models/Widget'
import { FILE_GROUP_IMAGES } from '../../../constants/fileTypes'

configure({
  adapter: new Adapter(),
  disableLifecycleMethods: false,
})

function generateActions() {
  const modifyRacetrackWidget = jest.fn()
  const showModal = jest.fn()
  const actions = {
    modifyRacetrackWidget,
    showModal,
  }

  return actions
}

function generateProps(customProps) {
  return {
    widgets: [
      new Widget({
        id: 2,
      }),
    ],
    actions: generateActions(),
    id: 4,
    isIconified: false,
    isOpen: true,
    floatBody: false,
    ...customProps,
  }
}

describe('Filetype', () => {
  beforeEach(() => {
    Widget._guid = 0
  })
  describe('getClassNamesForFileIcons()', () => {
    it('Generates icon classname', () => {
      const props = generateProps()
      const component = shallow(<Filetype {...props} />)
      const icon = component
        .instance()
        .getClassNamesForFileIcons(FILE_GROUP_IMAGES)
      expect(icon).toEqual('icon-picture2')
    })
  })
})
