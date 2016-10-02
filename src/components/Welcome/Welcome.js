import React, { Component } from 'react'
import Accordion from '../Accordion'

export default class Welcome extends Component {
  render () {
    return (
      <div>
        Welcome to our little world.
        <Accordion>
          <div>Hi</div>
          <div>There</div>
          <div>buddy</div>
          <div>One more</div>
        </Accordion>
      </div>
    )
  }
}
