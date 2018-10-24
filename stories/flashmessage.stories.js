import React from 'react'
import { storiesOf } from '@storybook/react'
import { FlashMessage } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('FlashMessage', module)
  .add(
    'Warning',
    withInfo(
      `Warnings, such as potential problems with permissions or a long running request should be noted with a warning.`,
    )(() => (
      <FlashMessage look="warning">This is a warning message.</FlashMessage>
    )),
  )
  .add(
    'Info',
    withInfo(`Generic information for the user should be displayed here.`)(
      () => (
        <FlashMessage look="info">
          This is an informational message.
        </FlashMessage>
      ),
    ),
  )
  .add(
    'Error',
    withInfo(
      `When an error has occured detail the error message in a user friendly manner, with an optional error code or technical explanation at the end.`,
    )(() => (
      <FlashMessage look="error">This is an error message.</FlashMessage>
    )),
  )
  .add(
    'Success',
    withInfo(
      `When an action has successfully completed display a message to indicate that status.`,
    )(() => (
      <FlashMessage look="success">This is a success message.</FlashMessage>
    )),
  )
