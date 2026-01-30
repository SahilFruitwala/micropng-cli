import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface CompressionOptions {
  quality?: number;
  width?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  replace?: boolean;
}

export async function compressImage(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions
): Promise<void> {
  const { quality = 80, width, format } = options;

  let pipeline = sharp(inputPath);

  if (width) {
    pipeline = pipeline.resize(width);
  }

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
    await pipeline.toFile(finalOutputPath);

    if (options.replace) {
      await fs.move(finalOutputPath, inputPath, { overwrite: true });
    }
  } catch (error) {
    if (options.replace && (await fs.pathExists(finalOutputPath))) {
      await fs.remove(finalOutputPath);
    }
    throw error;
  }
}
