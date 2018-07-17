/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import Filmstrip from './Filmstrip'

const origin = 'http://localhost'
const clipParentId = 'a83e9214-cb8e-5c95-8701-16d7f25deed0'

describe('<Filmstrip />', () => {
  describe('When the user resizes the Filmstrip', () => {
    it('Should resize according to the change in the Y-coordinate', () => {
      const preventDefault = jest.fn()
      const actions = {
        setFilmstripHeight: jest.fn(),
      }
      const component = shallow(
        <Filmstrip
          filmStripHeight={200}
          actions={actions}
          origin={origin}
          clipParentId={clipParentId}
        />,
      )

      component.instance().startDrag({
        clientY: 25,
        preventDefault,
      })
      component.instance().onDrag({
        clientY: 50,
        preventDefault,
        buttons: 1,
      })
      expect(component.state('height')).toBe(175)
    })
  })

  it('Should not resize when a primary button is not set', () => {
    const preventDefault = jest.fn()
    const actions = {
      setFilmstripHeight: jest.fn(),
    }
    const component = shallow(
      <Filmstrip
        filmStripHeight={200}
        actions={actions}
        origin={origin}
        clipParentId={clipParentId}
      />,
    )

    component.instance().startDrag({
      clientY: 25,
      preventDefault,
    })
    component.instance().onDrag({
      clientY: 50,
      preventDefault,
      buttons: 2,
    })
    expect(component.state('height')).toBe(200)
  })
})
