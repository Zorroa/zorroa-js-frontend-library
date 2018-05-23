export default function detectLoginSource(rawSource) {
  rawSource = rawSource || ''
  const parsedSource = rawSource.split('-')
  const parsedSourcePostfix = parsedSource.pop()

  if (parsedSourcePostfix === 'saml') {
    return 'saml'
  }

  return 'local'
}
