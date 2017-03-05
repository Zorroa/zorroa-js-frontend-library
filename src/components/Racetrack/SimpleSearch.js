import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import { SimpleSearchWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import { unCamelCase } from '../../services/jsUtil'
import Widget from './Widget'
import Toggle from '../Toggle'
import DisplayOptions from '../DisplayOptions'

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

  state = {
    isEnabled: true,
    queryString: queryString(this.props),
    fuzzy: isFuzzy(this.props),
    field: queryField(this.props)
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  componentWillReceiveProps (nextProps) {
    if (!this.state.isEnabled) return
    this.setState({
      queryString: queryString(nextProps),
      fuzzy: isFuzzy(nextProps),
      field: queryField(nextProps)
    })
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter () {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  // Manage the <input> without a form, using onChange to update local state
  updateQueryString = (event) => {
    this.setState({ queryString: event.target.value })
  }

  // ...and onKeyPress to monitor for the Enter key to submit the new query
  queryStringKeyPressed = (event) => {
    if (event.key === 'Enter') {
      this.modifySliver(this.state.queryString, this.state.fuzzy, this.state.field)
    }
  }

  toggleEnabled = () => {
    this.setState({isEnabled: !this.state.isEnabled},
      () => { this.modifySliver(this.state.queryString, this.state.fuzzy, this.state.field) })
  }

  modifySliver (queryString, fuzzy, field) {
    const { isEnabled } = this.state
    const type = SimpleSearchWidgetInfo.type
    const sliver = new AssetSearch({query: queryString, fuzzy})
    if (field.length) {
      sliver.queryFields = { [field]: 1 }
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver, isEnabled})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  toggleFuzzy = (event) => {
    const fuzzy = !event.target.checked
    this.setState({ fuzzy })
    this.modifySliver(this.state.queryString, fuzzy, this.state.field)
  }

  clearField = (event) => {
    const field = ''
    this.setState({ field })
    this.modifySliver(this.state.queryString, this.state.fuzzy, field)
    event && event.stopPropagation()
  }

  selectField = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={null}
                                 selectedFields={[]}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const field = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (field && field.length) {
      this.setState({ field })
      this.modifySliver(this.state.queryString, this.state.fuzzy, field)
    }
  }

  render () {
    const { fuzzy, field, isEnabled } = this.state
    const { isIconified } = this.props
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className='SimpleSearch'
              title={SimpleSearchWidgetInfo.title}
              field={title}
              onSettings={this.selectField}
              backgroundColor={SimpleSearchWidgetInfo.color}
              isEnabled={isEnabled}
              enableToggleFn={this.toggleEnabled}
              isIconified={isIconified}
              icon={SimpleSearchWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="SimpleSearch-body">
          <div className="flexRow">
            <input type="text" placeholder="Search..." value={this.state.queryString}
                   onKeyPress={this.queryStringKeyPressed} onChange={this.updateQueryString} />
          </div>
          <div className="SimpleSearch-fuzzy">
            <Toggle checked={!fuzzy} onChange={this.toggleFuzzy} />
            <div className="SimpleSearch-fuzzy-label">Exact matches</div>
          </div>
        </div>
      </Widget>
    )
  }
}

const queryString = props => (
  props && props.query && props.query.query ? props.query.query : ''
)

const isFuzzy = props => (
  props && props.query && (typeof props.query.fuzzy === 'undefined' || props.query.fuzzy)
)

const queryField = props => (
  props && props.query.queryFields ? Object.keys(props.query.queryFields)[0] : ''
)

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(SimpleSearch)
