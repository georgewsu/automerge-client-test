import { createRequire } from "module";
import process from "node:process";
import { next as A } from '@automerge/automerge'

function logMemoryUsage(): void {
  console.log('memory usage:');
  const memoryUsage = process.memoryUsage();
  for (const [key, value] of Object.entries(memoryUsage)) {
    console.log(`${key}: ${value/1000000}MB`);
  }
  console.log();
}

const require = createRequire(import.meta.url);
const data = require("./data.json");

console.log(`${new Date().toLocaleString()}`);
logMemoryUsage();

for (let i = 0; i < 10; i++) {
  console.log(`${new Date().toLocaleString()} i: ${i}`);
  console.log(`${new Date().toLocaleString()} creating doc from data`);
  A.from(data);
  console.log(`${new Date().toLocaleString()} created doc from data`);
  logMemoryUsage();
}

console.log(`${new Date().toLocaleString()}`);

console.log(`Exiting!`);
process.exit();
