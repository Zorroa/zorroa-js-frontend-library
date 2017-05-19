import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Suggestions extends Component {
  static propTypes = {
    value: PropTypes.string,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    placeholder: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    placeholder: 'Search...',
    style: { width: '100%' }
  }

  state = {
    value: this.props.value,
    selectedIndex: -1
  }

  componentWillReceiveProps (nextProps) {
    const { value, suggestions } = nextProps
    if (typeof value === 'string') this.setState({value})
    if (suggestions) {
      let { selectedIndex } = this.state
      if (selectedIndex < 0 || selectedIndex >= suggestions.length) {
        this.setState({selectedIndex: 0})
      }
    } else {
      this.setState({selectedIndex: -1})
    }
  }

  updateValue = (value) => {
    this.setState({ value })
    this.props.onChange(value)
  }

  clearValue = () => {
    const value = ''
    if (this.state.value !== value) {
      this.setState({value})
      this.props.onSelect(value)
      this.updateValue('')
    }
  }

  // Parse each keypress for special commands
  onKeyDown = (event) => {
    switch (event.key) {
      case 'Enter': return this.selectCurrentValue()
      case 'Tab': return this.selectCurrentSuggestion()
      case 'ArrowUp': return this.previousSuggestion()
      case 'ArrowDown': return this.nextSuggestion()
      default:
    }
  }

  selectCurrentValue = () => {
    this.props.onSelect(this.state.value)
  }

  selectCurrentSuggestion = () => {
    const { suggestions } = this.props
    if (!suggestions) return
    const { selectedIndex } = this.state
    const index = selectedIndex < 0 ? 0 : selectedIndex
    if (index < suggestions.length) {
      this.chooseSuggestion(suggestions[index])
    } else {
      this.selectCurrentValue()
    }
  }

  nextSuggestion = () => {
    const { suggestions } = this.props
    const { selectedIndex } = this.state
    if (!suggestions) {
      if (selectedIndex !== -1) {
        this.setState({ selectedIndex: -1 })
        return
      }
    }
    const index = Math.min(selectedIndex + 1, suggestions.length - 1)
    if (index !== selectedIndex) {
      this.setState({ selectedIndex: index })
    }
  }

  previousSuggestion = () => {
    const { suggestions } = this.props
    const { selectedIndex } = this.state
    if (!suggestions) {
      if (selectedIndex !== -1) {
        this.setState({ selectedIndex: -1 })
        return
      }
    }
    const index = Math.max(0, selectedIndex - 1)
    if (index !== selectedIndex) {
      this.setState({ selectedIndex: index })
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
    if (selectedIndex < 0 || !suggestions) return ''
    const suggestion = suggestions[selectedIndex]
    const suffix = suggestion && suggestion.text ? suggestion.text.slice(value.length) : ''
    return value + suffix
  }

  renderSuggestions () {
    const { suggestions } = this.props
    const { selectedIndex } = this.state
    if (!suggestions || !suggestions.length) return null
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
      </div>
    )
  }

  render () {
    const { placeholder, style } = this.props
    const { value } = this.state
    return (
    <div className="Suggestions" style={style}>
      <div className="Suggestions-overlapping-inputs">
        <input disabled={true} value={this.selectedSuggestionString()}
               type="text" className="Suggestions-typeahead"/>
        <input className='Suggestions-search'
               value={value || ''}
               onKeyDown={this.onKeyDown}
               onChange={event => this.updateValue(event.target.value)}
               placeholder={placeholder} type="text" />
        <button onClick={this.clearValue}
                disabled={!value || !value.length}
                className="Suggestions-clear icon-cancel-circle" />
        { this.renderSuggestions() }
      </div>
    </div>
    )
  }
}
