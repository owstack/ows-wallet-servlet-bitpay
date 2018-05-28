#!/bin/sh

# This script requires Sketch on macOS – see readme.md for details

ASSETS_PATH="../../plugin/assets"

if hash sketchtool 2>/dev/null; then

  # sketchtool is installed by install.sh
  sketchtool export layers $ASSETS_PATH/resources.sketch --output=$ASSETS_PATH

else
  echo >&2 "Sketchtool is not installed, using pre-built resources from $ASSETS_PATH"
fi
