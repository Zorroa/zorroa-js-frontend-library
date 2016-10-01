import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { searchAssets } from '../../actions/assetsAction'

class Feature extends Component {
  static propTypes () {
    return {
      handleSubmit: PropTypes.func.isRequired,
      submitting: PropTypes.boolean,
      actions: PropTypes.object.isRequired,
      assets: PropTypes.array
    }
  }

  componentWillMount () {
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.props.actions.searchAssets()
  }

  handleFormSubmit ({ query }) {
    this.props.actions.searchAssets(query)
  }

  renderSearch ({ input, label, type, meta: { touched, error } }) {
    return (
      <div>
        <input {...input} name="search" placeholder={label} type={type} width="70%" className="form-control"/>
        {touched && error && <div className="error">{error}</div> }
      </div>
    )
  }

  renderAssets (assets) {
    if (!assets) {
      return (<div>No assets</div>)
    }
    return (
      <div>
        <ul className="list-group">
          { assets.map((asset) => (
            <li key={asset.id} className="list-group-item">{asset.id}</li>
          )) }
        </ul>
      </div>
    )
  }

  render () {
    const { handleSubmit, submitting, assets } = this.props
    return (
      <div>
        <div>
          <form onSubmit={handleSubmit(this.handleFormSubmit)}>
            <div className="form-group">
              <div className="col-lg-8">
                <Field name="query" label="Search" component={this.renderSearch} type="text"/>
              </div>
              <button htmlFor="query" action="submit" disabled={submitting} className="btn btn-primary">Search</button>
            </div>
          </form>
        </div>
        <div>
          {this.renderAssets(assets)}
        </div>
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
  assets: state.assets.all
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(form(Feature))
