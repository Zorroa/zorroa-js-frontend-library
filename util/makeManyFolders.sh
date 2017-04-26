#!/bin/bash

# make a folder under Users with a lot of children... like 500 of 'em! // https://youtu.be/Y6rE0EakhG8
# for performance testing

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projroot=$DIR/..
json=$projroot/node_modules/.bin/json

NUM_CHILDREN=${1:-1000}

ORIGIN=https://dev.zorroa.com:8066
FOLDERS_FN=${ORIGIN}/api/v1/folders
JSON_HEADER="Content-Type: application/json"
CREDS="-u admin:z0rr0@12"

echo 'making parent folder Users/MANY_CHILDREN'
parentJson=$(curl -sS -k -H "$JSON_HEADER" -X POST $FOLDERS_FN $CREDS -d '{"name":"MANY_CHILDREN", "parentId":1}')

parentId=$(echo $parentJson | $json id)

echo making $NUM_CHILDREN child folders
time parallel -k -j 30 -q --eta curl -sS -k -H "$JSON_HEADER" -X POST $FOLDERS_FN $CREDS -d '{"name":"{1}", "parentId":{2}}' 1>/dev/null ::: $(seq $NUM_CHILDREN) ::: $parentId

# just for fun
# 1000 in batches of 10:	1m22.782s
# 1000 in batches of 30:	1m17.247s
# 1000 in batches of 100: 1m19.509s
