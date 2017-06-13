import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import AssetSearch from '../../models/AssetSearch'

export default class Suggestions extends Component {
  static propTypes = {
    value: PropTypes.string,
    query: PropTypes.instanceOf(AssetSearch),
    suggestions: PropTypes.arrayOf(PropTypes.object),
    showSuggestions: PropTypes.bool,
    placeholder: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    placeholder: 'Search...',
    style: { width: '100%' },
    showSuggestions: true
  }

  state = {
    value: this.props.value,
    selectedIndex: -1,
    lastAction: 'none'
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  componentWillReceiveProps (nextProps) {
    const { value, suggestions } = nextProps
    if (typeof value === 'string') this.setState({value})
    if (suggestions) {
      let { selectedIndex } = this.state
      if (selectedIndex < 0 || selectedIndex >= suggestions.length) {
        this.setState({selectedIndex: -1})
      }
    } else {
      this.setState({selectedIndex: -1})
    }
  }

  updateValue = (value) => {
    if (value === this.state.value) return
    this.setStatePromise({ value, selectedIndex: -1, lastAction: 'type' })
    .then(_ => this.props.onChange(this.state.value, this.state.lastAction))
  }

  clearValue = () => {
    const value = ''
    if (this.state.value !== value || this.state.error) {
      this.setState({value})
      this.props.onSelect(value)
      this.updateValue('')
    }
  }

  // Parse each keypress for special commands
  onKeyDown = (event) => {
    switch (event.key) {
      case 'Enter': return this.selectCurrentSuggestionOrValue()
      case 'Tab': {
        const { suggestions } = this.props
        // prevent tab from focusing on another element
        event.preventDefault()
        if (!suggestions) return
        if (this.state.selectedIndex >= this.props.suggestions.length - 1) {
          return this.goToSuggestion(0)
        } else {
          return this.goToSuggestion(this.state.selectedIndex + 1)
        }
      }
      case 'ArrowUp':
        // prevent the cursor from relocating to the front of the input
        event.preventDefault()
        return this.goToSuggestion(this.state.selectedIndex - 1)
      case 'ArrowDown': return this.goToSuggestion(this.state.selectedIndex + 1)
      default: return this.setState({ lastAction: 'type' })
    }
  }

  selectCurrentSuggestionOrValue = () => {
    if (this.state.lastAction === 'select') {
      this.chooseSuggestion(this.getCurrentSuggestion())
    } else {
      this.props.onSelect(this.state.value)
    }
  }

  getCurrentSuggestion = () => {
    const { suggestions } = this.props
    if (!suggestions) return
    const { selectedIndex } = this.state
    if (selectedIndex < 0 || selectedIndex >= suggestions.length) return
    return suggestions[selectedIndex]
  }

  goToSuggestion = (newIndex) => {
    const { suggestions } = this.props
    if (!suggestions) {
      if (this.state.selectedIndex !== -1) this.setState({ selectedIndex: -1 })
      return
    }
    const index = Math.max(0, Math.min(newIndex, suggestions.length - 1))
    if (index !== this.state.selectedIndex) {
      this.setStatePromise({ selectedIndex: index, lastAction: 'select' })
      .then(_ => {
        const suggestion = this.getCurrentSuggestion()
        const text = suggestion ? suggestion.text : this.state.value
        this.props.onChange(text, this.state.lastAction)
      })
    }
  }

  chooseSuggestion (suggestion) {
    console.log('Suggest: ' + suggestion.text + ' (' + suggestion.score)
    this.setState({ value: suggestion.text })
    this.props.onSelect(suggestion.text)
  }

  selectedSuggestionString () {
    const { value, selectedIndex } = this.state
    const { suggestions } = this.props
    if (!suggestions || !suggestions.length) return ''
    const suggestion = (selectedIndex >= 0) ? suggestions[selectedIndex] : suggestions[0]
    const cleanValue = value.replace(/["~]/g, '')
    const suffix = suggestion && suggestion.text ? suggestion.text.slice(cleanValue.length) : ''
    return value + suffix
  }

  renderSuggestions () {
    let { suggestions } = this.props
    const { selectedIndex } = this.state
    if (!suggestions || !suggestions.length) suggestions = []
    suggestions = suggestions.slice(0, 4)
    return (
      <div className="Suggestions-suggestions">
        { suggestions.map((suggestion, index) => (
          <div key={suggestion.text}
               onClick={this.chooseSuggestion.bind(this, suggestion)}
               className={classnames('Suggestions-suggestion', {selected: index === selectedIndex})}>
            <div>{suggestion.text}</div>
            <div>{suggestion.score}</div>
          </div>
        ))}
        <div className="Suggestions-instructions">Press Enter to search</div>
      </div>
    )
  }

  render () {
    const { placeholder, style, query } = this.props
    const { value } = this.state

    /* dont show suggestions if input matches current results */
    const showSuggestions = this.props.showSuggestions && value && (!query || query.query !== value)

    return (
    <div className="Suggestions" style={style}>
      <button onClick={this.forceSearch} className="Suggestions-search-button icon-search" />
      <div className="Suggestions-overlapping-inputs">
        { showSuggestions &&
          <input value={this.selectedSuggestionString()}
                 type="text"
                 className="Suggestions-typeahead"
                 readOnly/> }
        <input className='Suggestions-search'
               value={value || ''}
               onKeyDown={showSuggestions && this.onKeyDown}
               onChange={event => this.updateValue(event.target.value)}
               placeholder={placeholder}
               type="text" />
        <button onClick={this.clearValue}
                disabled={!value || !value.length}
                className="Suggestions-clear icon-cancel-circle" />
        { showSuggestions && this.renderSuggestions() }
      </div>
    </div>
    )
  }
}
