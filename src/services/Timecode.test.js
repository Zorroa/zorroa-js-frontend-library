import Timecode from './Timecode'

describe('Timecode.timeToFrames', () => {
  it('should return correct frame number for 24 FPS framerate', () => {
    const tc = new Timecode(24)
    expect(tc.timeToFrames(1)).toEqual(24)
    expect(tc.timeToFrames(1.5)).toEqual(36)
    expect(tc.timeToFrames(10)).toEqual(240)
  })

  it('should return correct frame number for 59.97 FPS framerate', () => {
    const tc = new Timecode(59.97)
    expect(tc.timeToFrames(125)).toEqual(7500)
  })
})
