import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

import ResizableWindow from './ResizableWindow'

configure({
  adapter: new Adapter(),
  disableLifeCycleMethods: true,
})

function generateProps(customProps) {
  return {
    onClose: jest.fn(),
    ...customProps,
  }
}

describe('ResizableWIndow', () => {
  it('should not add coverScrubber class when not available as prop', () => {
    const props = generateProps()
    const component = shallow(<ResizableWindow {...props} />)
    const html = component.html()
    expect(html.includes('FlipbookViewer__metadata-container')).toEqual(false)
  })

  it('should add coverScrubber class when available as prop', () => {
    const props = generateProps({
      classes: 'FlipbookViewer__metadata-container',
    })
    const component = shallow(<ResizableWindow {...props} />)
    const html = component.html()
    expect(html.includes('FlipbookViewer__metadata-container')).toEqual(true)
  })
})
