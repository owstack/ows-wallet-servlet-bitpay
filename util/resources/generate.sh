#!/bin/sh

# This script requires Sketch on macOS – see readme.md for details

# check args
if [ $# -eq 0 ]; then
    echo "Plugin template name not specified"
    exit
fi

# setup locations
ROOT_PATH="../.."
TEMPLATE_PATH="$ROOT_PATH/plugin-template/$1"
RESOURCES_ROOT="$ROOT_PATH/resources"
RESOURCES_PATH="$RESOURCES_ROOT/$1"

if [ ! -d "$TEMPLATE_PATH" ]; then
    echo "Plugin template directory not found: $TEMPLATE_PATH"
  exit
fi

echo "Processing resources for $1"

# remove existing resources
rm -fr $RESOURCES_PATH

if hash sketchtool 2>/dev/null; then

  # export all slices marked for export to the proper directory
  echo "Exporting all assets from $TEMPLATE_PATH/resources.sketch"

  # sketchtool is installed by install.sh
  sketchtool export layers $TEMPLATE_PATH/resources.sketch --output=$TEMPLATE_PATH/resources

else
  echo >&2 "Sketchtool is not installed, using pre-built resources from $TEMPLATE_PATH"
fi

echo "Publishing resources to $RESOURCES_PATH"
mkdir -p $RESOURCES_ROOT
cp -R $TEMPLATE_PATH/resources $RESOURCES_PATH
