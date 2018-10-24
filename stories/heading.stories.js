import React from 'react'
import { storiesOf } from '@storybook/react'
import { Heading } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Heading', module)
  .add(
    'Huge',
    withInfo()(() => <Heading size="huge">This Heading Is Huge</Heading>),
  )
  .add(
    'Large',
    withInfo()(() => <Heading size="large">This Heading Is Large</Heading>),
  )
  .add(
    'Medium',
    withInfo()(() => <Heading size="medium">This Heading Is Medium</Heading>),
  )
  .add(
    'Small',
    withInfo()(() => <Heading size="small">This Heading Is Small</Heading>),
  )
  .add(
    'Tiny',
    withInfo()(() => <Heading size="tiny">This Heading Is Tiny</Heading>),
  )
  .add(
    'Micro',
    withInfo()(() => <Heading size="micro">This Heading Is Micro</Heading>),
  )
