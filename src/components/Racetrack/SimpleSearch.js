import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import WidgetModel from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import { SimpleSearchWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import Widget from './Widget'

// Manage the query string for the current AssetSearch.
// Monitors the global query and updates slivers when the search is changed.
// The input state is stored in the component local state.queryString
// and is pushed into the sliver to force a new search on submit (Enter).
class SimpleSearch extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.updateQueryString = this.updateQueryString.bind(this)
    this.modifySliver = this.modifySliver.bind(this)
    this.state = { queryString: queryString(props) }
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  componentWillReceiveProps (nextProps) {
    this.setState({ queryString: queryString(nextProps) })
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter () {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  // Manage the <input> without a form, using onChange to update local state
  updateQueryString (event) {
    this.setState({ queryString: event.target.value })
  }

  // ...and onKeyPress to monitor for the Enter key to submit the new query
  modifySliver (event) {
    if (event.key === 'Enter') {
      const type = SimpleSearchWidgetInfo.type
      const sliver = new AssetSearch({query: this.state.queryString})
      const widget = new WidgetModel({id: this.props.id, type, sliver})
      this.props.actions.modifyRacetrackWidget(widget)
    }
  }

  render () {
    const { isIconified } = this.props
    return (
      <Widget className='SimpleSearch'
              header={(<span>Simple Search</span>)}
              isIconified={isIconified}
              icon="icon-search"
              onClose={this.removeFilter.bind(this)}>
        <div className="SimpleSearch-body">
          <div className="flexRow">
            <input type="text" placeholder="Search..." value={this.state.queryString}
                   onKeyPress={this.modifySliver} onChange={this.updateQueryString} />
          </div>
          <div className="SimpleSearch-radio">
            <form>
              <input type="radio" name="all-fields" value="all" />All fields
              <input type="radio" name="all-fields" value="some" />Some fields
            </form>
          </div>
        </div>
      </Widget>
    )
  }
}

const queryString = props => (
  props && props.query && props.query.query ? props.query.query : ''
)

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(SimpleSearch)
