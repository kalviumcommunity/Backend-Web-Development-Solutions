# Reference Solution — Node Runtime: Streams & File System (Mentors Only)

> **Mentors only.** Reference implementation for the LU "Node.js Runtime Features —
> Streams, Buffers & the File System" assignment. Do not share with students.

## What the assignment asks

Students move the **same file two ways** and explain the difference:

1. `readWholeFile()` — read `sample-data.txt` with `fs.readFile` and log its byte size.
2. `streamFile()` — pipe a read stream into a write stream to copy the file in chunks.
3. A short, in-their-own-words comment on why streaming beats `readFile` for large files.

## Files here

```
solution/
  index.js          ← reference implementation of both functions + PART 3 explanation
  package.json      ← "npm start" script (no external dependencies)
  sample-data.txt   ← the large sample input
```

## Run it

```bash
npm start
```

Expected: a `readFile` byte-size line, a `stream` finished line, and a new
`sample-copy.txt` created next to `index.js`.

## Key teaching points

- **No encoding → Buffer.** `fs.readFile(INPUT, cb)` with no encoding gives a `Buffer`;
  `Buffer.length` is the byte count.
- **`.pipe()` does the work.** `createReadStream(INPUT).pipe(createWriteStream(OUTPUT))`
  streams in ~64 KB chunks and handles backpressure; log on the writable's `'finish'`.
- **The core idea:** `readFile` holds the whole file in memory (memory ≈ file size), while
  a stream moves it chunk by chunk so **peak memory stays flat** regardless of file size.
- **Paths:** use the provided `path.join(__dirname, ...)` values — no string concatenation.

## Grading

Evaluate the **code in the PR** against the assignment rubric (from the course bundle, not
this repo; 10 marks). Accept any correct stream wiring and a genuine, in-their-own-words
explanation. The PR description is not graded.

Common gaps: logging file size before/without the Buffer, missing the `'finish'` handler,
hand-built paths, or a copied-not-written PART 3 explanation.
