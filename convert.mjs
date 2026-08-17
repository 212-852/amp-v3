import { access, readdir, stat } from "node:fs/promises";
import { extname, join, parse, resolve } from "node:path";

import sharp from "sharp";

const supportedExtensions = new Set([".jpg", ".jpeg", ".png"]);
const argumentsList = process.argv.slice(2);
const force = argumentsList.includes("--force");
const qualityArgument = argumentsList.find((argument) =>
  argument.startsWith("--quality="),
);
const quality = Number(qualityArgument?.split("=")[1] ?? 82);
const inputPaths = argumentsList.filter((argument) =>
  !argument.startsWith("--"),
);

if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  throw new Error("画質は --quality=1〜100 の範囲で指定してください。");
}

if (inputPaths.length === 0) {
  console.log("使い方: npm run webp -- <画像またはフォルダ> [--quality=82] [--force]");
  process.exit(0);
}

async function collectImages(inputPath) {
  const absolutePath = resolve(inputPath);
  const inputStat = await stat(absolutePath);

  if (inputStat.isFile()) {
    return supportedExtensions.has(extname(absolutePath).toLowerCase())
      ? [absolutePath]
      : [];
  }

  if (!inputStat.isDirectory()) {
    return [];
  }

  const entries = await readdir(absolutePath, { withFileTypes: true });
  const nestedImages = await Promise.all(
    entries.map((entry) => collectImages(join(absolutePath, entry.name))),
  );

  return nestedImages.flat();
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function convertImage(inputPath) {
  const input = parse(inputPath);
  const outputPath = join(input.dir, `${input.name}.webp`);

  if (!force && (await fileExists(outputPath))) {
    console.log(`スキップ: ${outputPath}`);
    return;
  }

  await sharp(inputPath)
    .rotate()
    .webp({ quality, effort: 4 })
    .toFile(outputPath);

  console.log(`変換完了: ${outputPath}`);
}

const imageGroups = await Promise.all(inputPaths.map(collectImages));
const images = [...new Set(imageGroups.flat())];

if (images.length === 0) {
  console.log("変換できるJPG・JPEG・PNG画像が見つかりませんでした。");
  process.exit(0);
}

for (const imagePath of images) {
  await convertImage(imagePath);
}
