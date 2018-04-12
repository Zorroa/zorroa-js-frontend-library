import React, { Component, PropTypes } from 'react'
import PanZoom from './PanZoom'

import ProgressCircle from '../ProgressCircle'
import FlashMessage from '../FlashMessage'

// Orignal Code: https://github.com/mikecousins/react-pdf-js
// Core library is Pdf.js, which we now call directly.
// Updated to ES6+ and simplified by removing lots of
// optional properties and the associated extra code.
// Modified to exactly fit rendered canvas to parent element.

require('pdfjs-dist/build/pdf.combined')
require('pdfjs-dist/web/compatibility')

export default class Pdf extends Component {
  static propTypes = {
    documentInitParameters: PropTypes.shape({
      url: PropTypes.string,
    }),
    path: PropTypes.string.isRequired,
    page: PropTypes.number,
  }

  static defaultProps = { page: 1 }

  onDocumentError = err => {
    if (err.isCanceled && err.pdf) {
      err.pdf.destroy()
      this.setState({ error: 'PDF loading canceled' })
    } else {
      this.setState({ error: 'Error loading PDF: ' + err })
    }
  }

  state = {
    page: null,
    pdf: null,
    error: null,
    scale: window.devicePixelRatio || 1,
    disableZoomOut: false,
  }

  componentDidMount() {
    this.loadPDFDocument(this.props)
    this.queueRenderPage(this.state.pageNumber)
  }

  componentWillReceiveProps(newProps) {
    const { pdf } = this.state

    if (this.props.path !== newProps.path) {
      this.loadPDFDocument(newProps)
    }

    if (pdf && (newProps.page && newProps.page !== this.props.page)) {
      this.setState({ pageNumber: newProps.page, error: null })
      this.queueRenderPage(newProps.page)
    }
  }

  componentWillUnmount() {
    const { pdf } = this.state
    if (pdf) {
      pdf.destroy()
    }
    if (this.documentPromise) {
      this.documentPromise.cancel()
      this.documentPromise = null
    }
  }

  onZoom = zoomFactor => {
    const devicePixelRatio = window.devicePixelRatio || 1
    const scale = Math.max(1, zoomFactor) * Math.max(1, devicePixelRatio)
    this.setState({ scale }, () => {
      this.queueRenderPage(this.state.pageNumber)
    })
  }

  onDocumentComplete = pdf => {
    this.setState({ pdf, pageNumber: this.props.page, error: null })
    this.queueRenderPage(this.props.page)
  }

  loadProgress = progress => {
    const pageNumber = this.state.pageNumber || 1
    if (progress && progress.loaded >= progress.total) {
      this.queueRenderPage(pageNumber)
      this.setState({ pageNumber, progress: null, error: null })
    } else {
      this.setState({ progress })
    }
  }

  getDocument = val => {
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }
    this.documentPromise = makeCancelable(
      window.PDFJS.getDocument(val, null, null, this.loadProgress).promise,
    )
    this.documentPromise.promise
      .then(this.onDocumentComplete)
      .catch(this.onDocumentError)
    return this.documentPromise
  }

  loadPDFDocument(props) {
    if (props.documentInitParameters) {
      return this.getDocument(props.documentInitParameters)
    } else {
      throw new Error('Requires initial parameters')
    }
  }

  previousPage = () => {
    const pageNumber = Math.max(this.state.pageNumber - 1, 1)
    this.setState({ pageNumber })
    this.queueRenderPage(pageNumber)
  }

  nextPage = () => {
    const { pdf } = this.state
    const pageNumber = Math.min(this.state.pageNumber + 1, pdf.numPages)
    this.setState({ pageNumber })
    this.queueRenderPage(this.state.pageNumber + 1)
  }

  // https://mozilla.github.io/pdf.js/examples/
  pageNumPending = null
  pageRendering = false

  queueRenderPage = pageNum => {
    const { pdf } = this.state
    if (!pdf) return
    if (pageNum < 1 || pageNum > pdf.numPages) return

    if (this.pageRendering) {
      this.pageNumPending = pageNum
    } else {
      this._renderPage(pageNum)
    }
  }

  // dont call this directly; use queueRenderPage
  _renderPage = pageNum => {
    const { pdf } = this.state
    if (!pdf) return
    if (pageNum < 1 || pageNum > pdf.numPages) return

    this.pageRendering = true
    return pdf
      .getPage(pageNum)
      .then(page => this._UnsafeRenderPdf(page))
      .then(() => {
        this.pageRendering = false
        if (this.pageNumPending !== null) {
          this._renderPage(this.pageNumPending)
          this.pageNumPending = null
        }
      })
  }

  // dont call this directly; use queueRenderPage
  _UnsafeRenderPdf = page => {
    const { canvas } = this
    if (!canvas) return
    const canvasContext = canvas.getContext('2d')
    canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio)
    let unscaledViewport = page.getViewport(1)
    const documentWidth = page.pageInfo.view[2]
    const documentHeight = page.pageInfo.view[3]
    const scaleW = documentWidth / unscaledViewport.width
    const scaleH = documentHeight / unscaledViewport.height
    const scale = this.state.scale * Math.min(scaleW, scaleH)
    let viewport = page.getViewport(scale)

    // Adjust the scale so the view exactly fits the parent body element
    const body = canvas.parentElement
    let { width, height } = viewport
    if (height < body.clientHeight || width < body.clientWidth) {
      const aspect = width / height
      if (width / body.clientWidth < height / body.clientHeight) {
        height = body.clientHeight
        width = height * aspect
        viewport = page.getViewport(scale * width / viewport.width)
      } else {
        width = body.clientWidth
        height = width / aspect
        viewport = page.getViewport(scale * height / viewport.height)
      }
    }
    canvas.height = viewport.height
    canvas.width = viewport.width

    this.setState({ error: null })
    return page.render({ canvasContext, viewport })
  }

  render() {
    const { pdf, progress, error } = this.state
    const svg = require('./loading-ring.svg')
    if (error) {
      return <FlashMessage>{error}</FlashMessage>
    }
    if (!pdf && !progress) {
      return (
        <div className="Pdf">
          <img className="loading" src={svg} />
        </div>
      )
    }
    if (progress && progress.loaded < progress.total) {
      const percentage = Math.round(100 * progress.loaded / progress.total)
      return (
        <div className="Pdf">
          <ProgressCircle percentage={percentage} />
        </div>
      )
    }
    return (
      <div className="Pdf">
        <PanZoom
          title={`Page ${this.state.pageNumber} / ${this.state.pdf.numPages}`}
          onNextPage={this.nextPage}
          onPrevPage={this.previousPage}
          onZoom={this.onZoom}>
          <canvas
            ref={c => {
              this.canvas = c
            }}
            className="Pdf__canvas"
          />
        </PanZoom>
      </div>
    )
  }
}

const makeCancelable = promise => {
  let hasCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val =>
        hasCanceled ? reject({ pdf: val, isCanceled: true }) : resolve(val),
    )
    promise.catch(
      error => (hasCanceled ? reject({ isCanceled: true }) : reject(error)),
    )
  })

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true
    },
  }
}
