import { next as A } from '@automerge/automerge'
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const file = require("./file.json");

console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo1 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const repo2 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const mapProductToAutomerge = (value: any) => {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return new A.RawString(value);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(mapProductToAutomerge);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, mapProductToAutomerge(value)])
    );
  }
}

const data = mapProductToAutomerge(file);
const handle1 = repo1.create(data);

console.log(`${new Date().toLocaleString()} created test doc in repo`);

console.log(`${new Date().toLocaleString()} calling repo2.find`);
const handle1found = repo2.find(handle1.url);

assert.equal(Object.keys(repo2.handles).length, 1);

console.log(`${new Date().toLocaleString()} waiting for doc to be ready`);
const docFound = await handle1found.doc(["ready"]);

// @ts-ignore
const productName = docFound?.product?.name;
console.log(`${new Date().toLocaleString()} doc found with productName value: ${productName}`);

console.log(`Exiting!`);
process.exit();
