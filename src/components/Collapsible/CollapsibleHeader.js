import React, { PropTypes } from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({ isOpen, isParent, isIconified, isSelected, header, openIcon, closeIcon, onOpen, onSelect }) => {
  const iconClass = (isOpen && openIcon) ? openIcon : closeIcon
  const hasIcon = !!iconClass
  const iconClassNames = classnames('CollapsibleHeader-icon', iconClass,
    { isOpen, isIconified, isSelected })

  return (
    <div className={classnames('CollapsibleHeader', 'flexCenter', 'flexAlignItemsCenter', 'fullWidth', {isSelected})}>
      <div className='CollapsibleHeader-select flexRowCenter fullWidth fullHeight' onClick={onSelect || onOpen}>
        { hasIcon && (<div className={iconClassNames}/>) }
        { !isIconified && header }
        <div className='flexOn'/>
      </div>
      {
        isParent && !isIconified && (
          <div className='CollapsibleHeader-open flexOff flexCenter fullHeight' onClick={onOpen}>
            <div className={classnames('CollapsibleHeader-caret', 'icon-chevron-down', { 'rot180': isOpen, isSelected })}/>
          </div>
        )
      }
    </div>
    )
}

CollapsibleHeader.propTypes = {
  isOpen: PropTypes.bool,
  isParent: PropTypes.bool,
  isIconified: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool,
  header: PropTypes.element.isRequired,
  openIcon: PropTypes.string,
  closeIcon: PropTypes.string.isRequired,
  onOpen: PropTypes.func,
  onSelect: PropTypes.func
}

export default CollapsibleHeader
