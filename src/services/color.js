
/*
  http://paulbourke.net/texture_colour/colourspace/
  Calculate HSL from RGB
  Hue is in degrees
  Lightness is between 0 and 100
  Saturation is between 0 and 100
*/
export function RGB2HSL ([c1R, c1G, c1B]) {
  var themin, themax, delta
  var c2H, c2S, c2L

  themin = Math.min(c1R, Math.min(c1G, c1B))
  themax = Math.max(c1R, Math.max(c1G, c1B))
  delta = themax - themin
  c2L = (themin + themax) / 2
  c2S = 0
  if (c2L > 0 && c2L < 1) {
    c2S = delta / (c2L < 0.5 ? (2 * c2L) : (2 - 2 * c2L))
  }
  c2H = 0
  if (delta > 0) {
    if (themax === c1R && themax !== c1G) {
      c2H += (c1G - c1B) / delta
    }
    if (themax === c1G && themax !== c1B) {
      c2H += (2 + (c1B - c1R) / delta)
    }
    if (themax === c1B && themax !== c1R) {
      c2H += (4 + (c1R - c1G) / delta)
    }
    c2H *= 60
  }
  return [c2H, c2S * 100, c2L * 100]
}

/*
  http://paulbourke.net/texture_colour/colourspace/
  Calculate RGB from HSL, reverse of RGB2HSL()
  Hue is in degrees
  Lightness is between 0 and 100
  Saturation is between 0 and 100
*/
export function HSL2RGB ([c1H, c1S, c1L]) {
  var h = c1H
  var s = c1S / 100
  var l = c1L / 100
  var c2R, c2G, c2B
  var satR, satG, satB
  var ctmpR, ctmpG, ctmpB

  while (h < 0) {
    h += 360
  }
  while (h > 360) {
    h -= 360
  }

  if (h < 120) {
    satR = (120 - h) / 60.0
    satG = h / 60.0
    satB = 0
  } else if (h < 240) {
    satR = 0
    satG = (240 - h) / 60.0
    satB = (h - 120) / 60.0
  } else {
    satR = (h - 240) / 60.0
    satG = 0
    satB = (360 - h) / 60.0
  }
  satR = Math.min(satR, 1)
  satG = Math.min(satG, 1)
  satB = Math.min(satB, 1)

  ctmpR = 2 * s * satR + (1 - s)
  ctmpG = 2 * s * satG + (1 - s)
  ctmpB = 2 * s * satB + (1 - s)

  if (l < 0.5) {
    c2R = l * ctmpR
    c2G = l * ctmpG
    c2B = l * ctmpB
  } else {
    c2R = (1 - l) * ctmpR + 2 * l - 1
    c2G = (1 - l) * ctmpG + 2 * l - 1
    c2B = (1 - l) * ctmpB + 2 * l - 1
  }

  return [c2R, c2G, c2B]
}

/*
  http://paulbourke.net/texture_colour/colourspace/
  Calculate RGB from HSV, reverse of RGB2HSV()
  Hue is in degrees
  Lightness is between 0 and 1
  Saturation is between 0 and 1
*/
export function HSV2RGB ([c1H, c1S, c1V]) {
  var h = c1H
  var s = c1S / 100
  var v = c1V / 100
  var c2R, c2G, c2B, satR, satG, satB

  while (h < 0) {
    h += 360
  }
  while (h > 360) {
    h -= 360
  }

  if (h < 120) {
    satR = (120 - h) / 60
    satG = h / 60
    satB = 0
  } else if (h < 240) {
    satR = 0
    satG = (240 - h) / 60
    satB = (h - 120) / 60
  } else {
    satR = (h - 240) / 60
    satG = 0
    satB = (360 - h) / 60
  }
  satR = Math.min(satR, 1)
  satG = Math.min(satG, 1)
  satB = Math.min(satB, 1)

  c2R = (1 - s + s * satR) * v
  c2G = (1 - s + s * satG) * v
  c2B = (1 - s + s * satB) * v

  return [c2R, c2G, c2B]
}

/*
  http://paulbourke.net/texture_colour/colourspace/
  Calculate HSV from RGB
  Hue is in degrees
  Lightness is betweeen 0 and 1
  Saturation is between 0 and 1
*/
export function RGB2HSV ([c1R, c1G, c1B]) {
  var themin, themax, delta
  var c2H, c2S, c2V

  themin = Math.min(c1R, Math.min(c1G, c1B))
  themax = Math.max(c1R, Math.max(c1G, c1B))
  delta = themax - themin
  c2V = themax
  c2S = 0
  if (themax > 0) {
    c2S = delta / themax
  }
  c2H = 0
  if (delta > 0) {
    if (themax === c1R && themax !== c1G) {
      c2H += (c1G - c1B) / delta
    }
    if (themax === c1G && themax !== c1B) {
      c2H += (2 + (c1B - c1R) / delta)
    }
    if (themax === c1B && themax !== c1R) {
      c2H += (4 + (c1R - c1G) / delta)
    }
    c2H *= 60
  }
  return [c2H, c2S * 100, c2V * 100]
}

export function HSL2HSV ([c1H, c1S, c1L]) {
  var rgb = HSL2RGB([c1H, c1S, c1L])
  return RGB2HSV(rgb)
}

export function HSV2HSL ([c1H, c1S, c1V]) {
  var rgb = HSV2RGB([c1H, c1S, c1V])
  return RGB2HSL(rgb)
}

// http://codeitdown.com/hsl-hsb-hsv-color/
export function hsl2hsb ([_H, _S, _L]) {
  var __S = _S / 100
  var __L = _L / 100
  const B = 0.5 * (2 * __L + __S * (1 - Math.abs(2 * __L - 1)))
  const S = (B !== 0) ? (2 * (B - __L) / B) : 0
  return [_H, S * 100, B * 100]
}
export function hsb2hsl ([_H, _S, _B]) {
  var __S = _S / 100
  var __B = _B / 100
  const L = 0.5 * __B * (2 - __S)
  const d = 1 - Math.abs(2 * L - 1)
  const S = (d !== 0) ? __B * __S / d : 0
  return [_H, S * 100, L * 100]
}

// http://stackoverflow.com/a/5624139/1424242
const hexToRgbLongRE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
const hexToRgbShortRE = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
export function hexToRgb (hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(hexToRgbShortRE, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  var result = hexToRgbLongRE.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

export function rgbToHex ([r, g, b]) {
  return '#' + ((1 << 24) + (Math.floor(r * 255) << 16) + (Math.floor(g * 255) << 8) + Math.floor(b * 255)).toString(16).slice(1)
}

// convert between normalized hsl/hsv and percent based hsl/hsv
// normalized means a color that is ([0..360], [0..1], [0..1])
// percent based means the 2nd & 3rd channels go to 100 ([0..360], [0..100], [0..100])
export var hsxPctToNorm = ([h, s, x]) => [h, s / 100, x / 100]
export var hsxNormToPct = ([h, s, x]) => [h, s * 100, x * 100]
