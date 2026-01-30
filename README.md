# MicroPng CLI

A high-performance, local-first CLI image compressor built with Node.js and libvips (via `sharp`). Supports recursive processing, atomic overwrites, and format conversion.

[![npm version](https://img.shields.io/npm/v/micropng-cli.svg)](https://www.npmjs.com/package/micropng-cli)
[![Build Status](https://github.com/SahilFruitwala/micropng-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/SahilFruitwala/micropng-cli/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Fast**: Parallel processing with smart concurrency control.
- 📂 **Recursive**: Deeply scans folders and subfolders.
- 🔄 **Safe Overwrite**: Atomic replacements to prevent data loss.
- 🖼️ **Multi-Format**: Supports JPEG, PNG, WebP, AVIF.
- 🔒 **Local-First**: No data leaves your machine.

## Installation

### For Users

You can run **MicroPng** directly without installation using `npx`:

```bash
npx micropng-cli --help
```

Or install it globally to use the `micropng` command anywhere:

```bash
npm install -g micropng-cli
```

### For Developers

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development setup.

## Usage

### Basic Usage

Compress a single file:

```bash
micropng-cli input.png --output compressed.png
```

Compress a directory of images:

```bash
micropng-cli ./images --output ./compressed-images
```

### Recursive Processing

Process all images in a folder and its subfolders, maintaining the directory structure:

```bash
micropng-cli ./photos --recursive --output ./optimized-photos
```

### In-Place Replacement (Overwrite)

⚠️ **Warning**: This will replace your original files!

Compress and overwrite images in-place safely:

```bash
micropng-cli ./project-assets --recursive --replace
```

### Format Conversion

Convert all PNGs to WebP:

```bash
micropng-cli ./images --format webp --output ./webp-images --recursive
```

### Options

| Option | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--output <dir>` | `-o` | Output directory | (Current dir) |
| `--recursive` | `-r` | Process subfolders deeply | `false` |
| `--replace` | | Overwrite original files | `false` |
| `--quality <number>` | `-q` | Compression quality (1-100) | `80` |
| `--width <number>` | `-w` | Resize width in pixels | (Original) |
| `--format <type>` | `-f` | Output format (jpeg, png, webp, avif) | (Original) |
| `--concurrency <number>` | `-c` | Number of concurrent tasks | `5` |

## Documentation

-   [Contributing Guide](./CONTRIBUTING.md): Setup local dev environment and run tests.
-   [Distribution Guide](./DISTRIBUTION.md): How to publish and release this package.

## License

MIT
