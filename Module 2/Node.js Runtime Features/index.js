/**
 * Node.js Runtime Features — Streams, Buffers & the File System (REFERENCE SOLUTION)
 *
 * Reads the same file two ways:
 *   1) fs.readFile loads the WHOLE file into memory, then we log its byte size.
 *   2) A readable stream is piped to a writable stream, copying the file in
 *      small chunks so peak memory stays flat regardless of file size.
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'sample-data.txt');
const OUTPUT = path.join(__dirname, 'sample-copy.txt');

// ── PART 1: read the whole file into memory, then log its size ──────────────
function readWholeFile() {
  // No encoding → data is a Buffer (raw bytes). Buffer.length is the byte count.
  fs.readFile(INPUT, (err, data) => {
    if (err) {
      console.error('readFile error:', err.message);
      return;
    }
    console.log(`readFile: loaded ${data.length} bytes into memory at once`);
  });
}

// ── PART 2: stream the file and pipe it to a writable stream ────────────────
function streamFile() {
  const readable = fs.createReadStream(INPUT); // reads in ~64KB chunks
  const writable = fs.createWriteStream(OUTPUT);

  readable.on('error', (err) => console.error('read stream error:', err.message));
  writable.on('error', (err) => console.error('write stream error:', err.message));

  // pipe wires chunks from source to destination and handles backpressure.
  readable.pipe(writable);

  writable.on('finish', () => {
    console.log('stream: finished copying via 64KB chunks (peak memory stays flat)');
  });
}

// ── PART 3: explain the difference ──────────────────────────────────────────
// fs.readFile pulls the ENTIRE file into a single Buffer in memory, so the
// memory it needs equals the file size — a 2GB file needs ~2GB of RAM, and a
// burst of concurrent requests can crash the process. The stream approach reads
// and writes the file a small chunk at a time (about 64KB) and frees each chunk
// before the next, so peak memory stays flat no matter how large the file is.
// That is why streaming is the right tool for large files, uploads, downloads,
// and any payload too big to safely hold all at once.

readWholeFile();
streamFile();

module.exports = { readWholeFile, streamFile, INPUT, OUTPUT };
