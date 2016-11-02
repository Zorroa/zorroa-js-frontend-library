import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({ isOpen, isParent, isIconified, label, openIcon, closeIcon }) => (
  <div className='CollapsibleHeader flexRow flexAlignItemsCenter fullWidth'>
    <span className={classnames('CollapsibleHeader-icon', isOpen ? openIcon : closeIcon, {isOpen, isIconified})} />
    { !isIconified && <div className='CollapsibleHeader-label'>{label}</div>}
    <div className='flexOn'/>
    { isParent && !isIconified && <div className={classnames('CollapsibleHeader-caret', 'icon-chevron-down', { 'rot180': isOpen })}/> }
  </div>
)

CollapsibleHeader.propTypes = {
  isOpen: PropTypes.bool,
  isParent: PropTypes.bool,
  isIconified: PropTypes.bool.isRequired,
  label: PropTypes.node.isRequired,
  openIcon: PropTypes.string.isRequired,
  closeIcon: PropTypes.string.isRequired
}

export default CollapsibleHeader
