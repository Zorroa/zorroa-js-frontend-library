import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { suggestQueryStrings } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SIMPLE_SEARCH_WIDGET } from '../../constants/widgetTypes'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object)
  }

  constructor (props) {
    super(props)

    // Store the current input value in queryString, and the original
    // state.assets.query in origQueryString to invalidate state cache
    const queryString = props.query ? props.query.query : ''
    this.state = { queryString, origQueryString: queryString }
  }

  // Update local state whenever the global query changes
  componentWillReceiveProps (nextProps) {
    const { origQueryString } = this.state
    const queryString = nextProps.query && nextProps.query.query ? nextProps.query.query : ''
    if (queryString !== origQueryString) {
      this.setState({ ...this.state, queryString, origQueryString: queryString })
    }
  }

  // Update state in <input> onChange
  updateQueryString (event) {
    this.setState({ ...this.state, queryString: event.target.value })
    this.props.actions.suggestQueryStrings(event.target.value)
  }

  // Submit a new search for <input> submit if Enter is pressed
  modifySliver (event) {
    if (event.key === 'Enter') {
      this.resetSearch(this.state.queryString)
    } else if (event.key === 'Tab') {
      const { suggestions } = this.props
      if (suggestions && suggestions.length) {
        this.chooseSuggestion(suggestions[0])
      }
    }
  }

  // Select a specific suggestion and submit
  chooseSuggestion (suggestion) {
    console.log('Suggest: ' + suggestion.text + ' (' + suggestion.score)
    this.setState({ ...this.state, queryString: suggestion.text })
    this.resetSearch(suggestion.text)
  }

  // Submit a new search, resetting the racetrack
  resetSearch (query) {
    const sliver = new AssetSearch({ query })
    const widget = new Widget({ type: SIMPLE_SEARCH_WIDGET, sliver })
    this.props.actions.resetRacetrackWidgets([widget])
  }

  render () {
    const { queryString } = this.state
    const { suggestions } = this.props
    return (
      <div>
        <div className="searchbar-group flexCenter">
          <input value={queryString}
                 onChange={this.updateQueryString.bind(this)}
                 onKeyDown={this.modifySliver.bind(this)}
                 placeholder="Search..." type="text" width="70%" className="searchbar" />
          <button action={this.modifySliver.bind(this, {key: 'Enter'})} className="searchbar-submit searchbar-button icon-search"></button>
        </div>
        { suggestions && suggestions.length ? (
          <div className="searchbar-suggestions fullWidth">
            <ul>
              { suggestions.map(suggestion => (
                <li key={suggestion.text}>
                  <div onClick={this.chooseSuggestion.bind(this, suggestion)} className="flexRow flexJustifySpaceBetween fullWidth">
                    <div>{suggestion.text}</div>
                    <div>{suggestion.score}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : <div/>}
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
  suggestions: state.assets && state.assets.suggestions
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Searchbar)
