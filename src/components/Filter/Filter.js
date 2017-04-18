import React, { PropTypes } from 'react'

const Filter = (props) => (
  <div className={`Filter ${props.className}`}>
    <input className="Filter-input"
           placeholder={props.placeholder}
           value={props.value} onChange={props.onChange}/>
    <div onClick={props.onSearch} className="icon-search"/>
    { props.value && props.value.length && props.onClear && <div onClick={props.onClear} className="Filter-clear icon-cancel-circle"/> }
  </div>
)

Filter.propTypes = {
  value: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  onSearch: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string
}

export default Filter
