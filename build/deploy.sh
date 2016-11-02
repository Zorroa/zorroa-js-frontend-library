#!/bin/bash

# Deploy the current build to production

# Note: Use exit 0 to abort for now;
#   Exiting with a non-zero status will make 'npm run deploy' appear to fail catastrophically
#   Exit 0 will abort and not dump a screenfull of misleading errors
#   TODO:

# TODO: add saftey checks or enforce this doesn't get run directly?
#   (require a clean build, clean git repo, etc. ... see build-prod.sh)

echo "deploying ... (TODO: push static build in bin/ to server)"
