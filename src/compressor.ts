import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Release memory after each file; critical for large batches (e.g. 1000+ images)
sharp.cache(false);

export interface CompressionOptions {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  replace?: boolean;
  keepMetadata?: boolean;
  targetSize?: number;
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
  const { quality: defaultQuality = 80, format, keepMetadata, targetSize } = options;

  const inputStats = await fs.stat(inputPath);
  const inputSize = inputStats.size;

  let basePipeline = sharp(inputPath);
  if (keepMetadata) {
    basePipeline = basePipeline.withMetadata();
  }

  // Determine target format
  const ext = path.extname(inputPath).toLowerCase();
  const targetFormat = format || (ext.slice(1) as any);

  const getCompressedBuffer = async (q: number) => {
    let pipeline = basePipeline.clone();
    if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
    } else if (targetFormat === 'png') {
      pipeline = pipeline.png({ quality: q, compressionLevel: 9, palette: true });
    } else if (targetFormat === 'webp') {
      pipeline = pipeline.webp({ quality: q });
    } else if (targetFormat === 'avif') {
      pipeline = pipeline.avif({ quality: q });
    }
    return pipeline.toBuffer();
  };

  let finalBuffer: Buffer;
  let finalQuality = defaultQuality;

  if (targetSize && targetSize > 0) {
    let minQ = 1;
    let maxQ = 100;
    let bestQ = 1;
    let minSizeVal = Infinity;
    let minSizeQ = 1;

    while (minQ <= maxQ) {
      const midQ = Math.floor((minQ + maxQ) / 2);
      const buf = await getCompressedBuffer(midQ);
      const size = buf.length;

      if (size < minSizeVal) {
        minSizeVal = size;
        minSizeQ = midQ;
      }

      if (size <= targetSize) {
        bestQ = midQ;
        minQ = midQ + 1;
      } else {
        maxQ = midQ - 1;
      }
    }
    finalQuality = bestQ || minSizeQ;
    finalBuffer = await getCompressedBuffer(finalQuality);
  } else {
    finalBuffer = await getCompressedBuffer(defaultQuality);
  }

  const outputSize = finalBuffer.length;

  // Handle in-place replacement safety
  const finalOutputPath = options.replace ? `${inputPath}.tmp_${Date.now()}` : outputPath;

  try {
    await fs.ensureDir(path.dirname(finalOutputPath));
    await fs.writeFile(finalOutputPath, finalBuffer);
    
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
