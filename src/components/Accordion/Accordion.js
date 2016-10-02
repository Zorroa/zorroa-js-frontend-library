import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Accordion extends Component {
  static get displayName () {
    return 'Accordion'
  }

  static get propTypes () {
    return {
      children: PropTypes.node
    }
  }

  constructor (props) {
    super(props)

    const openItems = this.props.children.map(() => {
      return false
    })

    this.state = { openItems }
  }

  handleClick (i) {
    const { openItems } = this.state
    const temp = Array(openItems.length).fill(false)
    temp[i] = !openItems[i]
    this.setState({
      openItems: temp
    }, () => {
      console.info(this.state.openItems)
    })
  }

  render () {
    const { children: accordianItems } = this.props

    return (
      <div className="accordion">
        {accordianItems.map((item, i) => {
          return this.renderAccordianItem(item, i)
        })}
      </div>
    )
  }

  renderAccordianItem (item, i) {
    const classNames = classnames('accordion-item', {
      'accordion-open': this.state.openItems[i]
    })

    return (
      <div className={classNames} key={i} onClick={this.handleClick.bind(this, i)}>{item}</div>)
  }
}
