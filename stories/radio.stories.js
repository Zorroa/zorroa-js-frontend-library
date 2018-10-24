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
