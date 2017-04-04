import React, { PropTypes } from 'react'

const Filter = (props) => (
  <div className="Filter">
    <input className="Filter-input"
           placeholder="Filter processor scripts"
           value={props.value} onChange={props.onChange}/>
    <div onClick={props.onSearch} className="icon-search"/>
    { props.onClear && <div onClick={props.onClear} className="Filter-clear icon-cancel-circle"/> }
  </div>
)

Filter.propTypes = {
  value: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  onSearch: PropTypes.func,
}

export default Filter
