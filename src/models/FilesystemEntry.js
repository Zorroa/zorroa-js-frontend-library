export default class FilesystemEntry {
  constructor ({id, name, path, isDirectory}) {
    this.id = id
    this.name = name
    this.path = path
    this.isDirectory = isDirectory
  }
}
