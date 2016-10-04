import React, { Component } from 'react'
import SelectMenu from '../SelectMenu'
import DropdownMenu from '../DropdownMenu'

export default class Welcome extends Component {
  render () {
    const options = [
      { label: 'Test 1', value: true },
      { label: 'Test 2', value: false }
    ]

    return (
      <div>
        Welcome to our little world.

        <br />

        <SelectMenu cb={(stuff) => { console.log(stuff) }} options={options} />

        <br />

        <DropdownMenu label="test">
          <div>test 1</div>
          <div>test 2</div>
        </DropdownMenu>
      </div>
    )
  }
}
