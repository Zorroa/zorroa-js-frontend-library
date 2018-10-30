import React from 'react'
import { storiesOf } from '@storybook/react'
import { Checkbox } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Checkbox', module)
  .add(
    'Default',
    withInfo(`A single checkbox.`)(() => <Checkbox onChange={() => {}} />),
  )
  .add(
    'checked',
    withInfo(`A single checkbox that is checked on by default.`)(() => (
      <Checkbox checked={true} onChange={() => {}} />
    )),
  )
  .add(
    'keyColor',
    withInfo(`
      The checkboxes active color can be overriden with a keyColor. KeyColors
      are used to support whitelabeling and custom branding. If a keyColor is used it's
      reccomended that only one keyColor is used throughout the entire project.
    `)(() => <Checkbox checked={true} keyColor="#294775" />),
  )
