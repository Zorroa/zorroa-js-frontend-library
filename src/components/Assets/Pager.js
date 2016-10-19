import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetCounter from './AssetCounter'

import { searchAssets } from '../../actions/assetsAction'

class Pager extends Component {
  static get propTypes () {
    return {
      loaded: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      actions: PropTypes.object.isRequired,
      query: PropTypes.object
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      pageSize: 100
    }
  }

  handlePageSize (dim) {
    this.setState({
      pageSize: dim
    }, () => {
      console.info('Set page size to ' + this.state.pageSize)
    })
  }

  // FIXME: This does NOT work correctly if you change the page size
  //        after starting a search because pages are specified by index
  handleLoadPage () {
    const { query, loaded } = this.props
    const { pageSize } = this.state
    var nextPageQuery = query ? JSON.parse(JSON.stringify(query)) : {}
    nextPageQuery.from = loaded
    nextPageQuery.size = pageSize
    console.log('Loading ' + nextPageQuery.size + ' from ' + nextPageQuery.from)
    this.props.actions.searchAssets(nextPageQuery)
  }

  render () {
    const { pageSize } = this.state
    const { loaded, total } = this.props
    const pageSizes = [ 100, 1000, 5000, 10000 ]
    if (total <= 25000) {
      pageSizes.push(0)
    }
    return (
      <div className="pager">
        <div className="pager-showing-page">
          SHOWING&nbsp;<AssetCounter loaded={loaded} total={total} />
        </div>
        <div className="pager-spacer" />
        <button onClick={this.handleLoadPage.bind(this)}>LOAD&nbsp;{ pageSize <= 0 || loaded + pageSize >= total ? 'ALL' : 'NEXT ' + pageSize.toLocaleString() }</button>
        <div className="pager-spacer" />
        <div className="pager-page-size">
          <div>LOAD SETS OF</div>
          { pageSizes.map(dim => (
            <button key={dim} onClick={this.handlePageSize.bind(this, dim)} className={classnames('pager-page-size', { 'pager-page-size-selected': dim === pageSize })}>
              { dim <= 0 ? 'LOAD ALL' : dim.toLocaleString() }
            </button>
          ))}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ searchAssets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Pager)
