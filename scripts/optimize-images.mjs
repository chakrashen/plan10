/**
 * Image Optimization Script for Plan10
 * Converts heavy PNG images to optimized WebP format
 * Reduces ~30MB of images to ~3-4MB total
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const imagesToConvert = [
  'image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png', 'image6.png',
  'image7.png', 'image8.png', 'image9.png', 'image10.png',
  'image11.png', 'image12.png',
  'image13.png', 'image14.png', 'iamge15.png', 'image16.png',
  'Screenshot 2026-05-31 153635.png',
  'Screenshot 2026-05-31 153654.png',
  'Screenshot 2026-05-31 153722.png',
  'Screenshot 2026-05-31 153733.png',
];

async function optimizeImages() {
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imagesToConvert) {
    const inputPath = path.join(publicDir, file);
    if (!fs.existsSync(inputPath)) {
      console.log(`⏭️  Skipping (not found): ${file}`);
      continue;
    }

    const outputName = file.replace('.png', '.webp');
    const outputPath = path.join(publicDir, outputName);

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    try {
      await sharp(inputPath)
        .webp({ quality: 82, effort: 6 })
        .toFile(outputPath);

      const newSize = fs.statSync(outputPath).size;
      totalOptimized += newSize;
      const savedPercent = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✅ ${file} → ${outputName}  (${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB, saved ${savedPercent}%)`);
    } catch (err) {
      console.error(`❌ Failed to convert ${file}:`, err.message);
    }
  }

  console.log(`\n📊 Total: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalOptimized / 1024 / 1024).toFixed(1)}MB (saved ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
}

optimizeImages();
