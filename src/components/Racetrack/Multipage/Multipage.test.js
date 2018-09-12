/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import Multipage from './Multipage'
import Asset from '../../../models/Asset'
import Widget from '../../../models/Widget'

configure({ adapter: new Adapter() })

function generateActions() {
  const modifyRacetrackWidget = jest.fn()
  const actions = {
    modifyRacetrackWidget,
  }

  return actions
}

const mockFlipbook = {
  id: 'c',
  document: {
    media: {
      clip: {
        parent: 'd',
        type: 'flipbook',
      },
    },
  },
}

const mockVideo = {
  id: 'b',
  document: {
    media: {
      clip: {
        parent: 'a',
        type: 'video',
      },
    },
  },
}

function generateProps(customProps) {
  return {
    isolatedParent: new Asset(mockVideo),
    isIconified: false,
    isOpen: false,
    floatBody: false,
    widgets: [
      new Widget({
        id: 2,
      }),
    ],
    origin: 'https://example.pool.zorroa.com',
    id: 4,
    actions: generateActions(),
    ...customProps,
  }
}

describe('<Multipage />', () => {
  beforeEach(() => {
    // The widget class definition maintains state that needs to be reset between tests
    Widget._guid = undefined
  })

  describe('title()', () => {
    describe('When the isolated parent is not a flipbook', () => {
      it('Should return the title', () => {
        const props = generateProps()
        const component = shallow(<Multipage {...props} />)
        const title = component.instance().title()
        expect(title).toBe('Multipage')
      })
    })

    describe('When the isolated parent is a flipbook', () => {
      it('Should return the title', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockFlipbook),
        })
        const component = shallow(<Multipage {...props} />)
        const title = component.instance().title()
        expect(title).toBe('Flipbook')
      })
    })
  })

  describe('sortPages(true)', () => {
    it('Should modify the racetrack widget to sort by order', () => {
      const props = generateProps()
      const component = shallow(<Multipage {...props} />)
      component.instance().sortPages(true)
      const widget = props.actions.modifyRacetrackWidget.mock.calls[0][0]
      const sortField = widget.sliver.order[0].field
      expect(sortField).toBe('media.clip.start')
    })
  })

  describe('sortPages(false)', () => {
    it('Should not have an order field', () => {
      const props = generateProps()
      const component = shallow(<Multipage {...props} />)
      component.instance().sortPages(false)
      const widget = props.actions.modifyRacetrackWidget.mock.calls[0][0]
      const order = widget.sliver.order

      expect(order).toBe(undefined)
    })
  })

  describe('filterMultipage()', () => {
    describe('When called subsequently', () => {
      it('Should toggle the exisistence value', () => {
        const props = generateProps()
        const component = shallow(<Multipage {...props} />)
        component.instance().filterMultipage()
        const filterMultipage1 = component.state('filterMultipage')
        expect(filterMultipage1).toBe('missing')
        component.instance().filterMultipage()
        const filterMultipage2 = component.state('filterMultipage')
        expect(filterMultipage2).toBe('exists')
      })
    })
  })

  describe('isFlipbook()', () => {
    describe('When a flipbook is the isolated parent', () => {
      it('Should be true', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockFlipbook),
        })
        const component = shallow(<Multipage {...props} />)
        const isFlipbook = component.instance().isFlipbook()
        expect(isFlipbook).toBe(true)
      })
    })

    describe('When a non-flipbook is the isolated parent', () => {
      it('Should be false', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockVideo),
        })
        const component = shallow(<Multipage {...props} />)
        const isFlipbook = component.instance().isFlipbook()
        expect(isFlipbook).toBe(false)
      })
    })

    describe('When there is no isolated parent', () => {
      it('Should be false', () => {
        const props = generateProps()
        props.isolatedParent = undefined
        const component = shallow(<Multipage {...props} />)
        const isFlipbook = component.instance().isFlipbook()
        expect(isFlipbook).toBe(false)
      })
    })
  })

  describe('backgroundColor()', () => {
    describe('When the isolated parent is a flipbook', () => {
      it('Should be yellowish', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockFlipbook),
        })
        const component = shallow(<Multipage {...props} />)
        const backgroundColor = component.instance().backgroundColor()
        expect(backgroundColor).toBe('#FFD000')
      })
    })

    describe('When the isolated parent is not a flipbook', () => {
      it('Should be greenish', () => {
        const props = generateProps()
        const component = shallow(<Multipage {...props} />)
        const backgroundColor = component.instance().backgroundColor()
        expect(backgroundColor).toBe('#579760')
      })
    })
  })

  describe('getStartStopClasses()', () => {
    describe('When `playing` is started', () => {
      it('Should have the started classes', () => {
        const props = generateProps()
        const component = shallow(<Multipage {...props} />)
        component.instance().status.publish('playing', true)
        expect(component.instance().getStartStopClasses()).toBe(
          'Multipage-player-start-or-stop Multipage-player-start-or-stop--playing',
        )
      })
    })

    describe('When `playing` is stopped', () => {
      it('Should have the stopped classes', () => {
        const props = generateProps()
        const component = shallow(<Multipage {...props} />)
        component.instance().status.publish('playing', false)
        expect(component.instance().getStartStopClasses()).toBe(
          'Multipage-player-start-or-stop Multipage-player-start-or-stop--stopped',
        )
      })
    })
  })

  describe('When a `playing` event is emited', () => {
    describe('When `playing` is started', () => {
      it('Should set `isPlaying` state to true', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockVideo),
        })
        const component = shallow(<Multipage {...props} />)
        component.instance().status.publish('playing', true)
        expect(component.state('isPlaying')).toBe(true)
      })
    })

    describe('When `playing` is stopped', () => {
      it('Should set `isPlaying` state to false', () => {
        const props = generateProps({
          isolatedParent: new Asset(mockVideo),
        })
        const component = shallow(<Multipage {...props} />)
        component.instance().status.publish('playing', false)
        expect(component.state('isPlaying')).toBe(false)
      })
    })
  })
})
