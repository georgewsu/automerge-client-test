import { createRequire } from "module";
import process from "node:process";
import { next as A } from '@automerge/automerge'
import {
  Chunk,
  Repo,
  StorageAdapterInterface,
  type StorageKey,
} from "@automerge/automerge-repo"

export class DummyStorageAdapter implements StorageAdapterInterface {
  constructor() {
    console.log(`DummyStorageAdapter constructor`);
  }

  async load(keyArray: StorageKey): Promise<Uint8Array | undefined> {
    console.log(`load: ${keyArray}`);
    return new Uint8Array([]);
  }

  async save(keyArray: StorageKey, binary: Uint8Array): Promise<void> {
    console.log(`save: ${keyArray}`);
  }

  async remove(keyArray: string[]): Promise<void> {
    console.log(`remove: ${keyArray}`);
  }

  async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
    console.log(`loadRange: ${keyPrefix}`);
    return [];
  }

  async removeRange(keyPrefix: string[]): Promise<void> {
    console.log(`removeRange: ${keyPrefix}`);
  }
}

function logMemoryUsage(): void {
  console.log('memory usage:');
  const memoryUsage = process.memoryUsage();
  for (const [key, value] of Object.entries(memoryUsage)) {
    console.log(`${key}: ${value/1000000}MB`);
  }
  console.log();
}

const repo = new Repo({
  network: [],
  storage: new DummyStorageAdapter(),
});

const require = createRequire(import.meta.url);
const data = require("./data.json");

console.log(`${new Date().toLocaleString()}`);
logMemoryUsage();

// load doc
/*
for (let i = 0; i < 10; i++) {
  console.log(`${new Date().toLocaleString()} i: ${i}`);
  console.log(`${new Date().toLocaleString()} creating doc from data`);
  A.from(data);
  console.log(`${new Date().toLocaleString()} created doc from data`);
  logMemoryUsage();
}
*/

// repo create doc
for (let i = 0; i < 10; i++) {
  console.log(`${new Date().toLocaleString()} i: ${i}`);
  console.log(`${new Date().toLocaleString()} creating doc in repo`);
  repo.create(data);
  console.log(`${new Date().toLocaleString()} created doc in repo`);
  logMemoryUsage();
}

console.log(`${new Date().toLocaleString()}`);

console.log(`Exiting!`);
process.exit();
