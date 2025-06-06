import { next as A } from '@automerge/automerge'
import { DocHandle, Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from "module"
import process from "node:process"
import v8 from "v8"
import heapdump from 'heapdump'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__filename)

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const stringWith100Characters = (characters + characters).slice(0, 100);

const WEBSOCKET_HOST = 'localhost';
const WEBSOCKET_PORT = 3030;

let localRepo: Repo;
let websocketRepo: Repo;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logMemoryUsage(): void {
  const memoryUsage = process.memoryUsage();
  const formatMB = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;
  console.log('Memory usage:');
  console.log(`heapUsed: ${formatMB(memoryUsage.heapUsed)}`);
  console.log(`heapTotal: ${formatMB(memoryUsage.heapTotal)}`);
  console.log(`external: ${formatMB(memoryUsage.external)}`);
  console.log(`rss: ${formatMB(memoryUsage.rss)}`);
  console.log(`heapSizeLimit: ${formatMB(v8.getHeapStatistics().heap_size_limit)}`);
  console.log();
}

function convertToRawString(value: any): any {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return new A.RawString(value);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(convertToRawString);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, convertToRawString(value)])
    );
  }
}

function getData(source: 'file' | 'generated', options: { filename?: string; sizeMB?: number; useRawString?: boolean } = {}): any {
  let data;
  switch (source) {
    case 'file':
      console.log('Loading file data...');
      data = require(`./${options.filename || 'data.json'}`);
      break;
    case 'generated':
      console.log('Generating test data...');
      const arrayLength = (options.sizeMB || 1) * 1_000_000 / 100;
      data = {
        stringArray: new Array(arrayLength).fill(stringWith100Characters)
      };
      break;
  }
  console.log(`Data size: ${JSON.stringify(data).length} bytes`);

  if (options.useRawString) {
    console.log('Converting data to RawString...');
    data = convertToRawString(data);
    console.log(`Converted data size: ${JSON.stringify(data).length} bytes`);
  }

  return data;
}

async function createDocument(data: any, repoType: 'none' | 'local' | 'websocket', removeFromCache = false): Promise<void> {
  console.log(`Creating document with repo type: ${repoType}`);
  let repo: Repo | undefined;
  let handle: DocHandle<any> | undefined;
  try {
    switch (repoType) {
      case 'none':
        console.log('Creating document with A.from()...');
        const doc = A.from(data);
        break;
      case 'local':
        repo = localRepo;
        console.log('Creating document with local repo...');
        handle = localRepo.create(data);
        console.log('Document created with local repo');
        break;
      case 'websocket':
        repo = websocketRepo;
        console.log('Creating document with websocket repo...');
        handle = websocketRepo.create(data);
        // wait to give the server time to sync the document
        await sleep(1000);
        console.log('Document created with websocket repo');
        break;
    }
  } catch (error) {
    console.error('Error in createDocument:', error);
    throw error;
  }

  if (removeFromCache && repo && handle) {
    await sleep(1000);
    if (handle.isReady()) {
      console.log('Removing document from local repo cache.');
      await repo.removeFromCache(handle.documentId);
      console.log('Removed document from local repo cache.');
      await sleep(1000);
    } else {
      console.log('Doc handle is not ready, skipped removing from local repo cache');
    }
  }
}

async function callGC(): Promise<void> {
  if (global.gc) {
    console.log('Calling gc');
    global.gc();
    console.log('Called gc');
    await sleep(1000);
  } else {
    console.log('Garbage collection unavailable');
  }
}

function takeHeapSnapshot(label: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `heap_${timestamp}_${label}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err: Error | null, filename: string) => {
    if (err) {
      console.error('Error taking heap snapshot:', err);
    } else {
      console.log(`Heap snapshot written to ${filename}`);
    }
  });
}

async function runMemoryUsageTest(options: {
  iterations: number;
  dataSource: 'file' | 'generated';
  dataSizeMB?: number;
  repo: 'none' | 'local' | 'websocket';
  useRawString: boolean;
  removeFromCache: boolean;
  takeHeapSnapshot: boolean;
}) {
  console.log(`Options:`, options);

  console.log('Getting data...');
  const data = getData(options.dataSource, {
    sizeMB: options.dataSizeMB,
    useRawString: options.useRawString
  });
  console.log(`Data loaded, size: ${JSON.stringify(data).length} bytes`);

  if (options.takeHeapSnapshot) {
    await callGC();
    takeHeapSnapshot('before');
  }

  console.log(`Test starting`);
  const startTime = performance.now();
  for (let i = 0; i < options.iterations; i++) {
    console.log();
    console.log(`${new Date().toLocaleString()} iteration: ${i+1}`);
    console.log(`${new Date().toLocaleString()} creating doc from data`);

    try {
      const startTime = Date.now();
      await createDocument(data, options.repo, options.removeFromCache);
      const endTime = Date.now();
      console.log(`${new Date().toLocaleString()} created doc from data in ${endTime - startTime}ms`);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }

    logMemoryUsage();
  }
  const duration = Math.ceil(performance.now() - startTime);
  console.log(`Test ended, took: ${duration}ms`);
  console.log();

  await callGC();
  logMemoryUsage();

  if (options.takeHeapSnapshot) {
    takeHeapSnapshot('after');
  }
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('iterations', {
    alias: 'i',
    description: 'Number of iterations for applicable tests',
    type: 'number',
    default: 10
  })
  .option('dataSource', {
    alias: 'd',
    description: 'Source of test data',
    choices: ['file', 'generated'],
    default: 'generated'
  })
  .option('size', {
    alias: 's',
    description: 'Size in MB for generated data',
    type: 'number',
    default: 1
  })
  .option('repo', {
    alias: 'r',
    description: 'Repo to use for document creation',
    choices: ['none', 'local', 'websocket'],
    default: 'none'
  })
  .option('useRawString', {
    alias: 'u',
    description: 'Whether to convert strings to RawString',
    type: 'boolean',
    default: false
  })
  .option('removeFromCache', {
    alias: 'c',
    description: 'Whether to remove document from local repo cache',
    type: 'boolean',
    default: false
  })
  .option('heapdump', {
    alias: 'p',
    description: 'Whether to take heap snapshots during the test',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .parseSync();

async function main() {
  console.log('\nRunning memory usage test');

  try {
    const options = {
      iterations: argv.iterations,
      dataSource: argv.dataSource as 'file' | 'generated',
      dataSizeMB: argv.size,
      repo: argv.repo as 'none' | 'local' | 'websocket',
      useRawString: argv.useRawString,
      removeFromCache: argv.removeFromCache,
      takeHeapSnapshot: argv.heapdump
    };

    if (options.repo === 'local') {
      localRepo = new Repo({
        network: [],
        storage: undefined,
      });
    } else if (options.repo === 'websocket') {
      console.log(`Connecting to websocket at ws://${WEBSOCKET_HOST}:${WEBSOCKET_PORT}...`);
      const adapter = new BrowserWebSocketClientAdapter(`ws://${WEBSOCKET_HOST}:${WEBSOCKET_PORT}`);
      websocketRepo = new Repo({
        network: [adapter as any], // Type assertion to handle the interface mismatch
      });
      // wait for connection to establish
      await sleep(2000);
    }

    await runMemoryUsageTest(options);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }

  console.log('\nTest completed successfully!');
  process.exit(0);
}

main();
