# automerge-client-test

usage:
```
npm run client
```

connects to automerge-repo-sync-server on port 3030

tested against https://github.com/automerge/automerge-repo-sync-server/tree/v0.2.7

create a large json file in dist/data.json


To reproduce `Error: recursive use of an object detected which would lead to unsafe aliasing in rust`
```
gunzip generated.json.gz
mkdir -p dist
cp generated.json dist/data.json
npm install
npm run client
```
