import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, FlashMessage, Heading, Input, Label, Radio } from '../src/lib'
import { withInfo, setDefaults } from '@storybook/addon-info';
import Colors from './components/Colors'

setDefaults({
  inline: true,
});

storiesOf('Colors', module)
  .add('Colors', () => (
    <Colors />
  ))

storiesOf('Button', module)
  .add('With text',withInfo('A standard button')(() => <Button>Hello Button</Button>))
  .add('Minimal', withInfo(`
      When there's a series of buttons non-primary actions should use the minimal look.
    `)(() => (
    <Button look="minimal">Minimal</Button>
  )))
  .add('Mini', withInfo(`
      When a button needs to be shown in non-obtrusive context use the mini look.
    `)(() => (
    <Button look="mini">Mini</Button>
  )))
  .add('Loading', withInfo(`
      When a button sets off a long running action, such as an AJAX request
      to a server set the state to loading to give the user an indication that
      activity is taking place.
    `)(() => (
    <Button state="loading">Loading</Button>
  )))
  .add('Success', withInfo(`
      When a long running action (such as an AJAX request) has completed succesfully
      update the state of the component to reflect that success has occured. If the
      user is allowed to do the action multiple times use \`setTimeout\` to reset
      the state after a short amount of time.
    `)(() => (<Button state="success">Loaded!</Button>)
  ))
  .add('Error', withInfo(`
      When a long running action (such as an AJAX request) has completed with an error
      update the state of the component to reflect that an error has occured.
    `)(() => (<Button state="error">Problem!</Button>)
  ))
  .add('Disabled', withInfo(`
      When a button is ready for user interaction disable it. This is useful in
      cases where a form hasn't been completed or there is invalid data.
    `)(() => (<Button disabled={true}>Can Not</Button>)
  ))

storiesOf('FlashMessage', module)
  .add('Warning', withInfo(`Warnings, such as potential problems with permissions or a long running request should be noted with a warning.`)(() => (
    <FlashMessage look="warning">This is a warning message.</FlashMessage>
  )))
  .add('Info', withInfo(`Generic information for the user should be displayed here.`)(() => (
    <FlashMessage look="info">This is an informational message.</FlashMessage>
  )))
  .add('Error', withInfo(`When an error has occured detail the error message in a user friendly manner, with an optional error code or technical explanation at the end.`)(() => (
    <FlashMessage look="error">This is an error message.</FlashMessage>
  )))
  .add('Success', withInfo(`When an action has successfully completed display a message to indicate that status.`)(() => (
    <FlashMessage look="success">This is a success message.</FlashMessage>
  )))

storiesOf('Heading', module)
  .add('Huge', withInfo()(() => (
    <Heading size="huge">This Heading Is Absolutely Huge</Heading>
  )))
  .add('Large', withInfo()(() => (
    <Heading size="large">This Heading Is Absolutely Large</Heading>
  )))
  .add('Medium', withInfo()(() => (
    <Heading size="medium">This Heading Is Absolutely Medium</Heading>
  )))
  .add('Small', withInfo()(() => (
    <Heading size="small">This Heading Is Absolutely Small</Heading>
  )))
  .add('Tiny', withInfo()(() => (
    <Heading size="tiny">This Heading Is Absolutely Tiny</Heading>
  )))
  .add('Micro', withInfo()(() => (
    <Heading size="micro">This Heading Is Absolutely Micro</Heading>
  )))

  storiesOf('Input', module)
    .add('Normal', withInfo()(() => (
      <Input  />
    )))

  storiesOf('Label', module)
    .add('Horizontal', withInfo()(() => (
      <Label label="Your name">
        <Input />
      </Label>
    )))
    .add('Vertical', withInfo()(() => (
      <Label vertical={true} label="Your name">
        <Input />
      </Label>
    )))

  storiesOf('Radio', module)
    .add('Radio', withInfo()(() => (
        <form>
        <Label afterLabel="Vanilla">
          <Radio name="flavors" value="vnll" />
        </Label>
        <Label afterLabel="Strawberry">
          <Radio name="flavors" value="sbry" />
        </Label>
        <Label afterLabel="Chocolate">
          <Radio name="flavors" value="choc" />
        </Label>
      </form>
    )))
