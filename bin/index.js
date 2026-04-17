#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';
import { mkdir, access, readFile, writeFile, readdir } from 'fs/promises';
import sharp from 'sharp';
import { Command } from 'commander';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const DEFAULT_QUALITY = 80;

const error = (msg) => console.error(pc.red(`Error: ${msg}`));
const success = (msg) => console.log(pc.green(msg));
const info = (msg) => console.log(pc.blue(msg));

function validateInput(filePath) {
  if (!filePath) {
    throw new Error('Input file path is required');
  }

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stat = statSync(filePath);
  if (!stat.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
  if (!VALID_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file extension. Supported: ${VALID_EXTENSIONS.join(', ')}`);
  }

  return ext;
}

async function convertToWebP(inputPath, quality = DEFAULT_QUALITY) {
  const dir = resolve(inputPath, '..');
  const baseName = inputPath.slice(inputPath.lastIndexOf('\\') + 1, inputPath.lastIndexOf('.'));
  const outputPath = resolve(dir, `${baseName}.webp`);

  try {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);

    return outputPath;
  } catch (err) {
    throw new Error(`Conversion failed: ${err.message}`);
  }
}

async function convertDirectory(dirPath, quality = DEFAULT_QUALITY) {
  if (!existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const stat = statSync(dirPath);
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }

  const files = await readdir(dirPath);
  const imageFiles = files.filter(file => {
    const ext = file.toLowerCase().slice(file.lastIndexOf('.'));
    return VALID_EXTENSIONS.includes(ext);
  });

  if (imageFiles.length === 0) {
    throw new Error('No supported image files found in directory');
  }

  const results = [];
  for (const file of imageFiles) {
    const inputPath = resolve(dirPath, file);
    try {
      const outputPath = await convertToWebP(inputPath, quality);
      results.push({ input: file, output: outputPath, success: true });
      success(`Converted: ${file} -> ${outputPath}`);
    } catch (err) {
      results.push({ input: file, output: null, success: false, error: err.message });
      error(`Failed to convert ${file}: ${err.message}`);
    }
  }

  return results;
}

const program = new Command();

program
  .name('images-to-webp-cli')
  .description('Convert images to WebP format')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert image(s) to WebP format')
  .argument('<path>', 'Path to image file or directory')
  .option('-q, --quality <number>', 'WebP quality (1-100)', DEFAULT_QUALITY.toString())
  .action(async (path, options) => {
    try {
      const quality = Math.min(100, Math.max(1, parseInt(options.quality)));

      if (isNaN(quality) || quality < 1 || quality > 100) {
        throw new Error('Quality must be between 1 and 100');
      }

      const stat = statSync(path);

      if (stat.isDirectory()) {
        info(`Converting images in directory: ${path}`);
        const results = await convertDirectory(path, quality);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        console.log(`\nSummary: ${successful} converted, ${failed} failed`);
      } else {
        const ext = validateInput(path);
        info(`Converting: ${path}`);

        const outputPath = await convertToWebP(path, quality);
        success(`Saved: ${outputPath}`);
      }
    } catch (err) {
      error(err.message);
      process.exit(1);
    }
  });

program.parse();