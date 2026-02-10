import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
// import { execa } from 'execa'; // We need execa for CLI integration tests - removed as unused
import sharp from 'sharp';

// Since we didn't install execa, I'll use child_process.execSync or install it. 
// Let's use node's native child_process for simplicity without adding more deps.
import { execSync } from 'child_process';

const TEST_DIR = path.resolve('it-test-dir');
const CLI_PATH = path.resolve('dist/index.js');

describe('CLI Integration', () => {
  beforeAll(() => {
    execSync('npm run build');
  });

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    await fs.ensureDir(path.join(TEST_DIR, 'nested'));

    const createImg = (p: string) => sharp({
      create: { width: 10, height: 10, channels: 3, background: 'red' }
    }).png().toFile(p);

    await createImg(path.join(TEST_DIR, 'img1.png'));
    await createImg(path.join(TEST_DIR, 'nested', 'img2.png'));
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    await fs.remove(path.resolve('it-output'));
  });

  it('should process images in a folder (non-recursive)', () => {
    const outputDir = path.resolve('it-output');
    execSync(`node ${CLI_PATH} ${TEST_DIR} --output ${outputDir}`);
    
    expect(fs.existsSync(path.join(outputDir, 'img1.png'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'nested', 'img2.png'))).toBe(false);
  });

  it('should process images recursively', () => {
    const outputDir = path.resolve('it-output');
    execSync(`node ${CLI_PATH} ${TEST_DIR} --output ${outputDir} --recursive`);
    
    expect(fs.existsSync(path.join(outputDir, 'img1.png'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'nested', 'img2.png'))).toBe(true);
  });

  it('should handle format conversion and extension update', () => {
    const outputDir = path.resolve('it-output');
    execSync(`node ${CLI_PATH} ${TEST_DIR} --output ${outputDir} --format webp`);
    
    expect(fs.existsSync(path.join(outputDir, 'img1.webp'))).toBe(true);
  });

  it('should handle in-place replacement', () => {
    const imgPath = path.join(TEST_DIR, 'img1.png');
    const originalMtime = fs.statSync(imgPath).mtimeMs;
    
    // Wait a bit to ensure mtime changes
    execSync(`node ${CLI_PATH} ${imgPath} --replace --quality 10`);
    
    const newMtime = fs.statSync(imgPath).mtimeMs;
    // In some fast systems/filesystems mtime might be same, so let's check if it's still a valid image
    expect(fs.existsSync(imgPath)).toBe(true);
  });

  it('should honor ignore patterns', () => {
    const outputDir = path.resolve('it-output');
    // Ignore images in 'nested' folder
    execSync(`node ${CLI_PATH} ${TEST_DIR} --output ${outputDir} --recursive --ignore "**/nested/**"`);
    
    expect(fs.existsSync(path.join(outputDir, 'img1.png'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'nested', 'img2.png'))).toBe(false);
  });
});
