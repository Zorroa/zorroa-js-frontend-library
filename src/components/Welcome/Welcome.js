import React, { Component } from 'react'
import DropdownMenu from '../DropdownMenu'

export default class Welcome extends Component {
  render () {
    return (
      <div>
        Welcome to our little world.

        <div>
          <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
            <a onClick={() => { console.log('1 clicked') }}>test 1</a>
            <a onClick={() => { console.log('2 clicked') }}>test 2</a>
          </DropdownMenu>
          <DropdownMenu label="My Drop Down" style={{ width: 200 }}>
            <a onClick={() => { console.log('3 clicked') }}>test 3</a>
            <a onClick={() => { console.log('4 clicked') }}>test 4</a>
          </DropdownMenu>
        </div>
      </div>
    )
  }
}
