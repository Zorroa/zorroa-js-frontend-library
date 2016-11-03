import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({ isOpen, isParent, isIconified, isSelected, label, openIcon, closeIcon, onOpen, onSelect }) => (
  <div onClick={onSelect || onOpen} className={classnames('CollapsibleHeader', 'flexCenter', 'fullWidth', 'flexAlignItemsCenter', {isSelected})}>
    <div className={classnames('CollapsibleHeader-icon', isOpen ? openIcon : closeIcon, {isOpen, isIconified, isSelected})} />
    { !isIconified && (<div onClick={onSelect}>{label}</div>) }
    <div className='flexOn'/>
    { isParent && !isIconified && <div onClick={onOpen} className={classnames('CollapsibleHeader-caret', 'icon-chevron-down', { 'rot180': isOpen, isSelected })}/> }
  </div>
)

CollapsibleHeader.propTypes = {
  isOpen: PropTypes.bool,
  isParent: PropTypes.bool,
  isIconified: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool,
  label: PropTypes.node.isRequired,
  openIcon: PropTypes.string.isRequired,
  closeIcon: PropTypes.string.isRequired,
  onOpen: PropTypes.func,
  onSelect: PropTypes.func
}

export default CollapsibleHeader
