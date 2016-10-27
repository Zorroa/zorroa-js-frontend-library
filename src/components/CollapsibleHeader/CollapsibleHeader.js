import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({ isOpen, isParent, isCollapsed, label, openIcon, closeIcon, sidebarIsOpen }) => (
  isCollapsed ? (
      <div className="collapsible-header-collapsed">
        <span className={closeIcon} />
      </div>
    ) : (
    <div className='collapsibleheader flexCenter fullWidth'>
      <span className={'collapsibleheader-icon ' + (isOpen ? openIcon : closeIcon)}/>
      { (sidebarIsOpen) && label}
      <div className='flexOn'/>
      { isParent && sidebarIsOpen && <div className={classnames('collapsibleheader-caret', 'icon-chevron-down', { 'rot180': isOpen })}/> }
    </div>
  )
)

CollapsibleHeader.propTypes = {
  isOpen: PropTypes.bool,
  isParent: PropTypes.bool,
  isCollapsed: PropTypes.bool.isRequired,
  label: PropTypes.node.isRequired,
  openIcon: PropTypes.string.isRequired,
  closeIcon: PropTypes.string.isRequired,
  sidebarIsOpen: PropTypes.bool.isRequired
}

export default CollapsibleHeader
