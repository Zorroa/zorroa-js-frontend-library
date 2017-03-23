import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetCounter from './AssetCounter'
import AssetSearch from '../../models/AssetSearch'
import { searchAssets } from '../../actions/assetsAction'

class Pager extends Component {
  static propTypes = {
    loaded: PropTypes.number.isRequired,
    collapsed: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onUncollapse: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    top: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch).isRequired
  }

  handleLoadPage () {
    const { query, loaded } = this.props
    var nextPageQuery = new AssetSearch(query)
    nextPageQuery.from = loaded
    nextPageQuery.size = AssetSearch.autoPageSize
    console.log('Loading ' + nextPageQuery.size + ' from ' + nextPageQuery.from)
    this.props.actions.searchAssets(nextPageQuery)
  }

  render () {
    const { loaded, collapsed, total, onUncollapse } = this.props
    if (loaded < total && loaded % AssetSearch.maxPageSize) {
      const ellipsis = require('./ellipsis.gif')
      return <div className="Pager-waiting flexRowCenter" style={{top: this.props.top + 'px'}}><img className="Pager-waiting" src={ellipsis}/></div>
    }
    if (loaded >= total) return <div className="Pager-hidden" style={{top: this.props.top + 'px'}}/>
    return (
      <div className="Pager flexRowCenter" style={{top: this.props.top + 'px'}}>
        <div className="Pager-showing-page">
          <span className='Pager-showing'></span>
          <AssetCounter loaded={loaded} collapsed={collapsed} total={total}
                        onUncollapse={onUncollapse} />
        </div>

        <div className="flexOn"/>

        <button onClick={this.handleLoadPage.bind(this)}>
          MORE
        </button>

        <div className="flexOn"/>
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
