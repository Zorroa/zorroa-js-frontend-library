import { connect } from 'react-redux'

export default function connectExporter(Exporter) {
  return connect(state => ({
    processors: state.exports.processors,
    hasNonDefaultProcessors: state.exports.processors.length > 1,
  }))(Exporter)
}
