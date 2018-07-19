import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'

const CollapsibleHeader = ({
  isOpen,
  isParent,
  isIconified,
  isSelected,
  header,
  openIcon,
  closeIcon,
  onOpen,
  onSelect,
}) => {
  const iconClass = isOpen && openIcon ? openIcon : closeIcon
  const hasIcon = !!iconClass
  const iconClassNames = classnames(
    'CollapsibleHeader-icon',
    'flexOff',
    'flexRowCenter',
    { isOpen, isIconified, isSelected },
  )

  return (
    <div
      className={classnames(
        'CollapsibleHeader',
        'flexRow',
        'flexAlignItemsCenter',
        'fullWidth',
        { isOpen, isSelected },
      )}>
      <div
        className={classnames(
          'CollapsibleHeader-select',
          'flexOn',
          'flexRow',
          'flexAlignItemsCenter',
          'fullWidth',
          'fullHeight',
          { isIconified },
        )}
        onClick={onSelect || onOpen}>
        {hasIcon && (
          <div className={iconClassNames}>
            <i className={iconClass} />
          </div>
        )}
        {!isIconified && (
          <div className="CollapsibleHeader-label">{header}</div>
        )}
        {!isIconified && <div className="flexOn" />}
      </div>
      {isParent &&
        !isIconified && (
          <div
            className="CollapsibleHeader-open flexOff flexCenter fullHeight"
            onClick={onOpen}>
            <div
              className={classnames(
                'CollapsibleHeader-caret',
                'icon-arrow-down',
                { isOpen, isSelected },
              )}
            />
          </div>
        )}
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
  closeIcon: PropTypes.string,
  onOpen: PropTypes.func,
  onSelect: PropTypes.func,
}

export default CollapsibleHeader
