import React, { PropTypes } from 'react'
import { Route, Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const RequireAuth = ({
  component: Component,
  location,
  authenticated,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      const redirectDestination = {
        pathname: '/signin',
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
  component: PropTypes.element,
  location: PropTypes.object,
  authenticated: PropTypes.bool,
}

const ConnectedRequireAuth = connect(state => {
  return { authenticated: state.auth.authenticated }
})(RequireAuth)

export default withRouter(ConnectedRequireAuth)
