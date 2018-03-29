import React, {PropTypes, PureComponent} from 'react'
import ease from 'ease-component'

export function CancelCircle () {
  return (
    <svg
      width="15"
      height="15"
      xmlns="http://www.w3.org/2000/svg"
      xlinkHref="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path d="M7.5 0a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm3.75 9.844L9.844 11.25 7.5 8.906 5.156 11.25 3.75 9.844 6.094 7.5 3.75 5.156 5.156 3.75 7.5 6.094 9.844 3.75l1.406 1.406L8.906 7.5l2.344 2.344z" id="a"/>
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="b" fill="#fff">
          <use xlinkHref="#a"/>
        </mask>
        <use fill="#000" fillRule="nonzero" xlinkHref="#a"/>
        <g mask="url(#b)" fill="#CE2D3F">
          <path d="M0 0h15v15H0z"/>
        </g>
      </g>
    </svg>
  )
}

export class Gauge extends PureComponent {
  static propTypes = {
    color: PropTypes.string.isRequired,
    intensity: PropTypes.oneOf(['high', 'medium', 'low'])
  }

  constructor (props) {
    super(props)
    this.isAnimating = false
    this.availableRotateDegrees = {
      'low': 0,
      'medium': 50,
      'high': 100
    }
    this.state = {
      rotateDegrees: this.availableRotateDegrees[props.intensity],
      oldIntensity: props.intensity
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.intensity === this.props.intensity) {
      return
    }

    this.setState({
      oldIntensity: this.props.intensity
    })

    const animationDurationMilliseconds = 1000
    const animationStartTime = Number(new Date())
    this.startAnimation(animationDurationMilliseconds, animationStartTime, nextProps.intensity)
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.intensity !== this.props.intensity || this.isAnimating
  }

  startAnimation = (animationDurationMilliseconds, animationStartTime, intensity) => {
    this.isAnimating = true
    requestAnimationFrame(() => {
      const currentTimestamp = Number(new Date())
      const delta = currentTimestamp - animationStartTime
      const percentComplete = ease.outBounce(delta / animationDurationMilliseconds)
      const finalRotationDegrees = this.availableRotateDegrees[intensity]
      const oldRotationDegrees = this.availableRotateDegrees[this.state.oldIntensity]

      if (delta > animationDurationMilliseconds) {
        this.setState({
          rotateDegrees: finalRotationDegrees
        })
        this.isAnimating = false
        return
      }

      this.setState({
        rotateDegrees: percentComplete * (finalRotationDegrees - oldRotationDegrees) + oldRotationDegrees
      })

      this.startAnimation(animationDurationMilliseconds, animationStartTime, intensity)
    })
  }

  render () {
    return (
      <svg
        width="21px"
        height="16px"
        viewBox="0 0 21 16"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xlinkHref="http://www.w3.org/1999/xlink"
      >
        <g className="Gauge" fill={this.props.color} fillRule="nonzero">
          <path
            transform={`rotate(${this.state.rotateDegrees}, 11, 11)`}
            d="M10,12.6315789 C9.57825658,12.6315789 9.18174342,12.4673355 8.88351974,12.1690789 C8.46003289,11.7455921 5.65819079,7.69351974 5.10082237,6.88552632 C4.95657895,6.67644737 4.98226974,6.39414474 5.16190789,6.21453947 C5.34151316,6.03490132 5.62381579,6.00924342 5.83289474,6.15345395 C6.64088816,6.71082237 10.6929934,9.51266447 11.1164803,9.93618421 C11.4147039,10.234375 11.5789474,10.6308882 11.5789474,11.0526316 C11.5789474,11.474375 11.4147039,11.8708882 11.1164803,12.1690789 C10.8182895,12.4673355 10.4217434,12.6315789 10,12.6315789 Z M7.64319079,8.69582237 C8.63759868,10.1110197 9.46450658,11.2595724 9.62792763,11.4249013 C9.72726974,11.5242105 9.85944079,11.5789803 10.0000329,11.5789803 C10.140625,11.5789803 10.2727961,11.5242105 10.3722039,11.4248026 C10.5774013,11.2196053 10.5774013,10.8856908 10.3722039,10.6804934 C10.2069079,10.5171053 9.05858553,9.69036184 7.64319079,8.69582237 Z"
          />
          <path
            d="M17.0710526,2.92894737 C15.1823026,1.04019737 12.6710855,0 10,0 C7.32891447,0 4.81769737,1.04019737 2.92894737,2.92894737 C1.04019737,4.81769737 0,7.32891447 0,10 C0,11.9886513 0.582434211,13.9098684 1.68430921,15.5560526 C1.78200658,15.7020066 1.94605263,15.7896053 2.12167763,15.7896053 L17.8782895,15.7895724 C18.0539145,15.7895724 18.2179605,15.7019737 18.3156579,15.5560197 C19.4175658,13.9099013 20,11.9886842 20,10 C20,7.32891447 18.9598355,4.81769737 17.0710526,2.92894737 Z M17.5920724,14.7369408 L2.40789474,14.7369737 C1.61305921,13.4660526 1.15523026,12.0246382 1.06819079,10.5263158 L1.57894737,10.5263158 C1.86960526,10.5263158 2.10526316,10.2906908 2.10526316,10 C2.10526316,9.70930921 1.86960526,9.47368421 1.57894737,9.47368421 L1.06851974,9.47368421 C1.33177632,4.95838816 4.95838816,1.33177632 9.47368421,1.06851974 L9.47368421,1.57894737 C9.47368421,1.86960526 9.70934211,2.10526316 10,2.10526316 C10.2906579,2.10526316 10.5263158,1.86960526 10.5263158,1.57894737 L10.5263158,1.06851974 C15.0416447,1.33177632 18.6682237,4.95838816 18.9314803,9.47368421 L18.4210526,9.47368421 C18.1303618,9.47368421 17.8947368,9.70930921 17.8947368,10 C17.8947368,10.2906908 18.1303618,10.5263158 18.4210526,10.5263158 L18.9318092,10.5263158 C18.8447697,12.0246382 18.3869079,13.4660855 17.5920724,14.7369408 Z"
          />
        </g>
      </svg>
    )
  }
}

export function Flipbook () {
  return (
    <svg
      width="25"
      height="25"
      xmlns="http://www.w3.org/2000/svg"
      xlinkHref="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path d="M8.5 3.1s-2.1-2-8.5-2v12.7c6.4 0 8.5 2 8.5 2s2-2 8.5-2V1c-6.4 0-8.5 2.1-8.5 2.1zm-6.4 0c2.7.3 4.4.9 5.3 1.4v8.6c-1-.5-2.6-1.2-5.3-1.4V3.1zM15 11.7c-2.7.2-4.4.9-5.3 1.4V4.5c1-.5 2.6-1.1 5.3-1.4v8.6z" id="a"/>
      </defs>
      <g fill="none" fillRule="evenodd">
        <path fill="#FFD000" d="M0 0h25v25H0z"/>
        <g transform="translate(4 4)">
          <mask id="b" fill="#fff">
            <use xlinkHref="#a"/>
          </mask>
          <use fill="#000" fillRule="nonzero" xlinkHref="#a"/>
          <g mask="url(#b)" fill="#FFF">
            <path d="M0 0h17v17H0z"/>
          </g>
        </g>
      </g>
    </svg>
  )
}

export function Save () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" width="15" height="15">
      <defs>
        <path id="a" d="M12.3 0H2C.9 0 0 .8 0 1.9V13c0 1 .8 1.9 1.9 1.9H13c1 0 1.9-.8 1.9-1.9V3L12.3 0zm-1 5.6c0 .5-.5 1-1 1H4.7a1 1 0 0 1-1-1V1h7.5v4.7zm-1-3.7H8.4v3.7h2V2z"/>
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="b" fill="#fff">
          <use xlinkHref="#a"/>
        </mask>
        <use fill="#000" fillRule="nonzero" xlinkHref="#a"/>
        <g fill="#fff" mask="url(#b)">
          <path d="M0 0h15v15H0z"/>
        </g>
      </g>
    </svg>
  )
}
