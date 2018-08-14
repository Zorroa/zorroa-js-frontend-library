import PropTypes from 'prop-types'
import React, { Component } from 'react'

import Widget from '../Widget'
import FlipbookWidgetFrameRateChanger from './FlipbookWidgetFrameRateChanger'
import Asset from '../../../models/Asset'
import Toggle from '../../Toggle'
import { createMultipageWidget } from '../../../models/Widget'
import FlipbookPlayer from '../../Flipbook/FlipbookImage/index.js'

export default class Multipage extends Component {
  static propTypes = {
    isolatedParent: PropTypes.instanceOf(Asset),
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    origin: PropTypes.string,
    actions: PropTypes.shape({
      modifyRacetrackWidget: PropTypes.func.isRequired,
    }),
  }

  state = {
    sortByPage: false,
    filterMultipage: 'exists',
  }

  title() {
    if (this.isFlipbook()) {
      return 'Flipbook'
    }

    return 'Multipage'
  }

  isFlipbook() {
    if (this.props.isolatedParent === undefined) {
      return false
    }

    return this.props.isolatedParent.clipType() === 'flipbook'
  }

  backgroundColor() {
    if (this.isFlipbook()) {
      return '#FFD000'
    }

    return '#579760'
  }

  sortPages = sortByPage => {
    this.setState(
      {
        sortByPage,
      },
      this.modifySliver,
    )
  }

  filterMultipage = () => {
    const filterMultipage =
      this.state.filterMultipage === 'exists' ? 'missing' : 'exists'
    this.setFilter(filterMultipage)
  }

  setFilter = filterMultipage => {
    this.setState(
      {
        filterMultipage,
      },
      this.modifySliver,
    )
  }

  modifySliver = () => {
    const { isolatedParent, id, widgets } = this.props
    const { sortByPage, filterMultipage } = this.state
    const index = widgets && widgets.findIndex(widget => id === widget.id)
    const widget = widgets && widgets[index]
    const w = createMultipageWidget(
      undefined,
      undefined,
      isolatedParent,
      sortByPage,
      filterMultipage,
      widget.isEnabled,
      widget.isPrototypeOf(),
    )
    w.id = id
    this.props.actions.modifyRacetrackWidget(w)
  }

  render() {
    const {
      isolatedParent,
      id,
      isOpen,
      onOpen,
      isIconified,
      floatBody,
    } = this.props
    const { sortByPage, filterMultipage } = this.state
    const title = this.title()
    const field = undefined
    const isolatedParentId = isolatedParent && isolatedParent.parentId()
    const asset = new Asset({ id: isolatedParentId })
    const width = 230
    const height = 120
    const url = asset.closestProxyURL(this.props.origin, width, height)
    const style = {
      backgroundImage: `url(${url})`,
      minWidth: width,
      minHeight: height,
    }

    return (
      <Widget
        className="SortOrder"
        id={id}
        isOpen={isOpen}
        onOpen={onOpen}
        floatBody={floatBody}
        title={title}
        field={field}
        backgroundColor={this.backgroundColor()}
        isIconified={isIconified}
        icon={'icon-stack-empty'}>
        {isolatedParentId ? (
          <div className="Multipage-body">
            {this.isFlipbook() && isOpen ? (
              <div className="Multipage-previewer">
                <FlipbookPlayer
                  autoPlay
                  shouldLoop
                  defaultFrame={isolatedParent}
                  clipParentId={isolatedParentId}
                  width={width}
                />
              </div>
            ) : (
              <div className="Multipage-parent" style={style} />
            )}
            <div className="Multipage-sort">
              <div
                className="Multipage-label"
                onClick={() => this.sortPages(true)}>
                Page Order
              </div>
              <Toggle
                checked={sortByPage}
                onChange={() => this.sortPages(!sortByPage)}
                highlightColor={this.isFlipbook() ? 'yellow' : undefined}
              />
              <div
                className="Multipage-label"
                onClick={() => this.sortPages(false)}>
                Search Order
              </div>
            </div>
          </div>
        ) : (
          <div className="Multipage-toggle">
            <div
              className="Multipage-label"
              onClick={() => this.setFilter('exists')}>
              Multipage
            </div>
            <Toggle
              checked={filterMultipage === 'exists'}
              onChange={this.filterMultipage}
            />
            <div
              className="Multipage-label"
              onClick={() => this.setFilter('missing')}>
              Monopage
            </div>
          </div>
        )}
        {this.isFlipbook() && <FlipbookWidgetFrameRateChanger />}
      </Widget>
    )
  }
}
