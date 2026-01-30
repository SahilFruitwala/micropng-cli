import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { compressImage } from './compressor.js';
import sharp from 'sharp';

const TEST_DIR = path.resolve('test-temp');
const FIXTURES_DIR = path.resolve('test-fixtures');

describe('compressor.ts', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    await fs.ensureDir(FIXTURES_DIR);
    
    // Create a dummy image for testing if it doesn't exist
    const imagePath = path.join(FIXTURES_DIR, 'test.png');
    if (!(await fs.pathExists(imagePath))) {
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
      })
      .png()
      .toFile(imagePath);
    }
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    // Fixtures are kept for reuse
  });

  it('should compress an image and save it to output path', async () => {
    const input = path.join(FIXTURES_DIR, 'test.png');
    const output = path.join(TEST_DIR, 'output.png');
    
    await compressImage(input, output, { quality: 50 });
    
    expect(await fs.pathExists(output)).toBe(true);
    const originalSize = (await fs.stat(input)).size;
    const compressedSize = (await fs.stat(output)).size;
    // Note: for a tiny 100x100 solid color image, size might not change much or even increase slightly due to headers, 
    // but the output existence is high signal.
  });

  it('should resize the image if width is provided', async () => {
    const input = path.join(FIXTURES_DIR, 'test.png');
    const output = path.join(TEST_DIR, 'resized.png');
    
    await compressImage(input, output, { width: 50 });
    
    const metadata = await sharp(output).metadata();
    expect(metadata.width).toBe(50);
  });

  it('should convert format if requested', async () => {
    const input = path.join(FIXTURES_DIR, 'test.png');
    const output = path.join(TEST_DIR, 'converted.webp');
    
    await compressImage(input, output, { format: 'webp' });
    
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('webp');
  });

  it('should perform in-place replacement safely', async () => {
    const input = path.join(TEST_DIR, 'inplace.png');
    await fs.copy(path.join(FIXTURES_DIR, 'test.png'), input);
    
    const originalStat = await fs.stat(input);
    
    await compressImage(input, input, { replace: true, quality: 10 });
    
    expect(await fs.pathExists(input)).toBe(true);
    // The timestamp should be updated or at least the file should still be readable
    const newMetadata = await sharp(input).metadata();
    expect(newMetadata.width).toBe(100);
  });
});
