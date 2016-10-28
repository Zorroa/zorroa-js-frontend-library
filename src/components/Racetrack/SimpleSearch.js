import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import AssetSearch from '../../models/AssetSearch'
import { modifySlivers, removeSlivers } from '../../actions/sliversAction'
import FilterHeader from './FilterHeader'
import Collapsible from '../Collapsible'

// Manage the query string for the current AssetSearch.
// Monitors the global query and updates slivers when the search is changed.
// The input state is stored in the component local state.queryString
// and is pushed into the sliver to force a new search on submit (Enter).
class SimpleSearch extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object,
    id: PropTypes.number.isRequired
  }

  constructor (props) {
    super(props)
    this.updateQueryString = this.updateQueryString.bind(this)
    this.modifySliver = this.modifySliver.bind(this)
    this.state = { queryString: props.query.query }
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  componentWillReceiveProps (nextProps) {
    this.setState({ queryString: nextProps.query.query })
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter () {
    this.props.actions.removeSlivers([this.props.id])
  }

  header () {
    return <FilterHeader icon="icon-search" label="Simple Search" onClose={this.removeFilter.bind(this)} />
  }

  // Manage the <input> without a form, using onChange to update local state
  updateQueryString (event) {
    this.setState({ queryString: event.target.value })
  }

  // ...and onKeyPress to monitor for the Enter key to submit the new query
  modifySliver (event) {
    if (event.key === 'Enter') {
      let slivers = {}
      slivers[this.props.id] = new AssetSearch({query: this.state.queryString})
      this.props.actions.modifySlivers(slivers)
    }
  }

  render () {
    const collapsibleStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      color: '#ededed',
      backgroundColor: '#74b618',
      borderRadius: '3px'
    }
    return (
      <Collapsible style={collapsibleStyle} header={this.header()} >
        <div className="simple-search">
          <div>
            <input type="text" placeholder="Search..." value={this.state.queryString}
                   onKeyPress={this.modifySliver} onChange={this.updateQueryString} />
          </div>
          <div className="simple-search-radio">
            <form>
              <input type="radio" name="all-fields" value="all" />All fields
              <input type="radio" name="all-fields" value="some" />Some fields
            </form>
          </div>
        </div>
      </Collapsible>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifySlivers, removeSlivers }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(SimpleSearch)
