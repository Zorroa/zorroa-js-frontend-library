export default function Timecode(frameRate) {
  this.frameRate = frameRate

  this.timeToFrames = function(timecode) {
    const BASE_10 = 10
    const intFrameRate = Math.ceil(this.frameRate)
    const minutesSeconds = Timecode.divideAndRemainder(timecode, 60)
    const hoursMinutes = Timecode.divideAndRemainder(minutesSeconds[0], 60)
    const frames = (timecode % 1) * this.frameRate
    let dropFrames = 0

    if (this.frameRate.toFixed(2) === '29.98') {
      dropFrames = 2
    }

    if (this.frameRate.toFixed(2) === '59.94') {
      dropFrames = 4
    }

    const hours = parseInt(hoursMinutes[0], BASE_10)
    const mins = parseInt(hoursMinutes[1], BASE_10)
    const secs = parseInt(minutesSeconds[1], BASE_10)
    const totalMinutes = 60 * hours + mins

    const frameNumber =
      intFrameRate * 3600 * hours +
      intFrameRate * 60 * mins +
      intFrameRate * secs +
      parseInt(frames, BASE_10) -
      dropFrames * (totalMinutes - totalMinutes / 10)
    return frameNumber
  }
}

Timecode.divideAndRemainder = function(dividend, divisor) {
  const quotient = dividend / divisor
  const remainder = dividend % divisor
  return [quotient, remainder]
}
