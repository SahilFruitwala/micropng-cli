Here is a complete design specification and documentation file for your CLI tool, typically named `README.md` or `SPECS.md`.

This design includes the specific logic for **recursive processing** and **in-place replacement (overwrite)** that you requested.

---

# `MicroPng` - High-Performance CLI Image Compressor

**MicroPng** is a lightning-fast, local CLI tool designed to compress and optimize images recursively across directories. It focuses on performance, privacy, and batch automation using the industrial-grade `libvips` engine.

## 1. Technical Specifications

- **Runtime Environment:** Node.js (Version 16.x or higher recommended).
- **Core Engine:** `sharp` (Powered by `libvips` C++ library).
- **Architecture:** Event-driven, non-blocking I/O.
- **Concurrency Model:** Thread-pool optimized with `p-limit` for CPU load management.
- **Module System:** ES Modules (preferred) or CommonJS.
- **Build Tool:** `tsup` (esbuild) for single-binary distribution.

## 2. Tools & Libraries Stack

| Library          | Purpose          | Justification                                                   |
| ---------------- | ---------------- | --------------------------------------------------------------- |
| **Sharp**        | Image Processing | 4x-5x faster than ImageMagick; manages memory efficiently.      |
| **Fast-Glob**    | File Discovery   | Extremely fast traversal of folders and subfolders (`**/*`).    |
| **Commander.js** | CLI Framework    | Robust argument parsing and flag management.                    |
| **Chalk**        | UI/UX            | Terminal coloring for success/error clarity.                    |
| **P-Limit**      | Performance      | Throttles concurrency to prevent CPU choking/Memory leaks.      |
| **Fs-Extra**     | File System      | Safer file operations (atomic moves) for the overwrite feature. |

## 3. Key Features

### A. Recursive Processing (Deep Search)

The tool automatically scans the provided folder **and all its subfolders** for image files. It preserves the directory structure if outputting to a new location.

- **Mechanism:** Uses `glob` patterns like `input_folder/**/*.jpg`.

### B. In-Place Replacement (Overwrite)

Allows the user to replace the original images with the compressed versions.

- **Safety Lock:** This feature is disabled by default. It requires the `--replace` or `--overwrite` flag.
- **Atomic Write:** To prevent data corruption (reading and writing the same file simultaneously), the tool writes to a `.tmp` file first, then performs an atomic rename operation.

### C. Smart Format Detection

- **Auto-Format:** Can keep the original format (Input `jpg` -> Output `jpg`).
- **Format Conversion:** Can bulk convert entire folder trees (Input `png` -> Output `webp`).

### D. Target Size Mode

Allows users to specify a maximum file size for compressed images.

- **Mechanism:** Uses an intelligent binary search algorithm to find the optimal quality level (1-100) that fits the image within the requested size limit while maintaining the highest possible visual quality.

## 4. Performance Strategy

1. **Concurrency Throttling:**
   We do not process files one-by-one (too slow) nor all-at-once (RAM crash). We use a **Worker Pool** strategy (default: 4-10 concurrent threads) to saturate the CPU without blocking the system.
2. **Libvips Cache Disabling:**
   `sharp.cache(false)` is set to ensure the tool releases memory immediately after processing a file, which is critical for batches larger than 1,000 images.
3. **Stream Pipelines:**
   Images are streamed rather than fully buffered into RAM whenever possible.

## 5. Security & Privacy

### Data Sovereignty (Local-First)

- **No Cloud Uploads:** All processing happens on the user's local machine CPU. No images are ever sent to an external server or API.
- **Offline Capable:** The tool works 100% without an internet connection after installation.

### File Safety

- **Atomic Operations:** The "Overwrite" feature uses atomic file system moves. If the compression fails halfway, the original file remains untouched. It never deletes the original until the new file is successfully verified.

---

## 6. Implementation Logic (Draft Code)

Below is the logic required to implement the **Recursive** and **Overwrite** features safely.

```typescript
// implementation-snippet.ts
import fs from 'fs-extra'; // specific for 'move' operations
import path from 'path';

// ... (imports from previous example)

program
  .option('-r, --recursive', 'Process subfolders deeply')
  .option('--replace', 'OVERWRITE original files (Caution!)')
  // ... other options

  .action(async (inputPath, options) => {

    // 1. Construct Glob Pattern for Recursion
    // If user points to a folder "photos/" and sets -r, we look for "photos/**/*.{jpg,png...}"
    let searchPattern = inputPath;
    const isDirectory = fs.statSync(inputPath).isDirectory();

    if (isDirectory) {
        // Match common image extensions recursively
        searchPattern = path.join(inputPath, options.recursive ? '**/*.{jpg,jpeg,png,webp}' : '*.{jpg,jpeg,png,webp}');
    }

    const files = await glob(searchPattern);
    const limit = pLimit(parseInt(options.concurrency));

    const tasks = files.map((filePath) =>
      limit(async () => {
        try {
          // Determine Output Path
          let finalOutputPath;

          if (options.replace) {
            // SAFE OVERWRITE LOGIC
            // We cannot write to the file while reading it.
            // 1. Create a temp file
            const tempPath = `${filePath}.tmp_${Date.now()}`;

            // 2. Perform compression to temp file
            await compressImage(filePath, tempPath, options);

            // 3. Move temp file to original path (Replace)
            await fs.move(tempPath, filePath, { overwrite: true });
            console.log(chalk.green(`Replaced: ${filePath}`));

          } else {
            // STANDARD OUTPUT LOGIC
            // Replicate folder structure in output dir
            const relativePath = path.relative(inputPath, filePath);
            finalOutputPath = path.join(options.output, relativePath);

            // Ensure dir exists
            await fs.ensureDir(path.dirname(finalOutputPath));

            await compressImage(filePath, finalOutputPath, options);
            console.log(chalk.green(`Saved: ${finalOutputPath}`));
          }

        } catch (error) {
          console.error(chalk.red(`Failed: ${filePath}`), error);
        }
      })
    );

    await Promise.all(tasks);
  });

async function compressImage(inPath, outPath, opts) {
    // Sharp logic here...
      .resize(opts.width ? parseInt(opts.width) : null)
      .jpeg({ quality: opts.quality }) // Example quality application
      .toFile(outPath);
}

```

## 7. User Usage Examples

### Scenario A: Standard Optimization

Compress all images in `assets`, save to `dist`, keep structure.

```bash
img-press ./assets --output ./dist --recursive

```

### Scenario B: The "Danger" Mode (Overwrite)

Compress all images in `user-uploads` and **replace them** to save server space.

```bash
img-press ./user-uploads --recursive --replace --quality 80

```

### Scenario C: Format Migration

Convert all PNGs in a folder structure to WebP.

```bash
img-press ./raw-images --recursive --format webp --output ./web-ready

```
