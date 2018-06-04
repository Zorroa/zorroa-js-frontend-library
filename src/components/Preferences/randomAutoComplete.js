export default function randomAutoComplete() {
  const values = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345679'.split(
    '',
  )
  return values
    .map(() => values[Math.floor(Math.random() * values.length)])
    .join('')
}
