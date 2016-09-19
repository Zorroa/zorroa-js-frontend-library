import React from 'react'
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import App from './App'

// const storeFake = (state) => {
//   return {
//     default: () => {},
//     subscribe: () => {},
//     dispatch: () => {},
//     getState: () => {
//       return { ...state }
//     }
//   }
// }

describe('<App />', () => {
  it('should be true', () => {
    expect(true).toBe(true)
  })

  xit('should have the header', () => {
    expect(shallow(<App />).contains(<div>App</div>)).toBe(true)
  })
})
