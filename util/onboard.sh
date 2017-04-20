#!/bin/bash

if [ "$#" -ne 5 ]; then
  echo "Usage: onboard http://localhost:8066 wex wex@zorroa.com Dan Wexler"
  exit -1
fi

set -x
ORIGIN=$1
USERNAME=$2
EMAIL=$3
FIRST_NAME=$4
LAST_NAME=$5

# Create a new user
 curl -H "Content-Type: application/json" -X POST ${ORIGIN}/api/v1/users -d '{"username":"'"${USERNAME}"'", "password":"t3mp0r@ry", "firstName":"'"${FIRST_NAME}"'", "lastName":"'"${LAST_NAME}"'", "email":"'"${EMAIL}"'", "permissionIds":[6,7,12,13]}}' -u admin:admin

curl -H "Content-Type: application/json" -X POST ${ORIGIN}/api/v1/send-onboard-email -d "{\"email\":\"${EMAIL}\"}"

