### This script uses the correct package.json file and publishes the entire package.

clean_up () {
    rm package.json
    ln -s package.json.dev package.json
}

trap clean_up 2

npm run generate_doc

rm package.json
cp package.json.publish package.json

npm publish
clean_up
