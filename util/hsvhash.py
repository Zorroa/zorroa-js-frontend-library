#!/usr/bin/python2.7

"""
hsvhash.py: copies an image file

Invoke using -h for usage
"""

import sys
import argparse
import cv2
import numpy as np
import math

#----------------------------------------------------------------------

parser = argparse.ArgumentParser(
  description='Generate the hsv hash of an image.',
  epilog='Example: %(prog)s in.ppm out.jpg')
parser.add_argument('input', metavar='<input>', help='input image')
args = parser.parse_args()


try:
  img = cv2.imread(args.input, -1) # reads jpg/png in BGR(!) format by default
except:
    print "I had some trouble reading '%s'." % args.input
    print "If you typed it correctly, and the file exists, then I'm lame, sorry."
    sys.exit(1)


# --- NONLINEAR version
# This is the length of the histogram parts, per channel
HSV_HASH_LEN = [12,5,3]
HSV_RANGE_MAX = [180,256,256]

SIZE=256
MAX_HIST_VAL = SIZE**2
HEX_DIGITS = 'abcdefghijklmnop'

# this works with floats or numpy arrays! but be careful to pass in floats for the range values
# def remap (x, min1, max1, min2, max2):
#   return min2 + (max2 - min2) * ((x - min1) / (max1 - min1))

# encode an array of float values in the range [0,maxVal] into an
# array of float values in the range [0,1]
# encoding may be non-linear
def histogramToEncodedNormalHistogram(hist, maxVal):
  # offset linear encoding: (mostly) linear histogram, a threshold of 10 pixels makes the value non-zero
  # return remap(hist, 10.0, float(maxVal), 1.0/16.0, 1.0)

  # square root encoding
  return (np.sqrt(hist) / math.sqrt(maxVal))

  # log encoding
  # with np.errstate(divide='ignore'):
  #   return (np.where(hist != 0, np.log(hist), 0) / math.log(maxVal))

# turn an array of float values in the range [0,1] into a hash string of chars 'a'-'p'
def encodedNormalHistogramToHashString(hexArray):
  HEX_DIGITS = 'abcdefghijklmnop' # use a hamming-friendly encoding for hex digits
  intClippedArray = (16.0 * hexArray).astype(int).clip(0,15)
  return ''.join((HEX_DIGITS[x] for x in intClippedArray))

def histogramToHashString(hist, maxVal):
  return encodedNormalHistogramToHashString(histogramToEncodedNormalHistogram(hist, maxVal))


resized_img = cv2.resize(img, (SIZE, SIZE))
if len(img.shape) < 3:
  resized_img = cv2.cvtColor(resized_img,cv2.COLOR_GRAY2BGR) # note BGR (opencv's default read format)

hsv = cv2.cvtColor(resized_img, cv2.COLOR_BGR2HSV)

#---------------------
# independent hsv hash (hue, sat, val are hashed separately)

def histHash(channel):
  hist = cv2.calcHist([hsv],[channel],None,[HSV_HASH_LEN[channel]],[0,HSV_RANGE_MAX[channel]])
  return histogramToHashString(hist.ravel(), MAX_HIST_VAL)

hsvFinal = histHash(0) + histHash(1) + histHash(2)

print 'similarity.hsv', hsvFinal

#-------------------
# dependent hsv hash

DEP_HSV_HASH_LEN = [6, 3, 3]
depHist = cv2.calcHist([hsv], [0, 1, 2], None, DEP_HSV_HASH_LEN, [0,HSV_RANGE_MAX[0], 0,HSV_RANGE_MAX[1], 0,HSV_RANGE_MAX[2]])
flatDepHist = depHist.ravel() # row-major flattened view
depHash = histogramToHashString(flatDepHist, MAX_HIST_VAL)

print 'similarity.dephsv', depHash

#---------
# hue hash

HUE_HASH_LEN = 12
hueHist = cv2.calcHist([hsv],[0],None,[HUE_HASH_LEN],[0,HSV_RANGE_MAX[0]])
hueHash = histogramToHashString(hueHist.ravel(), MAX_HIST_VAL)

print 'similarity.hue', hueHash

#---------
# dependent rgb hash

rgb = cv2.cvtColor(resized_img, cv2.COLOR_BGR2RGB)
DEP_RGB_HASH_LEN = [4, 4, 4]
depRgbHist = cv2.calcHist([rgb], [0, 1, 2], None, DEP_RGB_HASH_LEN, [0,256, 0,256, 0,256])
flatDepRgbHist = depRgbHist.ravel() # row-major flattened view
depRgbHash = histogramToHashString(flatDepRgbHist, MAX_HIST_VAL)

print 'similarity.deprgb_444', depRgbHash
