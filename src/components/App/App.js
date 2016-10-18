import React from 'react'
import Modal from '../Modal'

// Placeholder component to authenticate the index route
const App = (props) => (
  <div>
    <Modal title='Title' dismiss={() => { console.log('here') }}>
      <p>hi</p>
    </Modal>
    {props.children}
  </div>
)

App.propTypes = {
  children: React.PropTypes.object
}

export default App
