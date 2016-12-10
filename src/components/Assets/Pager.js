import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetCounter from './AssetCounter'
import AssetSearch from '../../models/AssetSearch'
import { searchAssets, setPageSize } from '../../actions/assetsAction'

class Pager extends Component {
  static propTypes = {
    loaded: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    actions: PropTypes.object.isRequired,
    top: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch).isRequired
  }

  handlePageSize (dim) {
    this.props.actions.setPageSize(dim)
  }

  handleLoadPage () {
    const { query, loaded, total, pageSize } = this.props
    var nextPageQuery = new AssetSearch(query)
    nextPageQuery.from = loaded
    nextPageQuery.size = Math.min(AssetSearch.maxPageSize, pageSize === 0 ? total - loaded : pageSize)
    console.log('Loading ' + nextPageQuery.size + ' from ' + nextPageQuery.from)
    this.props.actions.searchAssets(nextPageQuery)
  }

  render () {
    const { loaded, total, pageSize } = this.props
    if (loaded >= total) return <div className="Pager-hidden" style={{top: this.props.top + 'px'}}/>
    const stdPageSizes = [ 100, 1000, 10000 ]
    if (total - loaded <= AssetSearch.maxPageSize) {
      stdPageSizes.push(0)
    }
    const pageSizes = stdPageSizes.filter(dim => (loaded + dim < total))
    return (
      <div className="Pager flexRowCenter" style={{top: this.props.top + 'px'}}>
        <div className="Pager-showing-page">
          <span className='Pager-showing'></span><AssetCounter loaded={loaded} total={total} />
        </div>

        <div className="flexOn"/>

        <button onClick={this.handleLoadPage.bind(this)}>
          LOAD&nbsp;{ pageSize <= 0 || loaded + pageSize >= total ? 'ALL' : 'NEXT ' + pageSize.toLocaleString() }
        </button>

        <div className="flexOn"/>

        <div className="Pager-page-size flexRowCenter">
          <div>LOAD SETS OF</div>
          { pageSizes.map(dim => (
            <button key={dim} onClick={this.handlePageSize.bind(this, dim)} className={classnames('Pager-page-size', { 'Pager-page-size-selected': dim === pageSize })}>
              { dim <= 0 ? 'LOAD ALL' : dim.toLocaleString() }
            </button>
          ))}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ searchAssets, setPageSize }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  pageSize: state.assets.pageSize
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Pager)
