/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import Theme from './Theme'
import Heading from '../../Heading'

describe('<Theme />', () => {
  it('Should display the heading', () => {
    const saveTheme = jest.fn()
    const component = shallow(
      <Theme
        lightLogo="<svg></svg>"
        darkLogo="<svg></svg>"
        whiteLabelEnabled={false}
        keyColor={'#abc123'}
        actions={{ saveTheme: saveTheme }}
        tutorialUrl={'tutorial'}
        releaseNotesUrl={'release'}
        faqUrl={'faq'}
        supportUrl={'support'}
      />,
    )

    expect(
      component.contains(
        <Heading size="large" level="h2">
          Logo / Colors
        </Heading>,
      ),
    ).toBe(true)
  })

  describe('save()', () => {
    it('Should only save the state fields that are needed by the action', () => {
      const saveTheme = jest.fn()
      const preventDefault = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setColor('#f93034')
      component.instance().save({
        preventDefault,
      })
      const calls = saveTheme.mock.calls[0]
      expect(calls[0]).toEqual({
        lightLogo: '<svg></svg>',
        darkLogo: '<svg></svg>',
        keyColor: '#f93034',
        whiteLabelEnabled: false,
        tutorialUrl: 'tutorial',
        releaseNotesUrl: 'release',
        faqUrl: 'faq',
        supportUrl: 'support',
      })
    })
  })

  describe('setTutorialUrl()', () => {
    it('Should set the the tutorialUrl', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setTutorialUrl('https://help.zorroa.com/tutorial')
      const tutorialUrl = component.state('tutorialUrl')
      expect(tutorialUrl).toEqual('https://help.zorroa.com/tutorial')
    })
  })

  describe('setReleaseNotesUrl()', () => {
    it('Should set the the releaseNotesUrl', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component
        .instance()
        .setReleaseNotesUrl('https://help.zorroa.com/releasenotes')
      const releaseNotesUrl = component.state('releaseNotesUrl')
      expect(releaseNotesUrl).toEqual('https://help.zorroa.com/releasenotes')
    })
  })

  describe('setfaqUrl()', () => {
    it('Should set the the faqUrl', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setFaqUrl('https://help.zorroa.com/faq')
      const faqUrl = component.state('faqUrl')
      expect(faqUrl).toEqual('https://help.zorroa.com/faq')
    })
  })

  describe('setSupportUrl()', () => {
    it('Should set the the setSupportUrl', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setSupportUrl('https://help.zorroa.com/support')
      const supportUrl = component.state('supportUrl')
      expect(supportUrl).toEqual('https://help.zorroa.com/support')
    })
  })

  describe('hasErrors()', () => {
    describe('When the color is invalid', () => {
      it('Return false', () => {
        const saveTheme = jest.fn()
        const component = shallow(
          <Theme
            lightLogo="<svg></svg>"
            darkLogo="<svg></svg>"
            whiteLabelEnabled={false}
            keyColor={'#abc123'}
            actions={{ saveTheme: saveTheme }}
            tutorialUrl={'tutorial'}
            releaseNotesUrl={'release'}
            faqUrl={'faq'}
            supportUrl={'support'}
          />,
        )
        component.instance().setColor('#nope')
        const hasErrors = component.instance().hasErrors()
        expect(hasErrors).toBe(true)
      })
    })
  })

  describe('toggleWhiteLabelEnabled()', () => {
    describe('When the checkbox is checked', () => {
      it('should enable the white label', () => {
        const saveTheme = jest.fn()
        const component = shallow(
          <Theme
            lightLogo="<svg></svg>"
            darkLogo="<svg></svg>"
            whiteLabelEnabled={false}
            keyColor={'#abc123'}
            actions={{ saveTheme: saveTheme }}
            tutorialUrl={'tutorial'}
            releaseNotesUrl={'release'}
            faqUrl={'faq'}
            supportUrl={'support'}
          />,
        )
        component.instance().toggleWhiteLabelEnabled(true)
        const whiteLabelEnabled = component.state('whiteLabelEnabled')
        expect(whiteLabelEnabled).toBe(true)
      })
    })
  })

  describe('When the checkbox is unchecked', () => {
    it('should disable the white label', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().toggleWhiteLabelEnabled(false)
      const whiteLabelEnabled = component.state('whiteLabelEnabled')
      expect(whiteLabelEnabled).toBe(false)
    })
  })

  describe('setColor()', () => {
    describe('When the color is valid', () => {
      it('Should not set any invalid message', () => {
        const saveTheme = jest.fn()
        const component = shallow(
          <Theme
            lightLogo="<svg></svg>"
            darkLogo="<svg></svg>"
            whiteLabelEnabled={false}
            keyColor={'#abc123'}
            actions={{ saveTheme: saveTheme }}
            tutorialUrl={'tutorial'}
            releaseNotesUrl={'release'}
            faqUrl={'faq'}
            supportUrl={'support'}
          />,
        )
        component.instance().setColor('#fff000')
        const isColorValid = component.state('isColorValid')
        expect(isColorValid).toBe(true)
      })
    })

    it('Should set the color', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setColor('#fff000')
      const keyColor = component.state('keyColor')
      expect(keyColor).toBe('#fff000')
    })
  })

  describe('When the color is invalid', () => {
    it('should set the invalid color flag', () => {
      const saveTheme = jest.fn()
      const component = shallow(
        <Theme
          lightLogo="<svg></svg>"
          darkLogo="<svg></svg>"
          whiteLabelEnabled={false}
          keyColor={'#abc123'}
          actions={{ saveTheme: saveTheme }}
          tutorialUrl={'tutorial'}
          releaseNotesUrl={'release'}
          faqUrl={'faq'}
          supportUrl={'support'}
        />,
      )
      component.instance().setColor('#fff00')
      const isColorValid = component.state('isColorValid')
      expect(isColorValid).toBe(false)
    })
  })
})
