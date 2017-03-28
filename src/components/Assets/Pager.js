import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetSearch from '../../models/AssetSearch'
import { searchAssets } from '../../actions/assetsAction'

class Pager extends Component {
  static propTypes = {
    loaded: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    actions: PropTypes.object.isRequired,
    top: PropTypes.number.isRequired,
    query: PropTypes.instanceOf(AssetSearch).isRequired
  }

  handleLoadPage () {
    const {query, loaded} = this.props
    var nextPageQuery = new AssetSearch(query)
    nextPageQuery.from = loaded
    nextPageQuery.size = AssetSearch.autoPageSize
    console.log('Loading ' + nextPageQuery.size + ' from ' + nextPageQuery.from)
    this.props.actions.searchAssets(nextPageQuery)
  }

  render () {
    const {loaded, total} = this.props
    if (loaded < total) {
      const ellipsis = require('./ellipsis.gif')
      return (
        <div className="Pager-waiting flexRowCenter"
             style={{top: this.props.top + 'px'}}>
          <img className="Pager-waiting" src={ellipsis}/>
        </div>
      )
    }
    return <div className="Pager" style={{top: this.props.top + 'px'}}/>
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
