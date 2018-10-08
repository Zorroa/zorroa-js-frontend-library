/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Image from './Image'

configure({ adapter: new Adapter() })

function generateProps(customProps) {
  return {
    url: 'https://cdn2.iconfinder.com/data/icons/miniicons2/bell.gif',
    ...customProps,
  }
}

describe('<Image />', () => {
  describe('calculateProgress()', () => {
    describe('when progress.total is 0', () => {
      it('should not change state.loadPercentage', () => {
        const props = generateProps()
        const state = { loadPercentage: 50 }
        const component = shallow(<Image {...props} />)
        const progress = { loaded: 0, total: 0 }
        component.instance().setState({ ...state })
        component.instance().calculateProgress(progress)
        expect(component.instance().state.loadPercentage).toEqual(50)
      })
    })

    describe('when progress.total > 0', () => {
      it('should save loading percentage to state', () => {
        const props = generateProps()
        const component = shallow(<Image {...props} />)
        const progress = { loaded: 50, total: 150 }
        expect(component.instance().state.loadPercentage).toEqual(0)
        component.instance().calculateProgress(progress)
        expect(component.instance().state.loadPercentage).toEqual(33)
      })
    })
  })

  describe('getImageURI()', () => {
    it('should encode image to dataURI and save to state', () => {
      const props = generateProps()
      const component = shallow(<Image {...props} />)
      const instance = component.instance()
      const buffer = new ArrayBuffer(1)
      const res = {
        data: buffer,
        headers: { 'content-type': 'image/gif' },
      }
      instance.getImageURI(res)
      expect(instance.state.imageURI).toBeDefined()
      expect(instance.state.imageURI).toEqual('data:image/gif;base64,AA==')
    })
  })

  describe('<ProgressCircle />', () => {
    describe('when image is not fully loaded', () => {
      it('should show <ProgressCircle />', () => {
        const props = generateProps()
        const component = shallow(<Image {...props} />)
        expect(component.html().includes('ProgressCircle')).toBe(true)
      })
    })

    describe('when image is fully loaded', () => {
      it('should not show <ProgressCircle />', () => {
        const props = generateProps()
        const state = { loadPercentage: 100 }
        const component = shallow(<Image {...props} />)
        component.instance().setState({ ...state })
        expect(component.html().includes('ProgressCircle')).toBe(false)
      })
    })
  })
})
