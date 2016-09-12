const BORDER_RADIUS = '4px'
const HF_COLOR = '#8899a6'
const DIVIDE_BORDER = '1px solid #e1e8ed'
const BACKGROUND_COLOR = 'white'

export default {
  container: {
    display: 'flex',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    zIndex: 100000,
    fontFamily: 'Helvetica',
    backgroundColor: 'rgba(0,0,0,.9)',
    position: 'fixed',
    boxSizing: 'border-box'
  },
  modal: {
    alignSelf: 'center',
    backgroundColor: BACKGROUND_COLOR,
    width: '75%',
    maxWidth: 600,
    flexBasis: '75%',
    borderRadius: BORDER_RADIUS,
    position: 'relative'
  },
  header: {
    background: BACKGROUND_COLOR,
    borderRadius: `${BORDER_RADIUS} ${BORDER_RADIUS} 0 0`,
    borderBottom: DIVIDE_BORDER,
    height: 48,
    boxSizing: 'border-box',
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 2,
    textAlign: 'center',
    color: HF_COLOR,
    zIndex: 1
  },
  body: {
    lineHeight: 1.5,
    padding: '20px 36px'
  },
  footer: {
    borderRadius: `0 0 ${BORDER_RADIUS} ${BORDER_RADIUS}`,
    background: BACKGROUND_COLOR,
    borderTop: DIVIDE_BORDER,
    color: HF_COLOR,
    height: 20,
    padding: 15,
    textAlign: 'center'
  },
  dismiss: {
    height: 20,
    width: 20,
    padding: 0,
    position: 'absolute',
    color: HF_COLOR,
    top: 9,
    right: 10,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0)',
    border: 'none',
    boxShadow: 'none',
    transition: 'none'
  }
}
