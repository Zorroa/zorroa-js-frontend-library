import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Searcher from './Searcher'
import SimpleSearch from './SimpleSearch'
import AssetSearch from '../../models/AssetSearch'
import { resetSlivers } from '../../actions/sliversAction'

class Racetrack extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch),
      actions: PropTypes.object.isRequired
    }

  constructor (props) {
    super(props)
    this.state = { emptySearch: '' }
  }

  handleSave () {
    console.log(`Save racetrack with ${this.state.filters.length} filters`)
  }

  handleClear () {
    this.props.actions.resetSlivers()
  }

  handleAddWidget () {
    console.log('Show ADD WIDGET modal')
  }

  handleQuickAddKeyPress () {
    console.log('Quick Add keypress')
  }

  submitEmptySearch (event) {
    event.preventDefault()
    this.props.actions.resetSlivers({1: {query: this.state.emptySearch}})
  }

  changeEmptySearch (event) {
    this.setState({ emptySearch: event.target.value })
  }

  renderEmpty () {
    return (
      <div className="racetrack-empty">
        <div className="racetrack-empty-mag icon-search" />
        <div className="racetrack-empty-text">
          GET STARTED WITH A SIMPLE SEARCH<br/>
          OR ADD SEARCH WIDGETS
        </div>
        <form onSubmit={this.submitEmptySearch.bind(this)}>
          <input type="text" placeholder="Search..."
                 value={this.state.emptySearch}
                 onChange={this.changeEmptySearch.bind(this)} />
        </form>
      </div>
    )
  }

  render () {
    const { query } = this.props
    // Construct an array of search widgets to control the search
    // FIXME: faked as a single SimpleSearch for now, later parse full query.
    const widgets = (query && query.query && query.query.length) ? [ <SimpleSearch key={1} id={1} /> ] : []
    return (
      <div className="racetrack">
        <Searcher/>
        <div className="racetrack-body">
          { (!widgets || widgets.length === 0) && this.renderEmpty() }
          { widgets && widgets.length > 0 && (
          <div className="racetrack-filters">
            {(widgets)}
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ resetSlivers }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Racetrack)
