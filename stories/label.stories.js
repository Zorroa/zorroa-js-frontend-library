import React from 'react'
import { storiesOf } from '@storybook/react'
import { Label, Radio, Input } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Label', module)
  .add(
    'Default',
    withInfo()(() => <Label label="A fine description for a form element" />),
  )
  .add(
    'Vertical',
    withInfo(`Use this with form elements such as textareas or text inputs`)(
      () => (
        <Label vertical={true} label="Your name">
          <Input />
        </Label>
      ),
    ),
  )
  .add(
    'Horizontal',
    withInfo(
      `Use this for form elements such as checkboxes and radio buttons that should be displayed "inline."`,
    )(() => (
      <Label afterLabel="Select me">
        <Radio />
      </Label>
    )),
  )
