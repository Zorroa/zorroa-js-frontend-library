#!/bin/sh
if [ -n "${GCLOUD_SSL_BUCKET}" ]
then
  echo "Downloading config files from GCS SSL secret bucket."
  /root/google-cloud-sdk/bin/gsutil cp -r "gs://${GCLOUD_SSL_BUCKET}/key.pem" ./
  /root/google-cloud-sdk/bin/gsutil cp -r "gs://${GCLOUD_SSL_BUCKET}/cert.pem" ./
fi
npm start
