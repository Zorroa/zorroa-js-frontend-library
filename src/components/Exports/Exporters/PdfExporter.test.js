/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import PdfExporter from './PdfExporter.js'

configure({ adapter: new Adapter() })

function generateRequiredProps(customProps) {
  return {
    onChange: jest.fn(),
    onToggleAccordion: jest.fn(),
    isOpen: false,
    shouldExport: false,
    format: 'singlepage',
    processors: [],
    hasNonDefaultProcessors: true,
    arguments: {
      pageMode: 'merge',
      exportOriginal: true,
    },
    ...customProps,
  }
}

describe('<PdfExporter />', () => {
  describe('canDisplay()', () => {
    describe('When a PdfExporter processor is available', () => {
      it('should be true', () => {
        const props = generateRequiredProps({
          hasNonDefaultProcessors: true,
          processors: [
            {
              className: 'zplugins.export.processors.PdfExporter',
              args: {
                exportOriginal: true,
                pageMode: 'separate',
              },
              execute: [],
              filters: [],
              fileTypes: [],
              language: 'python',
            },
          ],
        })
        const component = shallow(<PdfExporter {...props} />)
        const canDisplay = component.instance().canDisplay()
        expect(canDisplay).toEqual(true)
      })
    })

    describe('When no non-default processors are available', () => {
      it('should be true', () => {
        const props = generateRequiredProps({
          hasNonDefaultProcessors: false,
          processors: [],
        })
        const component = shallow(<PdfExporter {...props} />)
        const canDisplay = component.instance().canDisplay()
        expect(canDisplay).toEqual(true)
      })
    })

    describe('When non-default processors are available, but none are a PdfExporter', () => {
      it('should be false', () => {
        const props = generateRequiredProps({
          hasNonDefaultProcessors: true,
          processors: [
            {
              className: 'zplugins.export.processors.FooBarBazExporter',
              args: {
                exportOriginal: true,
                pageMode: 'separate',
              },
              execute: [],
              filters: [],
              fileTypes: [],
              language: 'python',
            },
          ],
        })
        const component = shallow(<PdfExporter {...props} />)
        const canDisplay = component.instance().canDisplay()
        expect(canDisplay).toEqual(false)
      })
    })
  })
})
