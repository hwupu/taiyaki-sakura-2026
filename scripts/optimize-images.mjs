import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';

const INPUT_DIR = 'src/images';
const OUTPUT_DIR = 'public/images';

mkdirSync(OUTPUT_DIR, { recursive: true });

const files = readdirSync(INPUT_DIR).filter(f => /\.(png|jpe?g)$/i.test(f));

for (const file of files) {
  const stem = basename(file, extname(file));
  const input = join(INPUT_DIR, file);

  await sharp(input).avif({ quality: 75, effort: 8 }).toFile(join(OUTPUT_DIR, `${stem}.avif`));
  await sharp(input).webp({ quality: 80, effort: 6 }).toFile(join(OUTPUT_DIR, `${stem}.webp`));
  await sharp(input).png().toFile(join(OUTPUT_DIR, `${stem}.png`));

  console.log(`✓ ${file} → avif, webp, png`);
}
