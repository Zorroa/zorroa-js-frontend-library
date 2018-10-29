import React from 'react'
import { storiesOf } from '@storybook/react'
import { Radio, Label } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Radio', module)
  .add(
    'Default',
    withInfo(`A single radio button.`)(() => (
      <Radio name="flavors" value="vnla" />
    )),
  )
  .add(
    'keyColor',
    withInfo(`
      The radio button's active color can be overriden with a keyColor. KeyColors
      are used to support whitelabeling and custom branding. If a keyColor is used it's
      reccomended that only one keyColor is used throughout the entire project.
    `)(() => (
      <Radio
        name="radiogroup"
        checked={true}
        keyColor="#294775"
        value="Resolution Blue"
      />
    )),
  )
  .add(
    'Radio Group',
    withInfo(
      `Radio buttons are best used with labels and in a group for accesibility and consistent UX. While the \`Radio\` component can be used indepdently, it is not reccomended. As such this component includes multiple radio buttons inside of \`Label\`'s to demonstrate the correct use.`,
    )(() => (
      <form>
        <Label afterLabel="Vanilla">
          <Radio name="flavors" value="vnla" />
        </Label>
        <Label afterLabel="Strawberry">
          <Radio name="flavors" value="swby" />
        </Label>
        <Label afterLabel="Chocolate">
          <Radio name="flavors" value="choc" />
        </Label>
      </form>
    )),
  )
