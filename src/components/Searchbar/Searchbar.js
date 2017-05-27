import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { suggestQueryStrings, searchAssets } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SimpleSearchWidgetInfo } from '../Racetrack/WidgetInfo'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import Suggestions from '../Suggestions'

const INSTA_SEARCH_TIME = 1500

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    error: PropTypes.string,
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    userSettings: PropTypes.object.isRequired
  }

  // instaSearchTimer = null
  showSuggestions = true

  state = {
    queryString: this.props.query && this.props.query.query
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  componentDidUpdate () {
    const { query } = this.props
    const { queryString } = this.state
    if (query && query.query !== queryString) {
      this.setState({queryString: query.query})
    }
  }

  // Submit a new suggestion string to get a new list of suggestions
  // lastAction is 'type' or 'select' - whatever the user did to cause us to get here
  // (when 'type': start the search timer; when 'select': no timer)
  suggest = (suggestion, lastAction) => {
    // hide suggestions whenever the search input is cleared
    if (!suggestion) this.showSuggestions = false

    // clearTimeout(this.instaSearchTimer)
    if (lastAction === 'type') this.props.actions.suggestQueryStrings(suggestion)

    // this.instaSearchTimer = setTimeout(_ => {
    //   Promise.resolve()
    //   // set the query string just in case we're insta-searching for a suggestion
    //   .then(_ => { if (lastAction === 'select') return this.setStatePromise({ queryString: suggestion }) })
    //   .then(_ => this.search(suggestion))
    // }, INSTA_SEARCH_TIME)

    // show suggestions whenever the user types into the input
    this.showSuggestions = true
  }

  // Submit a new query string, replacing the first SimpleSearch widget
  // if one already exists, or adding a new one if none in racetrack.
  search = (query) => {
    const { fuzzy } = this.props.userSettings
    const sliver = new AssetSearch({ query, fuzzy })
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
    // clearTimeout(this.instaSearchTimer)
    // this.instaSearchTimer = null
    // hide suggestions whenever a search is performed
    this.showSuggestions = false
  }

  forceSearch = () => {
    const { query, actions } = this.props
    const force = true
    actions.searchAssets(query, query, force)
  }

  render () {
    const { query, suggestions, error } = this.props
    const { queryString } = this.state
    const value = query && query.query && query.query !== queryString ? query.query
      : (query && query.query === undefined && queryString ? '' : undefined)

    return (
      <div className="Searchbar">
        <div className="Searchbar-body flexCenter">
          <Suggestions suggestions={suggestions}
                       showSuggestions={this.showSuggestions}
                       query={query}
                       value={value}
                       onChange={this.suggest}
                       onSelect={this.search.bind(this)} />
          <button onClick={this.forceSearch} className="search-button icon-search" />
        </div>
        { error && <div className="Searchbar-error">Search syntax error</div> }
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ resetRacetrackWidgets, suggestQueryStrings, searchAssets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets && state.assets.query,
  error: state.assets && state.assets.error,
  totalCount: state.assets && state.assets.totalCount,
  suggestions: state.assets && state.assets.suggestions,
  widgets: state.racetrack && state.racetrack.widgets,
  userSettings: state.app.userSettings
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searchbar)
