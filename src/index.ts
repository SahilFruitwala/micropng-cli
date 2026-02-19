#!/usr/bin/env node
import { Command } from "commander";
import glob from "fast-glob";
import pLimit from "p-limit";
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import cliProgress from "cli-progress";
import inquirer from "inquirer";
import { compressImage } from "./compressor.js";

const packageJson = fs.readJsonSync(
  new URL("../package.json", import.meta.url),
);

const program = new Command();

program
  .name("micropng-cli")
  .description("High-performance CLI image compressor")
  .version(packageJson.version)
  .argument("<input>", "Input file or directory")
  .option("-o, --output <dir>", "Output directory")
  .option("-r, --recursive", "Process subfolders deeply")
  .option("--replace", "Replace original files ONLY if compressed is smaller")
  .option("-q, --quality <number>", "Compression quality (1-100)", "80")

  .option("-f, --format <type>", "Output format (jpeg, png, webp, avif)")
  .option("-c, --concurrency <number>", "Number of concurrent tasks", "5")
  .option("-i, --ignore <patterns...>", "Ignore patterns (glob)")
  .option("-s, --size <string>", "Target size (e.g. 500kb, 1mb)")
  .option("--keep-metadata", "Keep image metadata (EXIF, etc.)", false)
  .action(async (input, options) => {
    try {
      // Interactive mode for choosing destination
      if (!options.output && !options.replace && process.stdin.isTTY) {
        console.log(chalk.bold.yellow("\n? No output destination specified."));
        const { choice } = await inquirer.prompt([
          {
            type: "list",
            name: "choice",
            message: "How would you like to save the compressed images?",
            choices: [
              {
                name: "📂 Choose a custom destination folder",
                value: "custom",
              },
              {
                name: "📝 Save in same directory (appends _compressed)",
                value: "suffix",
              },
              {
                name: "⚠️  Overwrite original files (Atomic safety enabled)",
                value: "replace",
              },
            ],
          },
        ]);

        if (choice === "replace") {
          const { confirmReplace } = await inquirer.prompt([
            {
              type: "confirm",
              name: "confirmReplace",
              message: "Are you sure you want to overwrite original files?",
              default: false,
            },
          ]);
          if (!confirmReplace) {
            console.log(
              chalk.dim("Action cancelled. Using default suffix mode."),
            );
          } else {
            options.replace = true;
          }
        } else if (choice === "custom") {
          const { outputDir } = await inquirer.prompt([
            {
              type: "input",
              name: "outputDir",
              message: "Enter destination folder path:",
              default: "./dist",
              validate: (input) =>
                input.trim() !== "" || "Please enter a valid path.",
            },
          ]);
          options.output = outputDir;
        }
      }

      const quality = parseInt(options.quality, 10);
      const concurrency = parseInt(options.concurrency, 10);
      if (Number.isNaN(quality) || quality < 1 || quality > 100) {
        console.error(
          chalk.red.bold(
            "Error: --quality must be a number between 1 and 100.",
          ),
        );
        process.exit(1);
      }
      if (Number.isNaN(concurrency) || concurrency < 1) {
        console.error(
          chalk.red.bold("Error: --concurrency must be a positive number."),
        );
        process.exit(1);
      }

      const targetSize = options.size ? parseSize(options.size) : undefined;
      if (options.size && targetSize === undefined) {
        console.error(
          chalk.red.bold(
            "Error: --size must be a valid size (e.g. 500kb, 1mb).",
          ),
        );
        process.exit(1);
      }

      const inputPath = path.resolve(input);
      const isDirectory = (await fs.stat(inputPath)).isDirectory();

      let searchPattern: string;
      if (isDirectory) {
        // fast-glob requires forward slashes even on Windows
        const normalizedInput = inputPath.replace(/\\/g, "/");
        searchPattern = options.recursive
          ? `${normalizedInput}/**/*.{jpg,jpeg,png,webp,avif}`
          : `${normalizedInput}/*.{jpg,jpeg,png,webp,avif}`;
      } else {
        searchPattern = inputPath.replace(/\\/g, "/");
      }

      console.log(chalk.bold.cyan(`Micropng v${packageJson.version}`));
      console.log(chalk.dim(`Scanning: ${inputPath}\n`));

      const files: string[] = [];
      const progressBar = new cliProgress.SingleBar(
        {
          format: "{bar} {percentage}% | {value}/{total} Files | {saved}MB",
          barCompleteChar: "\u2588",
          barIncompleteChar: "\u2591",
          hideCursor: true,
        },
        cliProgress.Presets.shades_grey,
      );

      let totalSaved = 0;
      let totalOriginal = 0;
      let processedCount = 0;
      let failedCount = 0;

      const limit = pLimit(concurrency);

      // Start the progress bar in indeterminate mode while scanning
      progressBar.start(0, 0, { file: "Scanning...", saved: "0.00" });

      const stream = glob.stream(searchPattern, {
        absolute: true,
        ignore: options.ignore,
      });
      const tasks: Promise<void>[] = [];

      for await (const entry of stream) {
        const filePath = entry.toString();
        files.push(filePath);

        // Update total as we find more files
        progressBar.setTotal(files.length);

        tasks.push(
          limit(async () => {
            try {
              let outputPath: string;
              if (options.replace) {
                outputPath = filePath;
              } else if (options.output) {
                // Single file input with output path that looks like a file → use as output file path
                const outputResolved = path.resolve(options.output);
                if (!isDirectory && path.extname(outputResolved) !== "") {
                  outputPath = outputResolved;
                } else {
                  const relativePath = isDirectory
                    ? path.relative(inputPath, filePath)
                    : path.basename(filePath);
                  const baseDir = path.dirname(relativePath);
                  const ext = path.extname(relativePath);
                  const name = path.basename(relativePath, ext);
                  const targetExt = options.format ? `.${options.format}` : ext;
                  outputPath = path.join(
                    outputResolved,
                    baseDir,
                    `${name}${targetExt}`,
                  );
                }
              } else {
                const ext = path.extname(filePath);
                const name = path.basename(filePath, ext);
                const dirname = path.dirname(filePath);
                const targetExt = options.format ? `.${options.format}` : ext;
                outputPath = path.join(
                  dirname,
                  `${name}_compressed${targetExt}`,
                );
              }

              const result = await compressImage(filePath, outputPath, {
                quality,
                format: options.format,
                replace: options.replace,
                keepMetadata: options.keepMetadata,
                targetSize,
              });

              totalSaved += result.saved;
              totalOriginal += result.inputSize;
              processedCount++;

              const savingPercent =
                result.inputSize > 0
                  ? ((result.saved / result.inputSize) * 100).toFixed(1)
                  : "0.0";
              const fileName = path.basename(filePath);

              // Print file progress above the bar
              progressBar.stop();
              const sizeInfo = `${formatSize(result.inputSize)} -> ${formatSize(result.outputSize)}`;
              console.log(
                chalk.green("  ✓ ") +
                  chalk.white(fileName.padEnd(25)) +
                  chalk.dim(` ${sizeInfo} | saved ${savingPercent}%`),
              );
              progressBar.start(files.length, processedCount, {
                saved: (totalSaved / (1024 * 1024)).toFixed(2),
              });
            } catch (err: any) {
              failedCount++;
              progressBar.stop();
              console.log(
                chalk.red("  ✗ ") + chalk.white(path.basename(filePath)),
              );
              progressBar.start(files.length, processedCount, {
                saved: (totalSaved / (1024 * 1024)).toFixed(2),
              });
            }
          }),
        );
      }

      if (files.length === 0) {
        progressBar.stop();
        console.log(chalk.yellow("No images found to process."));
        return;
      }

      await Promise.all(tasks);
      progressBar.stop();

      console.log(chalk.bold.cyan("\nCompression complete!"));

      if (processedCount > 0) {
        const savedSizeFormatted = formatSize(totalSaved);
        const percentSaved =
          totalOriginal > 0
            ? ((totalSaved / totalOriginal) * 100).toFixed(1)
            : "0.0";
        console.log(
          chalk.green(`✓ Successfully processed ${processedCount} images.`),
        );
        console.log(
          chalk.green(`Total space saved: ${savedSizeFormatted} (${percentSaved}%)`),
        );
      }

      if (failedCount > 0) {
        console.log(chalk.red(`✗ Failed to process ${failedCount} images.`));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red.bold(`Error: ${message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);

function parseSize(sizeStr: string): number | undefined {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
  if (!match) return undefined;

  const value = parseFloat(match[1]);
  const unit = (match[2] || "b").toLowerCase();

  switch (unit) {
    case "k":
    case "kb":
      return value * 1024;
    case "m":
    case "mb":
      return value * 1024 * 1024;
    case "g":
    case "gb":
      return value * 1024 * 1024 * 1024;
    default:
      return value;
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

