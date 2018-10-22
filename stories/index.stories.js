import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, FlashMessage } from '../src/lib'

storiesOf('Button', module)
  .add('With text', () => <Button>Hello Button</Button>)
  .add('With some emoji', () => (
    <Button onClick={action('clicked')}>
        😀 😎 👍 💯
    </Button>
  ))
  .add('Minimal', () => (
    <Button look="minimal">Minimal</Button>
  ))
  .add('Mini', () => (
    <Button look="mini">Mini</Button>
  ))
  .add('Loading', () => (
    <Button state="loading">Loading</Button>
  ))
  .add('Success', () => (
    <Button state="success">Loaded!</Button>
  ))
  .add('Error', () => (
    <Button state="error">Whooops</Button>
  ))
  .add('Disabled', () => (
    <Button disabled={true}>Can Not</Button>
  ))

storiesOf('FlashMessage', module)
  .add('Warning', () => (
    <FlashMessage look="warning">This is a warning message.</FlashMessage>
  ))
  .add('Info', () => (
    <FlashMessage look="info">This is an informational message.</FlashMessage>
  ))
  .add('Error', () => (
    <FlashMessage look="error">This is an error message.</FlashMessage>
  ))
  .add('Success', () => (
    <FlashMessage look="success">This is a success message.</FlashMessage>
  ))
