import React, { PropTypes } from 'react'

const FilterHeader = (props) => (
  <div className="filter-header flexRow fullWidth">
    <div className="flexRow flexAlignItemsCenter">
      <span className={`filter-header-icon ${props.icon}`} />
      <div>{props.label}</div>
    </div>
    <div className='flexOn'/>
    {props.onClose ? <div className="icon-cross2" onClick={props.onClose} /> : <div/>}
  </div>
)

FilterHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClose: PropTypes.func
}

export default FilterHeader
