import { next as A } from '@automerge/automerge'
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./data.json");

// import generated from './generated.json' assert { type: 'json' };

/*
const sizeInMBToTest = 5;
const arrayLength = sizeInMBToTest * 1_000_000 / 100;
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const stringWith100Characters = (characters + characters).slice(0, 100);
const stringArray: string[] = new Array(arrayLength).fill(stringWith100Characters);
const sizeInBytes = new Blob(stringArray).size;
const sizeInMB = sizeInBytes / 1_000_000;

console.log(new Date().toLocaleString());
console.log(`sizeInBytes: ${sizeInBytes}`);
console.log(`sizeInMB: ${sizeInMB}`);
*/

console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo1 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const repo2 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

// const testJson = { stringArray: stringArray };
// const testDoc = A.from(testJson);

const testDoc = A.from(data);

console.log(`${new Date().toLocaleString()} created test doc locally`);

const handle1 = repo1.create(testDoc);

handle1.change((doc) => {
  // @ts-ignore
  doc.testString = 'test';
});

console.log(`${new Date().toLocaleString()} created test doc in repo`);

// wait to give the server time to sync the document
// @ts-ignore
await new Promise((resolve) => setTimeout(resolve, 1000))

console.log(`${new Date().toLocaleString()} waited for 1000ms`);

// withholds existing documents from new peers until they request them
assert.equal(Object.keys(repo2.handles).length, 0);

console.log(`${new Date().toLocaleString()} calling repo2.find`);
const handle1found = repo2.find(handle1.url);
console.log(`${new Date().toLocaleString()} called repo2.find`);

assert.equal(Object.keys(repo2.handles).length, 1);

// @ts-ignore
const docFound = await handle1found.doc();

// @ts-ignore
const testString = docFound.testString;
console.log(`${new Date().toLocaleString()} doc found with testString value: ${testString}`);

console.log(`Exiting!`);
process.exit();
