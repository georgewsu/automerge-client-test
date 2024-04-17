// import { next as A } from '@automerge/automerge'
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";
import { RawString } from "@automerge/automerge/next";

const arrayLength = 100;
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const stringWithCharacters = (characters + characters).slice(0, 50);
const stringArray: string[] = new Array(arrayLength).fill(stringWithCharacters);
const rawStringArray = stringArray.map(s => new RawString(s));

console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo1 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const repo2 = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const workflowObject = {
  workflowFields: rawStringArray
}

const testJson = {
  workflows: new Array(1000).fill(workflowObject)
};

console.log(`${new Date().toLocaleString()} created test doc locally`);

const handle1 = repo1.create(testJson);

handle1.change((doc) => {
  // @ts-ignore
  doc.testString = 'test';
});

console.log(`${new Date().toLocaleString()} created test doc in repo`);

console.log(`${new Date().toLocaleString()} calling repo2.find`);
const handle1found = repo2.find(handle1.documentId);
console.log(`${new Date().toLocaleString()} called repo2.find`);

assert.equal(Object.keys(repo2.handles).length, 1);

// @ts-ignore
const docFound = await handle1found.doc(["ready"]);

// @ts-ignore
const testString = docFound.testString;
console.log(`${new Date().toLocaleString()} doc found with testString value: ${testString}`);
// @ts-ignore
const workflows = docFound.workflows;
console.log(`${new Date().toLocaleString()} doc found with workflows: ${workflows.length}`);

for (let j = 0; j < 1000; j++) {
  for (let i = 0; i < 1; i++) {
    handle1.change((doc) => {
      doc.workflows.push(workflowObject);
    });
  }

  // wait to give the server time to sync the document
  // @ts-ignore
  await new Promise((resolve) => setTimeout(resolve, 10))
}

// wait to give the server time to sync the document
// @ts-ignore
await new Promise((resolve) => setTimeout(resolve, 5000))

const handle1found2 = repo2.find(handle1.documentId);
// @ts-ignore
const docFound2 = await handle1found2.doc(["ready"]);
// @ts-ignore
const workflows2 = docFound2.workflows;
console.log(`${new Date().toLocaleString()} doc ${handle1.documentId} found with workflows: ${workflows2.length}`);

console.log(`Exiting!`);
process.exit();
