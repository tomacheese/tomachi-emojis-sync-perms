#!/bin/sh

while :
do
  pnpm start || true

  echo "Restart after 5 seconds"
  sleep 5
done