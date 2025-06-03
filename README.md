# Automerge Client Test

## Overview
Test and benchmark Automerge memory usage with various options:
- Automerge library vs repo for document creation
- Local repo vs network connected repo
- Generated test data vs data read from file
- Number of iterations to run
- Convert strings to RawString
- Test cache eviction
- Generate flamegraph or heapdump snapshots

## Prerequisites
- pnpm
- node
- (optional) Automerge sync server running on localhost with websocket port 3030

## Setup
Create dist directory and download test data if needed (1MB sample)
```bash
mkdir -p dist && [ ! -f dist/data.json ] && curl -o dist/data.json https://microsoftedge.github.io/Demos/json-dummy-data/1MB.json
```
Create dist directory and download test data if needed (10MB sample)
```bash
mkdir -p dist && [ ! -f dist/data.json ] && curl -o dist/data.json https://raw.githubusercontent.com/TheProfs/socket-mem-leak/refs/heads/master/10mb-sample.json
```

## Usage
```bash
pnpm install
```
```bash
pnpm client
```
Run with specific options
```bash
pnpm client --iterations 5 --dataSource generated --size .5 --repo local --useRawString true
```
Run and generate flamegraph
```bash
pnpm flamegraph --iterations 5 --dataSource generated --size .5 --repo local --useRawString true
```

### Command Line Options
- `-i, --iterations`: Number of test iterations (default: 10)
- `-d, --dataSource`: Source of test data ('file' or 'generated', default: 'generated')
- `-s, --size`: Size in MB for generated data (default: 1)
- `-r, --repo`: Repository type to use ('none', 'local', or 'websocket', default: 'none')
- `-u, --useRawString`: Convert strings to RawString (default: false)
- `-c, --removeFromCache`: Trigger cache eviction to remove document from local repo cache (default: false)
- `-p, --heapdump`: Trigger heapdump and generate snapshot files (default: false)

### Examples

1. Test with automerge only (no repository) and generated data:
```bash
pnpm client -i 10 -d generated -s 0.1 -r none -u false
```

2. Test with local repository and generated data:
```bash
pnpm client -i 10 -d generated -s 0.1 -r local -u false
```

3. Test with WebSocket repository and data file, convert to RawString:
```bash
mkdir -p dist && curl -o dist/data.json https://microsoftedge.github.io/Demos/json-dummy-data/1MB.json
```
```bash
pnpm client -i 5 -d file -r websocket -u true
```

4. Compare memory usage with and without using RawString:
```bash
pnpm client -i 25 -d generated -s 10 -r local -u true
```
```bash
pnpm client -i 10 -d generated -s 10 -r local -u false
```

5. Reproduce crash using data file:
```bash
mkdir -p dist && curl -o dist/data.json https://raw.githubusercontent.com/TheProfs/socket-mem-leak/refs/heads/master/10mb-sample.json
```
```bash
pnpm client -i 5 -d file -r local -u false
```

6. Generate flamegraph and heapdump snapshot files
```bash
pnpm flamegraph -p true
```

7. Trigger cache eviction to remove documents from local repo cache
```bash
pnpm client -i 25 -r local -s 1 -c true
```
