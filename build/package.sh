#!/bin/bash

file="../background.js"
mv "$file" "$file".bak
java -jar $CLOSURE_JAR --language_out ECMASCRIPT_2018 --js_output_file="$file" "$file".bak

# package
cd ../..
zip -r9 mdn-search.zip mdn-search/ -x mdn-search/build/\* mdn-search/webstore/\* mdn-search/.git/\* \*.DS_Store \*.bak \*README.md \*LICENSE

# after package
cd mdn-search/build
rm "$file"
mv "$file".bak "$file"
