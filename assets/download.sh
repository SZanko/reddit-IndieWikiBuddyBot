#!/usr/bin/env sh

curl -s https://api.github.com/repos/KevinPayravi/indie-wiki-buddy/contents/data \
  | jq -r '.[] | select(.type=="file") | .download_url' \
  | xargs -n1 -P4 wget 
