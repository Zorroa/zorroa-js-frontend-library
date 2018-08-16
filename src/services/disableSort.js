/* This helper function takes in the field and returns true
if the field is not sortable */

const analysis = new RegExp('^analysis')
const proxies = new RegExp('^proxies')
const disabledSortFields = [
  'location.point',
  'media.attrs.ResolutionUnit',
  'media.content:1.0',
  'media.dialog',
  'media.keywords',
  'source.exists',
  'zorroa.taxonomy.keywords',
  'zorroa.taxonomy.folderId',
  'zorroa.taxonomy.taxId',
]

export function disableSort(field) {
  const notSortable =
    analysis.test(field) ||
    proxies.test(field) ||
    disabledSortFields.includes(field)
  return notSortable
}
