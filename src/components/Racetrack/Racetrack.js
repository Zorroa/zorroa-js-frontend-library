import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'

import Filter from './Filter'
import FilterHeader from './FilterHeader'
import Collapsible from '../Collapsible'
import { searchAssets } from '../../actions/assetsAction'

class Racetrack extends Component {
  static get propTypes () {
    return {
      query: PropTypes.object,
      handleSubmit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired
    }
  }

  constructor (props) {
    super(props)
    this.state = { filters: Filter.filtersForQuery() }
  }

  componentWillReceiveProps (nextProps) {
    const { query } = nextProps
    const filters = query ? Filter.filtersForQuery(query) : []
    this.setState({ filters })
  }

  handleCloseFilter (filter) {
    const { filters } = this.state
    const idx = filters.indexOf(filter)
    const removed = idx >= 0 ? filters.slice(idx, idx + 1) : filters
    this.setState({ filters: removed })
  }

  handleSave () {
    console.log(`Save racetrack with ${this.state.filters.length} filters`)
  }

  handleClear () {
    this.props.actions.searchAssets({})
  }

  handleAddWidget () {
    console.log('Show ADD WIDGET modal')
  }

  handleQuickAddKeyPress () {
    console.log('Quick Add keypress')
  }

  handleFormSubmit (query) {
    this.props.actions.searchAssets(query)
  }

  renderFilterHeader (filter) {
    return (
      <FilterHeader icon={filter.icon} label={filter.label} onClose={this.handleCloseFilter.bind(this, filter)} />
    )
  }

  renderSearch ({ input, label, type }) {
    return (
      <input {...input} name="racetrack-search" placeholder={label} type={type} className="searchbar" />
    )
  }

  renderEmpty () {
    const { handleSubmit } = this.props
    return (
      <div className="racetrack-empty">
        <div className="racetrack-empty-mag icon-search" />
        <div className="racetrack-empty-text">
          GET STARTED WITH A SIMPLE SEARCH<br/>
          OR ADD SEARCH WIDGETS
        </div>
        <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
          <Field name="query" label="Search..." component={this.renderSearch} type="text" />
        </form>
      </div>
    )
  }

  render () {
    const { filters } = this.state
    const collapsibleStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      color: '#ededed',
      backgroundColor: '#74b618',
      borderRadius: '3px'
    }
    return (
      <div className="racetrack">
        <div className="racetrack-body">
          { (!filters || filters.length === 0) && this.renderEmpty() }
          { filters && filters.length > 0 && (
          <div className="racetrack-filters">
            { filters.map((filter, i) => (
              <Collapsible key={i} style={collapsibleStyle} header={this.renderFilterHeader(filter)} isRacetrack={true}>
                {filter.body}
              </Collapsible>)
            )}
          </div>
          )}
          <div className="racetrack-add-filter">
            <button onClick={this.handleAddWidget.bind(this)}>+ ADD WIDGET</button>
            <input onKeyPress={this.handleQuickAddKeyPress.bind(this)} placeholder="Quick Add - Widget"/>
          </div>
        </div>
        <div className="racetrack-footer">
          <div className="racetrack-footer-group">
            <button onClick={this.handleSave.bind(this)} className="racetrack-footer-save-button">Save</button>
            <button onClick={this.handleClear.bind(this)}>Clear</button>
          </div>
        </div>
      </div>
    )
  }
}

const form = reduxForm({
  form: 'racetrack-search'
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ searchAssets }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(form(Racetrack))
