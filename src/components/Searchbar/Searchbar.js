import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { suggestQueryStrings } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SimpleSearchWidgetInfo } from '../Racetrack/WidgetInfo'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import Suggestions from '../Suggestions'

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget))
  }

  state = {
    queryString: this.props.query && this.props.query.query
  }

  componentDidUpdate () {
    const { query } = this.props
    const { queryString } = this.state
    if (query && query.query !== queryString) {
      this.setState({queryString: query.query})
    }
  }

  // Submit a new suggestion string to get a new list of suggestions
  suggest = (suggestion) => {
    this.props.actions.suggestQueryStrings(suggestion)
  }

  // Submit a new query string, replacing the first SimpleSearch widget
  // if one already exists, or adding a new one if none in racetrack.
  search = (query) => {
    const sliver = new AssetSearch({ query })
    const widget = new Widget({ type: SimpleSearchWidgetInfo.type, sliver })
    const index = this.props.widgets && this.props.widgets.findIndex(widget => (
      widget.type === SimpleSearchWidgetInfo.type))
    let widgets = [...this.props.widgets]
    if (index < 0) {
      widgets.unshift(widget)
    } else {
      widgets[index] = widget
    }
    this.props.actions.resetRacetrackWidgets(widgets)
  }

  render () {
    const { query, suggestions } = this.props
    const { queryString } = this.state
    const value = query && query.query && query.query !== queryString ? query.query
      : (query && query.query === undefined && queryString ? '' : undefined)
    return (
      <div className="Searchbar">
        <div className="Searchbar-body flexCenter">
          <Suggestions suggestions={suggestions}
                       value={value}
                       onChange={this.suggest}
                       onSelect={this.search} />
          <button onClick={this.selectCurrentQueryString} className="search-button icon-search" />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ resetRacetrackWidgets, suggestQueryStrings }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets && state.assets.query,
  totalCount: state.assets && state.assets.totalCount,
  suggestions: state.assets && state.assets.suggestions,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searchbar)
