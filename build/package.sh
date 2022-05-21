#!/bin/bash

rootDir="manifest-v3" # or "manifest-v2"
cd ..

file="${rootDir}/background.js"
mv "$file" "$file".bak
java -jar $CLOSURE_JAR --language_out ECMASCRIPT_2020 --js_output_file="$file" "$file".bak

# package
zip -r9 mdn-search.zip  "$rootDir/" -x \*.DS_Store \*.bak

# after package
rm "$file"
mv "$file".bak "$file"
cd ./build
