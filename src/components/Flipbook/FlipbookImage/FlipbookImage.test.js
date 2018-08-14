/* eslint-env jest */

import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import FlipbookImage from './FlipbookImage'
import Asset from '../../../models/Asset'
import { PubSub } from '../../../services/jsUtil'
import renderer from 'react-test-renderer'

const origin = 'http://localhost'
configure({ adapter: new Adapter() })

function generateFrameAsset(id, number) {
  return new Asset({
    id: id || `${Math.round(Math.random() * 100000)}`,
    score: NaN,
    document: {
      media: {
        clip: {
          type: 'flipbook',
          start:
            typeof number === 'number' ? number : Math.round(Math.random * 10),
          stop:
            typeof number === 'number' ? number : Math.round(Math.random * 10),
        },
      },
    },
  })
}
describe('<FlipbookImage />', () => {
  describe('animationHoldStateUpdate()', () => {
    const frames = [
      generateFrameAsset('a', 2),
      generateFrameAsset('b', 5),
      generateFrameAsset('c', 6),
    ]
    const componentInstance = shallow(
      <FlipbookImage
        shouldLoop={true}
        shouldHold={true}
        origin={origin}
        frames={frames}
      />,
    )
    componentInstance.instance().animationHoldStateUpdate()
    expect(componentInstance.state('activeFrame')).toBe(frames[0])
  })

  describe('getClosestFrameByPercent()', () => {
    const frames = [
      generateFrameAsset('a', 1),
      generateFrameAsset('b', 10),
      generateFrameAsset('c', 100),
    ]
    const componentInstance = shallow(
      <FlipbookImage
        shouldLoop={true}
        shouldHold={true}
        origin={origin}
        frames={frames}
      />,
    )
    const zeroPercent = componentInstance.instance().getClosestFrameByPercent(0)
    const fivePercent = componentInstance
      .instance()
      .getClosestFrameByPercent(0.05)
    const fifteenPercent = componentInstance
      .instance()
      .getClosestFrameByPercent(0.15)
    const fiftyPercent = componentInstance
      .instance()
      .getClosestFrameByPercent(0.5)
    const seventyFivePercent = componentInstance
      .instance()
      .getClosestFrameByPercent(0.75)
    const oneHundredPercent = componentInstance
      .instance()
      .getClosestFrameByPercent(1)
    expect(zeroPercent).toBe(frames[0])
    expect(fivePercent).toBe(frames[0])
    expect(fifteenPercent).toBe(frames[1])
    expect(fiftyPercent).toBe(frames[1])
    expect(seventyFivePercent).toBe(frames[2])
    expect(oneHundredPercent).toBe(frames[2])
  })

  describe('notifySubscribeesOfNewFrame()', () => {
    it('Should publish the elapsed amount', () => {
      let elapsedPercent
      const status = new PubSub()
      status.on('elapsedPercent', percent => {
        elapsedPercent = percent
      })
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
        generateFrameAsset(undefined, 3),
      ]
      const componentInstance = shallow(
        <FlipbookImage status={status} origin={origin} frames={frames} />,
      )

      componentInstance.instance().setActiveFrame(frames[0])
      componentInstance.instance().notifySubscribeesOfNewFrame()
      expect(elapsedPercent).toBe(0)
      componentInstance.instance().setActiveFrame(frames[1])
      componentInstance.instance().notifySubscribeesOfNewFrame()
      expect(elapsedPercent).toBe(0.5)
      componentInstance.instance().setActiveFrame(frames[2])
      componentInstance.instance().notifySubscribeesOfNewFrame()
      expect(elapsedPercent).toBe(1)
    })
  })

  describe('updateDefaultFrameElapsedPosition()', () => {
    describe('When a default frame is defined', () => {
      it('Should publish the elapsed amount', () => {
        let elapsedPercent
        const status = new PubSub()
        status.on('elapsedPercent', percent => {
          elapsedPercent = percent
        })
        const frames = [
          generateFrameAsset(undefined, 1),
          generateFrameAsset(undefined, 2),
          generateFrameAsset(undefined, 3),
        ]
        const componentInstance = shallow(
          <FlipbookImage
            status={status}
            defaultFrame={frames[1]}
            origin={origin}
            frames={frames}
          />,
        )

        componentInstance.instance().updateDefaultFrameElapsedPosition()
        expect(elapsedPercent).toBe(0.5)
      })
    })

    describe('When a default frame is not defined', () => {
      it('Should publish the elapsed amount as not started', () => {
        let elapsedPercent
        const status = new PubSub()
        status.on('elapsedPercent', percent => {
          elapsedPercent = percent
        })
        const frames = [
          generateFrameAsset(undefined, 1),
          generateFrameAsset(undefined, 2),
        ]
        const componentInstance = shallow(
          <FlipbookImage status={status} origin={origin} frames={frames} />,
        )

        componentInstance.instance().updateDefaultFrameElapsedPosition()
        expect(elapsedPercent).toBe(0)
      })
    })
  })

  describe('When in "hold frames" mode', () => {
    describe('When the frame numbers have dropped frames', () => {
      it('Should publish the elapsed amount in terms of total frame count', () => {
        let elapsedPercent
        const status = new PubSub()
        status.on('elapsedPercent', percent => {
          elapsedPercent = percent
        })
        const frames = [
          generateFrameAsset(undefined, 1),
          generateFrameAsset(undefined, 5),
        ]
        const componentInstance = shallow(
          <FlipbookImage
            status={status}
            shouldHold={true}
            origin={origin}
            frames={frames}
          />,
        )

        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0.25)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0.5)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0.75)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(1)
      })
    })

    describe('When the frame numbers have sequential frames', () => {
      it('Should publish the elapsed amount in terms of total frame count', () => {
        let elapsedPercent
        const status = new PubSub()
        status.on('elapsedPercent', percent => {
          elapsedPercent = percent
        })
        const frames = [
          generateFrameAsset(undefined, 0),
          generateFrameAsset(undefined, 1),
          generateFrameAsset(undefined, 2),
        ]
        const componentInstance = shallow(
          <FlipbookImage
            status={status}
            shouldHold={true}
            origin={origin}
            frames={frames}
          />,
        )

        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(0.5)
        componentInstance.instance().animationHoldStateUpdate()
        expect(elapsedPercent).toBe(1)
      })
    })
  })

  describe('animationStateUpdate()', () => {
    describe('When looping is enabled', () => {
      it('Should play all frames in a loop without stopping at the end', () => {
        const frames = [generateFrameAsset('1', 1), generateFrameAsset('2', 2)]
        const componentInstance = shallow(
          <FlipbookImage shouldLoop origin={origin} frames={frames} />,
        )

        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[1])
        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
      })
    })

    describe('When looping is disabled', () => {
      it('Should play all frames and then stop', () => {
        const frames = [generateFrameAsset('1', 1), generateFrameAsset('2', 2)]
        const componentInstance = shallow(
          <FlipbookImage shouldLoop={false} origin={origin} frames={frames} />,
        )

        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[1])
        componentInstance.instance().animationStateUpdate()
        expect(componentInstance.state('activeFrame')).toBe(frames[1])
        expect(componentInstance.instance().isPlaying()).toBe(false)
      })
    })
  })

  describe('isLoaded()', () => {
    describe('When frames have not loaded', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      expect(componentInstance.instance().isLoaded()).toBe(false)
      componentInstance.instance().onFrameLoad()
      expect(componentInstance.instance().isLoaded()).toBe(false)
    })

    describe('When all frames have loaded', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      frames.forEach(componentInstance.instance().onFrameLoad)
      expect(componentInstance.instance().isLoaded()).toBe(true)
    })
  })

  describe('When no frames are loaded', () => {
    it('It should render', () => {
      const tree = renderer
        .create(<FlipbookImage origin={origin} autoplay />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('scrubByPercent()', () => {
    describe('When the frames are not being held', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
        generateFrameAsset(undefined, 3),
        generateFrameAsset(undefined, 4),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should navigate to the proper frame', () => {
        componentInstance.instance().scrubByPercent(0.8)
        expect(componentInstance.state('activeFrame')).toEqual(frames[3])
        componentInstance.instance().scrubByPercent(0.1)
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
        componentInstance.instance().scrubByPercent(0.5)
        expect(componentInstance.state('activeFrame')).toBe(frames[2])
      })
    })

    describe('When the frames are being held', () => {
      const frames = [
        generateFrameAsset(undefined, 0),
        generateFrameAsset(undefined, 5),
        generateFrameAsset(undefined, 10),
        generateFrameAsset(undefined, 20),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} shouldHold={true} frames={frames} />,
      )

      it('Should navigate to the proper frame', () => {
        componentInstance.instance().scrubByPercent(0.01)
        expect(componentInstance.state('activeFrame')).toEqual(frames[0])
        componentInstance.instance().scrubByPercent(0.2)
        expect(componentInstance.state('activeFrame')).toEqual(frames[1])
        componentInstance.instance().scrubByPercent(0.6)
        expect(componentInstance.state('activeFrame')).toBe(frames[2])
        componentInstance.instance().scrubByPercent(0.85)
        expect(componentInstance.state('activeFrame')).toBe(frames[3])
      })
    })
  })

  describe('frameForward()', () => {
    const frames = [
      generateFrameAsset(undefined, 1),
      generateFrameAsset(undefined, 2),
      generateFrameAsset(undefined, 3),
    ]
    const componentInstance = shallow(
      <FlipbookImage origin={origin} frames={frames} />,
    )

    it('Should pause the animation', () => {
      componentInstance.instance().start()

      // Ensure the animation is unpaused first
      expect(componentInstance.instance().isPaused()).toBe(false)

      // Then go forward a frame
      componentInstance.instance().frameForward()

      // Then expect the animation is paused
      expect(componentInstance.instance().isPaused()).toBe(true)
    })

    it('Should go forward one frame', () => {
      componentInstance.instance().setActiveFrame(frames[0])
      componentInstance.instance().frameForward()
      expect(componentInstance.state('activeFrame')).toBe(frames[1])
      componentInstance.instance().frameForward()
      expect(componentInstance.state('activeFrame')).toBe(frames[2])
      componentInstance.instance().frameForward()
      expect(componentInstance.state('activeFrame')).toBe(frames[2])
    })
  })

  describe('frameBack()', () => {
    const frames = [
      generateFrameAsset(undefined, 1),
      generateFrameAsset(undefined, 2),
      generateFrameAsset(undefined, 3),
    ]
    const componentInstance = shallow(
      <FlipbookImage origin={origin} frames={frames} />,
    )

    it('Should pause the animation', () => {
      componentInstance.instance().start()

      // Ensure the animation is unpaused first
      expect(componentInstance.instance().isPaused()).toBe(false)

      // Then go forward a frame
      componentInstance.instance().frameBack()

      // Then expect the animation is paused
      expect(componentInstance.instance().isPaused()).toBe(true)
    })

    it('Should go backward one frame', () => {
      componentInstance.instance().setActiveFrame(frames[2])
      componentInstance.instance().frameBack()
      expect(componentInstance.state('activeFrame')).toBe(frames[1])
      componentInstance.instance().frameBack()
      expect(componentInstance.state('activeFrame')).toBe(frames[0])
      componentInstance.instance().frameBack()
      expect(componentInstance.state('activeFrame')).toBe(frames[0])
    })
  })

  describe('fastForward()', () => {
    const frames = [
      generateFrameAsset(undefined, 1),
      generateFrameAsset(undefined, 2),
      generateFrameAsset(undefined, 3),
    ]
    const componentInstance = shallow(
      <FlipbookImage origin={origin} frames={frames} />,
    )

    it('Should go to the last frame', () => {
      componentInstance.instance().setActiveFrame(frames[1])
      expect(componentInstance.state('activeFrame')).toBe(frames[1])

      componentInstance.instance().fastForward()
      expect(componentInstance.state('activeFrame')).toBe(frames[2])
    })

    it('Should be paused', () => {
      componentInstance.instance().start()
      componentInstance.instance().setActiveFrame(frames[1])
      expect(componentInstance.state('activeFrame')).toBe(frames[1])

      componentInstance.instance().fastForward()
      expect(componentInstance.instance().isPlaying()).toBe(false)
    })
  })

  describe('startOrStop()', () => {
    describe('When the animation is at the end', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
        generateFrameAsset(undefined, 3),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should start playing the first frame', () => {
        componentInstance.instance().setActiveFrame(frames[2])
        componentInstance.instance().startOrStop()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
        expect(componentInstance.instance().isPlaying()).toBe(true)
      })
    })

    describe('When the animation is paused', () => {
      const frames = [generateFrameAsset(undefined, 1)]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should become unpaused', () => {
        componentInstance.instance().pause()
        expect(componentInstance.instance().isPaused()).toBe(true)
        componentInstance.instance().startOrStop()
        expect(componentInstance.instance().isPaused()).toBe(false)
      })
    })

    describe('When the animation is playing', () => {
      const frames = [generateFrameAsset(undefined, 1)]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should become paused', () => {
        componentInstance.instance().start()
        componentInstance.instance().startOrStop()
        expect(componentInstance.instance().isPaused()).toBe(true)
      })
    })

    describe('When the animation is loaded and not playing', () => {
      const frames = [generateFrameAsset(undefined, 1)]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should start playing', () => {
        frames.forEach(componentInstance.instance().onFrameLoad)
        componentInstance.instance().startOrStop()
        expect(componentInstance.instance().isPlaying()).toBe(true)
      })
    })
  })

  describe('getFormattedLoadingPercentage()', () => {
    const frames = [
      generateFrameAsset(undefined, 1),
      generateFrameAsset(undefined, 2),
      generateFrameAsset(undefined, 3),
    ]
    const componentInstance = shallow(
      <FlipbookImage origin={origin} frames={frames} />,
    )

    it('Should display percentages as fraction of 100', () => {
      expect(componentInstance.instance().getFormattedLoadingPercentage()).toBe(
        0,
      )
      componentInstance.instance().onFrameLoad()
      expect(componentInstance.instance().getFormattedLoadingPercentage()).toBe(
        33,
      )
      componentInstance.instance().onFrameLoad()
      expect(componentInstance.instance().getFormattedLoadingPercentage()).toBe(
        67,
      )
      componentInstance.instance().onFrameLoad()
      expect(componentInstance.instance().getFormattedLoadingPercentage()).toBe(
        100,
      )
    })
  })

  describe('isAtEndOfAnimation()', () => {
    describe('When the animation is in the middle', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should be false', () => {
        componentInstance.instance().setActiveFrame(frames[0])
        expect(componentInstance.instance().isAtEndOfAnimation()).toBe(false)
      })

      describe('When the animation is at the end', () => {
        const frames = [
          generateFrameAsset(undefined, 1),
          generateFrameAsset(undefined, 2),
        ]
        const componentInstance = shallow(
          <FlipbookImage origin={origin} frames={frames} />,
        )

        it('Should be true', () => {
          componentInstance.instance().setActiveFrame(frames[1])
          expect(componentInstance.instance().isAtEndOfAnimation()).toBe(true)
        })
      })
    })
  })

  describe('rewind()', () => {
    describe('When the animation is playing', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
        generateFrameAsset(undefined, 3),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should go to the first frame', () => {
        componentInstance.instance().start()
        componentInstance.instance().setActiveFrame(frames[2])

        // Ensure the current frame is not already the first frame
        expect(componentInstance.state('activeFrame')).toBe(frames[2])

        componentInstance.instance().rewind()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
        componentInstance.instance().stop()
      })

      it('Should keep playing', () => {
        componentInstance.instance().start()
        componentInstance.instance().rewind()
        expect(componentInstance.instance().isPlaying()).toBe(true)
      })
    })

    describe('When the animation is not playing', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
        generateFrameAsset(undefined, 3),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      it('Should go to the first frame', () => {
        componentInstance.instance().stop()
        componentInstance.instance().setActiveFrame(frames[2])

        // Ensure the current frame is not already the first frame
        expect(componentInstance.state('activeFrame')).toBe(frames[2])

        componentInstance.instance().rewind()
        expect(componentInstance.state('activeFrame')).toBe(frames[0])
      })

      it('Should stay paused', () => {
        componentInstance.instance().rewind()
        expect(componentInstance.instance().isPlaying()).toBe(false)
      })
    })
  })

  describe('shouldFrameBeVisible()', () => {
    describe('When there is no default frame', () => {
      const frames = [
        generateFrameAsset(undefined, 1),
        generateFrameAsset(undefined, 2),
      ]
      const componentInstance = shallow(
        <FlipbookImage origin={origin} frames={frames} />,
      )

      describe('When the images are still loading', () => {
        it('Should never return a visible frame', () => {
          expect(
            componentInstance.instance().shouldFrameBeVisible(frames[0]),
          ).toBe(false)
          expect(
            componentInstance.instance().shouldFrameBeVisible(frames[1]),
          ).toBe(false)
        })
      })

      describe('When the images are loaded', () => {
        it('Should return true for the active frame', () => {
          componentInstance.instance().onFrameLoad()
          componentInstance.instance().onFrameLoad()
          expect(
            componentInstance.instance().shouldFrameBeVisible(frames[0]),
          ).toBe(true)
          expect(
            componentInstance.instance().shouldFrameBeVisible(frames[1]),
          ).toBe(false)
        })
      })
    })

    describe('When there is a default frame', () => {
      const frames = [
        generateFrameAsset('100', 1),
        generateFrameAsset('101', 2),
      ]
      const defaultFrame = frames[1]
      const componentInstance = shallow(
        <FlipbookImage
          defaultFrame={defaultFrame}
          origin={origin}
          frames={frames}
        />,
      )

      it('Should return true only for the default frame', () => {
        expect(
          componentInstance.instance().shouldFrameBeVisible(frames[0]),
        ).toBe(false)
        expect(
          componentInstance.instance().shouldFrameBeVisible(defaultFrame),
        ).toBe(true)
      })
    })
  })
})
