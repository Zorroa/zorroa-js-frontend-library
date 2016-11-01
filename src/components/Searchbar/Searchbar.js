import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SIMPLE_SEARCH_WIDGET } from '../../constants/widgetTypes'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    totalCount: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.state = { queryString: props.query ? props.query.query : '' }
  }

  // Update local state whenever the global query changes
  componentWillReceiveProps (nextProps) {
    this.setState({ queryString: nextProps.query && nextProps.query.query ? nextProps.query.query : '' })
  }

  // Update state in <input> onChange
  updateQueryString (event) {
    this.setState({ queryString: event.target.value })
  }

  // Submit a new search for <input> submit
  modifySliver (event) {
    if (event.key === 'Enter') {
      const sliver = new AssetSearch({ query: this.state.queryString })
      const widget = new Widget({ type: SIMPLE_SEARCH_WIDGET, sliver })
      this.props.actions.resetRacetrackWidgets([widget])
    }
  }

  render () {
    return (
      <div>
        <div className="searchbar-group flexCenter">
          <input value={this.state.queryString}
                 onChange={this.updateQueryString.bind(this)}
                 onKeyPress={this.modifySliver.bind(this)}
                 placeholder="Search..." type="text" width="70%" className="searchbar" />
          <button action={this.modifySliver.bind(this, {key: 'Enter'})} className="searchbar-submit searchbar-button icon-search"></button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ resetRacetrackWidgets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets ? state.assets.query : null,
  totalCount: state.assets ? state.assets.totalCount : null
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searchbar)
