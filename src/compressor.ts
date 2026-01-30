import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface CompressionOptions {
  quality?: number;

  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  replace?: boolean;
}

export interface CompressionResult {
  inputSize: number;
  outputSize: number;
  saved: number;
  replaced: boolean;
}

export async function compressImage(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { quality = 80, format } = options;

  const inputStats = await fs.stat(inputPath);
  const inputSize = inputStats.size;

  let pipeline = sharp(inputPath);



  // Determine target format
  const ext = path.extname(inputPath).toLowerCase();
  const targetFormat = format || (ext.slice(1) as any);

  if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (targetFormat === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else if (targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else if (targetFormat === 'avif') {
    pipeline = pipeline.avif({ quality });
  }

  // Handle in-place replacement safety
  const finalOutputPath = options.replace ? `${inputPath}.tmp_${Date.now()}` : outputPath;

  try {
    await fs.ensureDir(path.dirname(finalOutputPath));
    const info = await pipeline.toFile(finalOutputPath);
    const outputSize = info.size;
    let replaced = false;

    if (options.replace) {
      if (outputSize < inputSize) {
        await fs.move(finalOutputPath, inputPath, { overwrite: true });
        replaced = true;
      } else {
        await fs.remove(finalOutputPath);
        replaced = false;
      }
    } else {
      replaced = true;
    }

    return {
      inputSize,
      outputSize,
      saved: Math.max(0, inputSize - outputSize),
      replaced,
    };
  } catch (error) {
    if (options.replace && (await fs.pathExists(finalOutputPath))) {
      await fs.remove(finalOutputPath);
    }
    throw error;
  }
}
