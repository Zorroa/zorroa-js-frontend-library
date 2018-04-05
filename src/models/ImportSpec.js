export default class ImportSpec {
  constructor({ name, generators, args, pipeline, pipelineId }) {
    this.name = name
    this.generators = generators // Array of ProcessorRef
    this.args = args // Global script args
    this.pipeline = pipeline // Array of ProcessorRef
    this.pipelineId = pipelineId // Only if !pipeline
  }
}
