import React, { PropTypes } from 'react'
import classnames from 'classnames'

const FilterHeader = (props) => (
  <div className={classnames('filter-header', 'flexRow', 'fullWidth', { iconified: props.isIconified })}>
    <div className="flexRow flexAlignItemsCenter">
      <span className={`filter-header-icon ${props.icon}`} />
      { !props.isIconified && (<div>{props.label}</div>) }
    </div>
    { !props.isIconified && <div className='flexOn'/> }
    { !props.isIconified && props.onClose ? <div className="icon-cross2" onClick={props.onClose} /> : <div/> }
  </div>
)

FilterHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  isIconified: PropTypes.bool.isRequired,
  onClose: PropTypes.func
}

export default FilterHeader
