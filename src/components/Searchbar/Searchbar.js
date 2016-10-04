import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { searchAssets } from '../../actions/assetsAction'

class Searchbar extends Component {
  static propTypes () {
    return {
      submitting: PropTypes.boolean,
      handleSubmit: PropTypes.func.isRequired,
      actions: PropTypes.object.isRequired
    }
  }

  componentWillMount () {
    this.props.actions.searchAssets()
  }

  handleFormSubmit ({ query }) {
    this.props.actions.searchAssets(query)
  }

  renderSearch ({ input, label, type, meta: { touched, error } }) {
    return (
      <div>
        <input {...input} name="search" placeholder={label} type={type} width="70%" className="searchbar"/>
        {touched && error && <div className="error">{error}</div> }
      </div>
    )
  }

  render () {
    const { handleSubmit, submitting } = this.props
    return (
      <div>
        <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
          <div className="searchbar-group">
            <Field name="query" label="Search" component={this.renderSearch} type="text"/>
            <button htmlFor="query" action="submit" disabled={submitting} className="searchbar-button">{'\u2315'}</button>
          </div>
        </form>
      </div>
    )
  }
}

const form = reduxForm({
  form: 'search'
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ searchAssets }, dispatch)
})

const mapStateToProps = state => ({
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(form(Searchbar))
