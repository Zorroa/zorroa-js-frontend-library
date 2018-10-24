import React from 'react'
import { storiesOf } from '@storybook/react'
import { Paragraph } from '../src/lib/'
storiesOf('Design Systems Manual', module).add('DSM', () => (
  <Paragraph>
    View the Curator DSM on{' '}
    <a href="https://projects.invisionapp.com/dsm/zorroa/curator">Invision</a>.
  </Paragraph>
))
