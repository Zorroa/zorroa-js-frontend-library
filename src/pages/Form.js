import React from 'react'

export default function Form(props) {
  return (
    <div className="Page PageForm">
      <h1>Zorroa Design Library</h1>
      <pre>{JSON.stringify(props, undefined, 4)}</pre>
    </div>
  )
}
