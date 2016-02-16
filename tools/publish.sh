### This script uses the correct package.json file and publishes the entire package.

rm package.json
cp package.json.publish package.json

npm publish

rm package.json
ln -s package.json.dev package.json
