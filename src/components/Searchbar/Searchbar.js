import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { suggestQueryStrings } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { SimpleSearchWidgetInfo } from '../Racetrack/WidgetInfo'
import Widget from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'

class Searchbar extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    query: PropTypes.instanceOf(AssetSearch),
    totalCount: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    widgets: PropTypes.arrayOf(PropTypes.instanceOf(Widget))
  }

  constructor (props) {
    super(props)

    // Store the current input value in queryString, and the original
    // state.assets.query in origQueryString to invalidate state cache
    const queryString = props.query ? props.query.query : ''
    this.state = {
      queryString,
      origQueryString: queryString,
      selectedSuggestionIndex: -1
    }
  }

  // Update local state whenever the global query changes
  componentWillReceiveProps (nextProps) {
    const { origQueryString, selectedSuggestionIndex } = this.state
    const queryString = nextProps.query && nextProps.query.query ? nextProps.query.query : ''
    if (queryString !== origQueryString) {
      this.setState({ queryString, origQueryString: queryString })
    }
    if (selectedSuggestionIndex < 0 && nextProps.suggestions && nextProps.suggestions.length) {
      this.setState({ selectedSuggestionIndex: 0 })
    }
  }

  // Update state in <input> onChange
  updateQueryString = (event) => {
    const queryString = event.target.value
    this.setState({ queryString })
    const suggest = queryString && queryString.length ? queryString : null
    this.props.actions.suggestQueryStrings(suggest)
  }

  clearQueryString = (event) => {
    const queryString = ''
    const { query } = this.props
    if (query && query.query && query.query.length) {
      this.resetSearch(queryString)
    }
    this.setState({ queryString })
    this.props.actions.suggestQueryStrings(null)
  }

  // Parse each keypress for special commands
  onKeyDown = (event) => {
    switch (event.key) {
      case 'Enter': return this.selectCurrentQueryString()
      case 'Tab': return this.selectCurrentSuggestion()
      case 'ArrowUp': return this.previousSuggestion()
      case 'ArrowDown': return this.nextSuggestion()
      default:
    }
  }

  selectCurrentQueryString = () => {
    this.resetSearch(this.state.queryString)
  }

  selectCurrentSuggestion = () => {
    const { suggestions } = this.props
    if (!suggestions) return
    const { selectedSuggestionIndex } = this.state
    const index = selectedSuggestionIndex < 0 ? 0 : selectedSuggestionIndex
    if (index < suggestions.length) {
      this.chooseSuggestion(suggestions[index])
    } else {
      this.selectCurrentQueryString()
    }
  }

  nextSuggestion = () => {
    const { suggestions } = this.props
    const { selectedSuggestionIndex } = this.state
    if (!suggestions) {
      if (selectedSuggestionIndex !== -1) {
        this.setState({ selectedSuggestionIndex: -1 })
        return
      }
    }
    const index = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1)
    if (index !== selectedSuggestionIndex) {
      this.setState({ selectedSuggestionIndex: index })
    }
  }

  previousSuggestion = () => {
    const { suggestions } = this.props
    const { selectedSuggestionIndex } = this.state
    if (!suggestions) {
      if (selectedSuggestionIndex !== -1) {
        this.setState({ selectedSuggestionIndex: -1 })
        return
      }
    }
    const index = Math.max(0, selectedSuggestionIndex - 1)
    if (index !== selectedSuggestionIndex) {
      this.setState({ selectedSuggestionIndex: index })
    }
  }

  // Select a specific suggestion and submit
  chooseSuggestion (suggestion) {
    console.log('Suggest: ' + suggestion.text + ' (' + suggestion.score)
    this.setState({ queryString: suggestion.text })
    this.resetSearch(suggestion.text)
  }

  selectedSuggestionString () {
    const { queryString, selectedSuggestionIndex } = this.state
    const { suggestions } = this.props
    if (selectedSuggestionIndex < 0 || !suggestions) return ''
    const suggestion = suggestions[selectedSuggestionIndex]
    const suffix = suggestion && suggestion.text ? suggestion.text.slice(queryString.length) : ''
    return queryString + suffix
  }

  // Submit a new query string, replacing the first SimpleSearch widget
  // if one already exists, or adding a new one if none in racetrack.
  resetSearch (query) {
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
    const { queryString, selectedSuggestionIndex } = this.state
    const { suggestions } = this.props
    return (
      <div className="Searchbar">
        <div className="Searchbar-body flexCenter">
          <div className="Searchbar-overlapping-inputs">
            <input disabled={true} value={this.selectedSuggestionString()} type="text" className="Searchbar-typeahead"/>
            <input className='Searchbar-search'
                   value={queryString}
                   onKeyDown={this.onKeyDown}
                   onChange={this.updateQueryString}
                   placeholder="Search..." type="text" />
            <button onClick={this.clearQueryString} disabled={!queryString || !queryString.length} className="Searchbar-clear icon-cancel-circle" />
        { suggestions && suggestions.length ? (
              <div className="Searchbar-suggestions fullWidth">
            <ul>
              { suggestions.map((suggestion, index) => (
                <li key={suggestion.text}>
                  <div onClick={this.chooseSuggestion.bind(this, suggestion)}
                           className={classnames('Searchbar-suggestion', {selected: index === selectedSuggestionIndex})}>
                    <div>{suggestion.text}</div>
                    <div>{suggestion.score}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : <div/>}
      </div>
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
