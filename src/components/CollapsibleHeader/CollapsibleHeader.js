import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({ isOpen, isParent, isCollapsed, label, openIcon, closeIcon }) => (
  isCollapsed ? (
      <div className="collapsible-header-collapsed">
        <span className={closeIcon} />
      </div>
    ) : (
    <div className='collapsibleheader flexCenter fullWidth'>
      <span className={'collapsibleheader-icon ' + (isOpen ? openIcon : closeIcon)}/>
      {label}
      <div className='flexOn'/>
      { isParent && <div className={classnames('collapsibleheader-caret', 'icon-arrow-down', { 'rot180': isOpen })}/> }
    </div>
  )
)

CollapsibleHeader.propTypes = {
  isOpen: PropTypes.bool,
  isParent: PropTypes.bool,
  isCollapsed: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  openIcon: PropTypes.string.isRequired,
  closeIcon: PropTypes.string.isRequired
}

export default CollapsibleHeader
