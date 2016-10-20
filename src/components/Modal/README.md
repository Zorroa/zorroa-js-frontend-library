# React Modal

This is a modal component to be used with when the normal UI flow needs to be interrupted for some specific user interaction.  In order for the modal to be visible, it either needs to have content or children props passed to it.   It also will dim the full viewport while active.

## Dependencies
- React JS

## Params

- children {jsx}: JSX to be rendered in the modal body
- content {string}: Basic text to be placed in the modal body
- footer {string}: TODO
- dismiss {function}: the callback function to be called when the modal is closed. this function needs to clear the props passes into the modal component
- title {string}: the content that is placed in the header

## Example Usage

**ES6**

```
import React, { Component } from 'react'

export default class Modal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      modalTitle: 'I am a title',
      modalChildren: (<h1>I am JSX</h1>),
      modalContent: 'I am some plain old content'
    }

    this.dismissModal = this.dismissModal.bind(this)
  }

  dismissModal () {
    this.setState({
      modalTitle: null,
      modalChildren: null,
      modalContent: null
    })
  }

  render () {
    <Modal title={this.state.modalTitle} content={this.state.modalContent} dismiss={this.dismissModal}>
      {this.state.modalChildren}
    </Modal>
  }
}
```

### Example usage for turning on the modal

```
this.props.updateModal({
  title: 'test',
  content: (<Logo />),
  footer: (
    <div>
      <button className="zorroa-btn">Footer button</button>
    </div>
  )
})
```
