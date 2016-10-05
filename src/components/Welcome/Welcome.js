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

        <div>
          <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
            <div>test 1</div>
            <div>test 2</div>
          </DropdownMenu>
          <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
            <div>test 3</div>
            <div>test 4</div>
          </DropdownMenu>
        </div>
      </div>
    )
  }
}
