import { DocumentId, Repo} from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

if (process.argv.length !== 3) {
  console.log(`Usage: npm run client <documentId>`);
  process.exit();
}

console.log(`${new Date().toLocaleString()} websocket test client starting`);

const PORT = 3030;

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter(`ws://localhost:${PORT}`)],
});

const documentId = process.argv[process.argv.length - 1] as DocumentId;

console.log(`${new Date().toLocaleString()} calling repo.find`);
const handleFound = repo.find(documentId);
console.log(`${new Date().toLocaleString()} called repo.find`);

// @ts-ignore
const docFound = await handleFound.doc(["ready"]);
console.log(`${new Date().toLocaleString()} doc ready`);

console.log(`doc:`);
console.log(docFound);
console.log();

console.log(`Exiting!`);
process.exit();
