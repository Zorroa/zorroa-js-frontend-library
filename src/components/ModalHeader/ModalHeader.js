import React, { PropTypes } from 'react'

const ModalHeader = (props) => {
  const { children, closeFn } = props
  const style = {}
  return (
    <div className='ModalHeader' style={style}>
      <div className='ModalHeader-title'>
        { children }
      </div>
      <div className='ModalHeader-close'>
        <div className='icon-cross2' onClick={_ => closeFn && closeFn()}/>
      </div>
    </div>
  )
}

ModalHeader.propTypes = {
  children: PropTypes.node,
  closeFn: PropTypes.func
}

export default ModalHeader
