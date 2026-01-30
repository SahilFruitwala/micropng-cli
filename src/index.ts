#!/usr/bin/env node
import { Command } from 'commander';
import glob from 'fast-glob';
import pLimit from 'p-limit';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import cliProgress from 'cli-progress';
import { compressImage } from './compressor.js';

const program = new Command();

program
  .name('micropng-cli')
  .description('High-performance CLI image compressor')
  .version('0.1.0')
  .argument('<input>', 'Input file or directory')
  .option('-o, --output <dir>', 'Output directory')
  .option('-r, --recursive', 'Process subfolders deeply')
  .option('--replace', 'Replace original files ONLY if compressed is smaller')
  .option('-q, --quality <number>', 'Compression quality (1-100)', '80')
  .option('-w, --width <number>', 'Resize width in pixels')
  .option('-f, --format <type>', 'Output format (jpeg, png, webp, avif)')
  .option('-c, --concurrency <number>', 'Number of concurrent tasks', '5')
  .action(async (input, options) => {
    try {
      const inputPath = path.resolve(input);
      const isDirectory = (await fs.stat(inputPath)).isDirectory();

      let searchPattern: string;
      if (isDirectory) {
        // fast-glob requires forward slashes even on Windows
        const normalizedInput = inputPath.replace(/\\/g, '/');
        searchPattern = options.recursive
          ? `${normalizedInput}/**/*.{jpg,jpeg,png,webp}`
          : `${normalizedInput}/*.{jpg,jpeg,png,webp}`;
      } else {
        searchPattern = inputPath.replace(/\\/g, '/');
      }

      const files = await glob(searchPattern, { absolute: true });

      if (files.length === 0) {
        console.log(chalk.yellow('No images found to process.'));
        return;
      }

      console.log(chalk.blue(`Found ${files.length} images. Processing...`));

      const progressBar = new cliProgress.SingleBar({
        format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Files || ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      progressBar.start(files.length, 0);

      const limit = pLimit(parseInt(options.concurrency));
      const quality = parseInt(options.quality);
      const width = options.width ? parseInt(options.width) : undefined;

      let totalSaved = 0;
      let totalOriginal = 0;
      let processedCount = 0;
      let failedCount = 0;

      const tasks = files.map((filePath) =>
        limit(async () => {
          try {
            let outputPath: string;
            if (options.replace) {
              outputPath = filePath;
            } else if (options.output) {
              const relativePath = isDirectory
                ? path.relative(inputPath, filePath)
                : path.basename(filePath);
              
              const baseDir = path.dirname(relativePath);
              const ext = path.extname(relativePath);
              const name = path.basename(relativePath, ext);
              const targetExt = options.format ? `.${options.format}` : ext;
              
              outputPath = path.join(path.resolve(options.output), baseDir, `${name}${targetExt}`);
            } else {
              // Default to same directory with '_compressed' suffix if not replacing and no output specified
              const ext = path.extname(filePath);
              const name = path.basename(filePath, ext);
              const dirname = path.dirname(filePath);
              const targetExt = options.format ? `.${options.format}` : ext;
              outputPath = path.join(dirname, `${name}_compressed${targetExt}`);
            }

            const result = await compressImage(filePath, outputPath, {
              quality,
              width,
              format: options.format,
              replace: options.replace,
            });

            totalSaved += result.saved;
            totalOriginal += result.inputSize;
            processedCount++;
          } catch (err: any) {
            failedCount++;
            // We don't want to break the progress bar with console.error here
            // but we might want to log it after the bar finishes
          } finally {
            progressBar.increment();
          }
        })
      );

      await Promise.all(tasks);
      progressBar.stop();

      console.log(chalk.bold.cyan('\nCompression complete!'));
      
      if (processedCount > 0) {
        const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
        const percentSaved = ((totalSaved / totalOriginal) * 100).toFixed(1);
        console.log(chalk.green(`✓ Successfully processed ${processedCount} images.`));
        console.log(chalk.green(`Total space saved: ${savedMB} MB (${percentSaved}%)`));
      }
      
      if (failedCount > 0) {
        console.log(chalk.red(`✗ Failed to process ${failedCount} images.`));
      }
    } catch (err: any) {
      console.error(chalk.red.bold(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
