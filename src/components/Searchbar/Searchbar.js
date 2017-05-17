import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { suggestQueryStrings, searchAssets } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SimpleSearchWidgetInfo } from '../Racetrack/WidgetInfo'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import Suggestions from '../Suggestions'

const INSTA_SEARCH_TIME = 1000

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget))
  }

  instaSearchTimer = null
  showSuggestions = true

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
    // hide suggestions whenever the search input is cleared
    if (!suggestion) this.showSuggestions = false

    this.props.actions.suggestQueryStrings(suggestion)
    clearTimeout(this.instaSearchTimer)
    this.instaSearchTimer = setTimeout(_ => {
      this.search(suggestion)
    }, INSTA_SEARCH_TIME)
    // show suggestions whenever the user types into the input
    this.showSuggestions = true
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
    clearTimeout(this.instaSearchTimer)
    this.instaSearchTimer = null
    // hide suggestions whenever a search is performed
    this.showSuggestions = false
  }

  forceSearch = () => {
    const { query, actions } = this.props
    const force = true
    actions.searchAssets(query, query, force)
  }

  render () {
    const { query, suggestions } = this.props
    const { queryString } = this.state
    const value = this.showSuggestions && query && query.query && query.query !== queryString ? query.query
      : (query && query.query === undefined && queryString ? '' : undefined)
    return (
      <div className="Searchbar">
        <div className="Searchbar-body flexCenter">
          <Suggestions suggestions={suggestions}
                       value={value}
                       onChange={this.suggest}
                       onSelect={this.search} />
          <button onClick={this.forceSearch} className="search-button icon-search" />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ resetRacetrackWidgets, suggestQueryStrings, searchAssets }, dispatch)
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
