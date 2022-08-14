#!/bin/sh

while :
do
  yarn build || true

  echo "Waiting..."

  # wait 10 minutes
  sleep 600
done