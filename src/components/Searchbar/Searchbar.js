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
    error: PropTypes.string,
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget)),
    userSettings: PropTypes.object.isRequired,
    order: PropTypes.arrayOf(PropTypes.object)
  }

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
    if (lastAction === 'type') this.props.actions.suggestQueryStrings(suggestion)
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
      widgets.push(widget)
    } else if (index >= 0 && !query || !query.length) {
      widgets.splice(index, 1)
    } else {
      widgets[index] = widget
    }
    this.props.actions.resetRacetrackWidgets(widgets)
  }

  render () {
    const { query, suggestions, error } = this.props
    const { queryString } = this.state
    const value = query && query.query && query.query !== queryString ? query.query
      : (query && query.query === undefined && queryString ? '' : undefined)
    const title = 'quikc~ brwn~ foks~\n+fox, -hen\nquick AND brown || !hen\n"exact match"\nqu?ck bro*\nmetaField:"quick brown"\nmulti.fiel\\*:(hen fox)\ncount:[10 TO *]'
    return (
      <div className="Searchbar">
        <div className="Searchbar-body flexCenter" title={title}>
          <Suggestions suggestions={suggestions}
                       query={query}
                       value={value}
                       onChange={this.suggest}
                       onSelect={this.search} />
        </div>
        { error && <div className="Searchbar-error">Search syntax error</div> }
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    resetRacetrackWidgets,
    suggestQueryStrings
  },
  dispatch)
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
