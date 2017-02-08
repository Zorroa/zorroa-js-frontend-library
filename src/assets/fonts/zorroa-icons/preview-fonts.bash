#!/bin/bash -e # -x

# We need to be sitting in src/assets/fonts/zorroa-icons (where this script is)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# unpack the downloaded file in place, with overwrite
unzip -o zorroa-icons.zip

# open font preview page
open demo.html
