import React, { PropTypes } from 'react'

const FilterHeader = (props) => (
  <div className="filter-header flexRow fullWidth">
    <span className={props.icon} />
    <div className='flexOn'/>
    <div>{props.label}</div>
    <div className='flexOn'/>
    <div className="icon-cross2" onClick={props.onClose} />
  </div>
)

FilterHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
}

export default FilterHeader
