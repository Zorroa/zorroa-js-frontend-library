import React, { PropTypes } from 'react'
import classnames from 'classnames'

const SortingSelector = (props) => (
  <div className="SortingSelector">
    <div className="SortingSelector-title">Sort By</div>
    <div onClick={props.sortAssets}
         className={classnames('SortingSelector-sort',
           {'SortingSelector-selected': !props.similarActive &&
           (!props.order || !props.order.length)})}>
      Latest
    </div>
    { props.showSimilar &&
      <div onClick={props.sortSimilar} className="SortingSelector-similar">
        { props.similarActive && !props.similarValuesSelected &&
        <div onClick={props.sortSimilar}
             className="icon-settings_backup_restore">&thinsp;</div> }
        <div className={classnames('SortingSelector-sort',
          { 'SortingSelector-selected': props.similarActive,
            'SortingSelector-disabled': !props.sortSimilar
          })}>
          Similar
        </div>
      </div>
    }
    { props.showAlphabetical &&
      <div onClick={e => { props.sortAssets('source.filename', true) }}
           className={classnames('SortingSelector-sort',
             {'SortingSelector-enabled': props.order && props.order.length >= 1 &&
             props.order[0].field === 'source.filename'})}>
        Alphabetical {props.order && props.order.length >= 1 && props.order[0].field === 'source.filename' && !props.order[0].ascending ? '(Z-A)' : '(A-Z)'}
      </div>
    }
    <div className={classnames('SortingSelector-sort',
      {'SortingSelector-selected': props.order && props.order.length && props.order[0].field !== 'source.filename'},
      {'SortingSelector-disabled': !props.order || !props.order.length || props.order[0].field === 'source.filename'})}>
      Table Column
    </div>
  </div>
)

SortingSelector.propTypes = {
  order: PropTypes.arrayOf(PropTypes.object),
  sortAssets: PropTypes.func.isRequired,
  showAlphabetical: PropTypes.bool,
  showSimilar: PropTypes.bool,
  sortSimilar: PropTypes.func,
  similarActive: PropTypes.bool,
  similarValuesSelected: PropTypes.bool
}

export default SortingSelector
