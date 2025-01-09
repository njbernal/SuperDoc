#!/bin/bash


# Unzip a .docx file to the tests directory


# Check if the file name is provided
if [ -z "$1" ]; then
  echo "Usage: unzip.sh /path/to/my/file"
  exit 1
fi

# Original file path
FILE_PATH="$1"
IS_PUBLIC_SAFE="$2"

echo "🥡 Processing file: $FILE_PATH"

# Extract the file name without the extension
original_name=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')

# Remove special characters and replace spaces
safe_name=$(echo "$original_name" | sed 's/[^a-zA-Z0-9]/_/g' | tr '[:upper:]' '[:lower:]')
BASE_PATH=./packages/super-editor/src/tests/data
DIR_PATH=$BASE_PATH/$safe_name

if [ -d "$DIR_PATH" ]; then
  echo "🚫 The directory $DIR_PATH already exists... exiting."
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

# Unless the user explicitly tells us that this data is git-safe, we will gitignore it
if [ "$IS_PUBLIC_SAFE" != "true" ]; then
  GITIGNORE_PATH=$BASE_PATH/.gitignore
  echo "$safe_name/" >> "$GITIGNORE_PATH"
fi