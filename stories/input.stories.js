import React from 'react'
import { storiesOf } from '@storybook/react'
import { Input } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Input', module)
  .add('Normal', withInfo()(() => <Input onChange={() => {}} />))
  .add(
    'Color',
    withInfo()(() => (
      <Input type="color" value="#73b61c" onChange={() => {}} />
    )),
  )
  .add('File', withInfo()(() => <Input type="file" />))
  .add(
    'Inline Reset',
    withInfo(`
    Add a reset button that can clear the input field
  `)(() => <Input inlineReset={true} onChange={() => {}} />),
  )
