#!/bin/bash

file="../background.js"
mv "$file" "$file".bak
java -jar $CLOSURE_JAR --language_out ECMASCRIPT_2018 --js_output_file="$file" "$file".bak

# package
cd ../..
zip -r9 mdn-search.zip mdn-search/ -x *build* -x *.git* -x *.DS_Store* *.bak* -x mdn-search/webstore/\*

# after package
cd mdn-search/build
rm "$file"
mv "$file".bak "$file"
