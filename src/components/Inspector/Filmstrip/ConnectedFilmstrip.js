import Filmstrip from './Filmstrip'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setFilmstripHeight } from '../../../actions/appActions'

export default connect(
  state => ({
    origin: state.auth.origin,
    filmStripHeight: state.app.filmStripHeight,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        setFilmstripHeight,
      },
      dispatch,
    ),
  }),
)(Filmstrip)
