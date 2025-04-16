import { Repo } from "@automerge/automerge-repo"

import { createRequire } from "module";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import v8 from "v8";

const require = createRequire(import.meta.url);
const file = require("./file.json");

const repo1 = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter(),
  ],
  storage: new IndexedDBStorageAdapter("automerge-repo-client-test"),
});

const data = file;

const formatMemoryUsage = (data: number): string => `${Math.round(data / 1024 / 1024)} MB`;
function logMemoryUsage(repo: Repo): void {
  console.log(`repo handles: ${Object.keys(repo.handles).length}`);
  const memoryUsage = process.memoryUsage();
  const heapUsed = formatMemoryUsage(memoryUsage.heapUsed);
  const heapTotal = formatMemoryUsage(memoryUsage.heapTotal);
  const external = formatMemoryUsage(memoryUsage.external);
  const rss = formatMemoryUsage(memoryUsage.rss);
  const heapSizeLimit = formatMemoryUsage(v8.getHeapStatistics().heap_size_limit);
  console.log(`heapUsed: ${heapUsed} heapTotal: ${heapTotal} external: ${external} rss: ${rss} heapSizeLimit: ${heapSizeLimit}`);
}

console.log(`Starting test`);

for (let i = 1; i <= 50; i++) {
  console.log(`test ${i}`);
  const handle1 = repo1.create(data);
  console.log(`${new Date().toLocaleString()} created test doc in repo`);
  if (i % 10 === 0) {
    logMemoryUsage(repo1)
  }
}

console.log(`Exiting!`);
process.exit();
