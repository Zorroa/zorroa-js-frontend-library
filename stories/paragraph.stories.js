import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { Paragraph } from '../src/lib'

storiesOf('Paragraph', module)
  .add(
    'Normal',
    withInfo()(() => (
      <Paragraph>
        Brawny gods just flocked up to quiz and vex him. Levi Lentz packed my
        bag with six quarts of juice.{' '}
      </Paragraph>
    )),
  )
  .add(
    'Large',
    withInfo()(() => (
      <Paragraph size="large">
        When zombies arrive, quickly fax judge Pat. Amazingly few discotheques
        provide jukeboxes.
      </Paragraph>
    )),
  )
  .add(
    'Small',
    withInfo()(() => (
      <Paragraph size="small">
        Heavy boxes perform quick waltzes and jigs. The quick onyx goblin jumps
        over the lazy dwarf.
      </Paragraph>
    )),
  )
