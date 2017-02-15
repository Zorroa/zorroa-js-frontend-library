import React, { PropTypes } from 'react'
import classnames from 'classnames'

const SortingSelector = (props) => (
  <div className="SortingSelector">
    Sort By
    <div onClick={e => { props.sortAssets() }}
         className={classnames('SortingSelector-sort',
           {'SortingSelector-enabled': !props.order || !props.order.length})}>
      Relevance
    </div>
    <div onClick={e => { props.sortAssets('source.filename', true) }}
         className={classnames('SortingSelector-sort',
           {'SortingSelector-enabled': props.order && props.order.length >= 1 && props.order[0].field === 'source.filename'})}>
      Alphabetical {props.order && props.order.length >= 1 && props.order[0].field === 'source.filename' && !props.order[0].ascending ? '(Z-A)' : '(A-Z)'}
    </div>
    <div className={classnames('SortingSelector-sort',
      {'SortingSelector-enabled': props.order && props.order.length && props.order[0].field !== 'source.filename'},
      {'SortingSelector-disabled': !props.order || !props.order.length || props.order[0].field === 'source.filename'})}>
      Table Column
    </div>
  </div>
)

SortingSelector.propTypes = {
  order: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortAssets: PropTypes.func.isRequired
}

export default SortingSelector
