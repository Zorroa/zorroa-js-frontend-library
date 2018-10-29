import React from 'react'
import { storiesOf } from '@storybook/react'
import { Button } from '../src/lib'
import { withInfo } from '@storybook/addon-info'

storiesOf('Button', module)
  .add(
    'With text',
    withInfo('A standard button')(() => <Button>Hello Button</Button>),
  )
  .add(
    'keyColor',
    withInfo(`
    Certain button designs can be overriden with a keyColor. KeyColors are used
    to support whitelabeling and custom branding. If a keyColor is used it's
    reccomended that only one keyColor is used throughout the entire project.
  `)(() => <Button keyColor="#294775">Resolution Blue</Button>),
  )
  .add(
    'Minimal',
    withInfo(`
      When there's a series of buttons non-primary actions should use the minimal look.
    `)(() => <Button look="minimal">Minimal</Button>),
  )
  .add(
    'Mini',
    withInfo(`
      When a button needs to be shown in non-obtrusive context use the mini look.
    `)(() => <Button look="mini">Mini</Button>),
  )
  .add(
    'Loading',
    withInfo(`
      When a button sets off a long running action, such as an AJAX request
      to a server set the state to loading to give the user an indication that
      activity is taking place.
    `)(() => <Button state="loading">Loading</Button>),
  )
  .add(
    'Success',
    withInfo(`
      When a long running action (such as an AJAX request) has completed succesfully
      update the state of the component to reflect that success has occured. If the
      user is allowed to do the action multiple times use \`setTimeout\` to reset
      the state after a short amount of time.
    `)(() => <Button state="success">Loaded!</Button>),
  )
  .add(
    'Error',
    withInfo(`
      When a long running action (such as an AJAX request) has completed with an error
      update the state of the component to reflect that an error has occured.
    `)(() => <Button state="error">Problem!</Button>),
  )
  .add(
    'Disabled',
    withInfo(`
      When a button is ready for user interaction disable it. This is useful in
      cases where a form hasn't been completed or there is invalid data.
    `)(() => <Button disabled={true}>Can Not</Button>),
  )
