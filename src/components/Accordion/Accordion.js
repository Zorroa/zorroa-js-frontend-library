import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Accordion extends Component {
  static propTypes = {
    children: PropTypes.node
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
    const temp = {...openItems}
    temp[i] = !openItems[i]
    this.setState({
      openItems: temp
    }, () => {
      console.info(this.state.openItems)
    })
  }

  render () {
    const { children: accordionItems } = this.props

    return (
      <div style={{overflow: 'auto', height: '100%'}}>
        <div className="accordion">
          {accordionItems.map((item, i) => {
            return this.renderAccordionItem(item, i)
          })}
        </div>
      </div>
    )
  }

  renderAccordionItem (item, i) {
    const classNames = classnames('accordion-item', {
      'accordion-open': this.state.openItems[i]
    })

    return (
      <div className={classNames} key={i} onClick={this.handleClick.bind(this, i)}>{item}</div>)
  }
}
