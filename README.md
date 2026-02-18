# MicroPng CLI

A high-performance, local-first CLI image compressor built with Node.js and libvips (via `sharp`). Designed for developers who need fast, reliable, and recursive image optimization without sending data to a cloud service.

[![npm version](https://img.shields.io/npm/v/micropng-cli.svg)](https://www.npmjs.com/package/micropng-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

- **Blazing Fast**: Uses parallel processing with smart concurrency control to saturate your CPU without crashing.
- **Deeply Recursive**: Scans folders and subfolders, maintaining your directory structure perfectly.
- **Safety First**: Implements atomic overwrites using the `--replace` flag—original files are only replaced if the compressed version is actually smaller.
- **Universal Formats**: Full support for JPEG, PNG, WebP, and AVIF conversion and compression.
- **Local-First**: No data ever leaves your machine. Your privacy is guaranteed.
- **Smarter Scanning**: Native support for ignore patterns to skip `node_modules`, `.git`, or specific assets.
- **Metadata Control**: Choose whether to strip or keep EXIF information (GPS, camera settings, etc.).
- **Interactive Mode**: Automatically guides you through destination selection if flags are missing.

## 📦 Installation

### Global Installation

Install it once and use the `micropng-cli` command anywhere:

```bash
npm install -g micropng-cli
```

### Homebrew Installation (macOS & Linux)

If you prefer Homebrew, you can install it via:

```bash
brew install SahilFruitwala/tap/micropng-cli
```

### Run without Installation

Use `npx` to run it instantly without cluttering your system:

```bash
npx micropng-cli --help
```

---

## 🛠 Usage Examples

### 1. Basic Compression

Compress a single file and save it as a new file:

```bash
micropng-cli input.png --output optimized.png
```

### 2. High-Performance Bulk Processing

Optimize an entire directory and maintain the structure in an output folder:

```bash
micropng-cli ./raw-assets --output ./dist/assets --recursive
```

### 3. Safe In-Place Replacement

The most popular way to use MicroPng. This will search through your project and optimize all images, replacing them **only if** size is saved:

```bash
micropng-cli ./src --recursive --replace --quality 85
```

### 4. Advanced: Modern Web Formats

Convert all images in a folder to WebP for modern web performance:

```bash
micropng-cli ./images --format webp --output ./webp-bundle --recursive
```

### 5. Advanced: Complex Ignores

Ignore specific directories or patterns while processing:

```bash
micropng-cli . --recursive --replace --ignore "node_modules/**" "**/previews/**" "*.tmp"
```

### 6. Advanced: Performance & Metadata

Tune concurrency for massive datasets or keep photographic memories intact:

```bash
micropng-cli ./photos --keep-metadata --concurrency 20 --recursive
```

### 7. Guided Setup (Interactive)

Don't want to remember flags? Just point to a folder and MicroPng will guide you:

```bash
micropng-cli ./my-assets
```

_This will open an interactive menu to choose between custom output, suffix mode, or safe overwrite._

---

## ⚙️ Options

| Option              | Alias | Description                                                                                                       | Default       |
| :------------------ | :---- | :---------------------------------------------------------------------------------------------------------------- | :------------ |
| `--output <dir>`    | `-o`  | Target directory for compressed files; for a single file input, can be an output file path (e.g. `optimized.png`) | (Current Dir) |
| `--recursive`       | `-r`  | Deep scan folders and subfolders                                                                                  | `false`       |
| `--replace`         |       | Replace originals (Atomic safety enabled)                                                                         | `false`       |
| `--quality <n>`     | `-q`  | Compression quality (1-100)                                                                                       | `80`          |
| `--format <type>`   | `-f`  | Output format (jpeg, png, webp, avif)                                                                             | (Source Ext)  |
| `--concurrency <n>` | `-c`  | Max simultaneous tasks                                                                                            | `5`           |
| `--ignore <glob>`   | `-i`  | Patterns to exclude (supports multiple)                                                                           | -             |
| `--keep-metadata`   |       | Preserves EXIF/GPS/IPTC data                                                                                      | `false`       |

---

## 📖 Additional Docs

- **[Changelog](./CHANGELOG.md)**: See what's new in each version.
- **[Contributing](./CONTRIBUTING.md)**: Learn how to set up the dev environment and add new features.
- **[Distribution](./DISTRIBUTION.md)**: Details on the build and release pipeline.

## ⚖️ License

MIT © Sahil Fruitwala
