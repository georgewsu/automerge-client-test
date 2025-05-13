# Automerge Client Test

## Overview
Test and benchmark Automerge performance with various options:
- Automerge library vs repo for document creation
- Local repo vs network connected repo
- Generated test data vs data read from file
- Number of iterations to run

## Prerequisites
- (optional) Automerge sync server running on localhost with websocket port 3030

## Usage
```bash
npm install
npm run client

# Run with specific options
npm run client -- --iterations 5 --dataSource generated --size 2 --repo websocket --useRawString true
```

### Command Line Options
- `-i, --iterations`: Number of test iterations (default: 10)
- `-d, --dataSource`: Source of test data ('file' or 'generated', default: 'generated')
- `-s, --size`: Size in MB for generated data (default: 1)
- `-r, --repo`: Repository type to use ('none', 'local', or 'websocket', default: 'none')
- `-u, --useRawString`: Convert strings to RawString (default: false)

### Examples

1. Test with local repository and file data:
```bash
npm run client -- -r local -d file
```

2. Test with WebSocket repository and generated data:
```bash
npm run client -- -r websocket -d generated -s 5
```

3. Test with RawString conversion:
```bash
npm run client -- -u true -i 3
```

4. Test with all options:
```bash
npm run client -- -i 25 -d generated -s 10 -r websocket -u true
```
