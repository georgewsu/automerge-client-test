import { stringifyAutomergeUrl, DocumentId, Repo} from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import assert from "assert";

console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

// withholds existing documents from new peers until they request them
assert.equal(Object.keys(repo.handles).length, 0);

const documentId = "d6pp5ScsaiafojrTMYMkRU6ixBR" as DocumentId;
const url = stringifyAutomergeUrl(documentId);

console.log(`${new Date().toLocaleString()} calling repo.find`);
const handle1found = repo.find(url);
console.log(`${new Date().toLocaleString()} called repo.find`);

assert.equal(Object.keys(repo.handles).length, 1);

// @ts-ignore
const docFound = await handle1found.doc(["ready"]);

// @ts-ignore
const testString = docFound.testString;
console.log(`${new Date().toLocaleString()} doc found with testString value: ${testString}`);

console.log(`Exiting!`);
process.exit();
