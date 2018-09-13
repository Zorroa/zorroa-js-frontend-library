import PropTypes from 'prop-types'
import React from 'react'
import { Route, Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const RequireAuth = ({
  component: Component,
  location,
  authenticated,
  samlUrl,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      const redirectDestination = {
        pathname: samlUrl ? '/sso/loggedout' : '/signin',
        state: { from: location },
      }
      if (authenticated === true) {
        return <Component {...props} />
      }
      return <Redirect to={redirectDestination} />
    }}
  />
)

RequireAuth.propTypes = {
  component: PropTypes.func,
  location: PropTypes.object,
  authenticated: PropTypes.bool,
  samlUrl: PropTypes.string,
}

const ConnectedRequireAuth = connect(state => ({
  authenticated: state.auth.authenticated,
  samlUrl: state.auth.samlUrl,
}))(RequireAuth)

export default withRouter(ConnectedRequireAuth)
