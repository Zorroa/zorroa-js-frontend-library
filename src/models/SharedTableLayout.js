export default class SharedTableLayout {
  constructor({ blobId, name, data }) {
    let blobData = data || {}
    this.id = blobId
    this.blobName = name
    this.name = blobData.name || ''
    this.fields = blobData.fields || []
  }

  getId() {
    return this.id
  }

  getBlobName() {
    return this.blobName
  }

  getName() {
    return this.name
  }

  getFields() {
    return this.fields
  }

  isEmpty() {
    return this.fields.length === 0 || this.getName().length === 0
  }
}
