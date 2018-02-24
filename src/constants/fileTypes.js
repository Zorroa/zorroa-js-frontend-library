export const FILE_GROUP_IMAGES = 'Image Files'
export const FILE_GROUP_VECTORS = 'Vector Files'
export const FILE_GROUP_VIDEOS = 'Video Files'
export const FILE_GROUP_FLIPBOOKS = 'Flipbook Files'
export const FILE_GROUP_DOCUMENTS = 'Document Files'

export const allExts = {
  // image files
  psd: 'Adobe Photoshop',
  gif: 'Graphics Interchange Format',
  png: 'Portable Network Graphics',
  jpg: 'Joint Photographic Experts Group',
  jpeg: 'Joint Photographic Experts Group',
  tiff: 'Tagged Image File Format',
  tif: 'Tagged Image File Format',
  // vector files
  pdf: 'Adobe Acrobat',
  svg: 'Scalable Vector Graphic',
  // video files
  mov: 'Quicktime Movie',
  mp4: 'Video File',
  m4v: 'Quicktime Video',
  ogg: 'Ogg Vorbis',
  mpg: 'Motion Picture Group',
  mpeg: 'Motion Picture Group'

  // aac: 'Advanced Audio Coding',
  // mp3: 'Music File',
  // ai: 'Adobe Illustrator',
  // cdr: 'Corel Draw',
  // cdraw: 'Google Drive Drawing',
  // indd: 'Adobe inDesign',
  // dicom: 'Medical Images',
  // dxa: 'Bones and stuff',
  // pet: 'Positron Electron Transmission',
  // mri: 'Magnetic Resonance Imaging',
  // ultra: 'Ultrasound',
  // xray: 'X-Ray',
  // shp: 'Shapefile'
  // kml: 'Keyhole Markup Language (Google Earth)',
  // gdb: 'File Geodatabase',
  // osm: 'Open Street Map',
  // geotiff: 'Geographic Tagged Image File Format'
}

// Note, these groups are not mutually exclusive
export const groupExts = {
  [FILE_GROUP_IMAGES]: ['gif', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'psd'], /*, 'geotiff' */
  [FILE_GROUP_VECTORS]: ['pdf', 'svg', 'ai', 'shp', 'cdr'],
  [FILE_GROUP_VIDEOS]: ['mp4', 'm4v', 'mov', 'ogg', 'mpg', 'mpeg'],
  [FILE_GROUP_FLIPBOOKS]: ['zfb'],
  [FILE_GROUP_DOCUMENTS]: ['pdf']
  // 'Audio Files': ['aac', 'mp3'],
  // 'Design Source Files - sketch, Adobe': ['ai', 'indd', 'psd'],
  // 'Map Files': ['shp', 'kml', 'gdb', 'osm', 'geotiff'],
  // 'Medical Files': ['dicom', 'dxa', 'pet', 'mri', 'ultra', 'xray'],
}
