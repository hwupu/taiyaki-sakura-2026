import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join, relative, dirname, basename, extname } from "path";

const INPUT_DIR = "src/images";
const OUTPUT_DIR = "public/images";

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

for (const input of walk(INPUT_DIR)) {
  const rel = relative(INPUT_DIR, input);
  const stem = basename(rel, extname(rel));
  const outDir = join(OUTPUT_DIR, dirname(rel));

  mkdirSync(outDir, { recursive: true });

  await sharp(input).avif({ quality: 75, effort: 8 }).toFile(join(outDir, `${stem}.avif`));
  await sharp(input).webp({ quality: 80, effort: 6 }).toFile(join(outDir, `${stem}.webp`));
  await sharp(input).png().toFile(join(outDir, `${stem}.png`));

  console.log(`✓ ${rel} → avif, webp, png`);
}
