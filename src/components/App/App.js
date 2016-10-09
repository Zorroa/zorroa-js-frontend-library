import React from 'react'

// Placeholder component to authenticate the index route
const App = (props) => (
  <div>
    {props.children}
  </div>
)

App.propTypes = {
  children: React.PropTypes.object
}

export default App
