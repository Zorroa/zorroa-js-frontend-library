import { isValidEmail } from './jsUtil'

describe('jsUtil', () => {
  describe('isValidEmail()', () => {
    it('Should perform a basic sanity check on emails', () => {
      expect(isValidEmail('bad@joke.dad')).toBe(true)
      expect(isValidEmail('devops@localhost')).toBe(true)
      expect(isValidEmail('info@visualintelligence.science')).toBe(true)
    })
  })
})
