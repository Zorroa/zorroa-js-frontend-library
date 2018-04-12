export const defaultTableFieldWidth = 100
export const defaultTableFields = [
  'source.type',
  'source.filename',
  'source.date',
  'source.fileSize',
]
export const defaultMetadataFields = [
  'source.filename',
  'source.date',
  'source.fileSize',
]
export const defaultLightbarFields = [
  'source.type',
  'source.filename',
  'source.date',
  'media.width',
  'media.height',
]
export const defaultThumbFields = ['source.type', 'media.width', 'media.height']
export const defaultDragFields = []
export const defaultThumbFieldTemplate =
  '%{media.width}x%{media.height} %{source.type}'
export const defaultLightbarFieldTemplate =
  '%{source.type} %{source.filename} %{media.width}x%{media.height} %{source.date}'
export const defaultTableLayouts = []
export const defaultFpsFrequencies = [12, 24, 30]