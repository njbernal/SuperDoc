#!/bin/bash


# Unzip a .docx file to the tests directory


# Check if the file name is provided
if [ -z "$1" ]; then
  echo "Usage: unzip.sh /path/to/my/file"
  exit 1
fi

# Original file path
FILE_PATH="$1"
echo "🥡 Processing file: $FILE_PATH"

# Extract the file name without the extension
original_name=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')

# Remove special characters and replace spaces
safe_name=$(echo "$original_name" | sed 's/[^a-zA-Z0-9]/_/g' | tr '[:upper:]' '[:lower:]')
DIR_PATH="./packages/super-editor/src/tests/data/$safe_name"

if [ -d "$DIR_PATH" ]; then
  echo "🚫 The directory "$DATA_PATH" already exists... exiting."
  exit 0
fi

mkdir -p "$DIR_PATH"
echo "🥡 Created destination directory: $DIR_PATH"

cp "$FILE_PATH" "$DIR_PATH"
echo "🥡 Copied file to destination directory"

DATA_PATH="$DIR_PATH/docx"
unzip -d "$DATA_PATH" "$FILE_PATH"

ABSOLUTE_DATA_PATH=$(realpath "$DATA_PATH")
echo "🥡 Data path: $ABSOLUTE_DATA_PATH"
echo "🥡 Done!"