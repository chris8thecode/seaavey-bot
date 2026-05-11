/**
 * @module convert
 * @description Image/video to sticker converter using ffmpeg
 */

import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface StickerOptions {
  pack?: string;
  author?: string;
}

/**
 * Convert image buffer to WebP sticker
 */
export function imageToSticker(buffer: Buffer, opts: StickerOptions = {}): Buffer {
  const tmp = mkdtempSync(join(tmpdir(), "sticker-"));
  const input = join(tmp, "input");
  const output = join(tmp, "output.webp");

  try {
    writeFileSync(input, buffer);
    execSync(
      `ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -vcodec libwebp -quality 80 ${output}`,
      { stdio: "ignore" },
    );
    const webp = readFileSync(output);
    return addExif(webp, opts.pack || "SeaaveyBot", opts.author || "Seaavey");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Convert video buffer to animated WebP sticker (max 10s)
 */
export function videoToSticker(buffer: Buffer, opts: StickerOptions = {}): Buffer {
  const tmp = mkdtempSync(join(tmpdir(), "sticker-"));
  const input = join(tmp, "input.mp4");
  const output = join(tmp, "output.webp");

  try {
    writeFileSync(input, buffer);
    execSync(
      `ffmpeg -i ${input} -t 10 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15" -vcodec libwebp -loop 0 -preset default -an -vsync 0 -quality 50 ${output}`,
      { stdio: "ignore" },
    );
    const webp = readFileSync(output);
    return addExif(webp, opts.pack || "SeaaveyBot", opts.author || "Seaavey");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Convert video/audio buffer to MP3
 */
export function toMp3(buffer: Buffer): Buffer {
  const tmp = mkdtempSync(join(tmpdir(), "audio-"));
  const input = join(tmp, "input");
  const output = join(tmp, "output.mp3");

  try {
    writeFileSync(input, buffer);
    execSync(`ffmpeg -i ${input} -vn -ar 44100 -ac 2 -b:a 128k ${output}`, {
      stdio: "ignore",
    });
    return readFileSync(output);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Add EXIF metadata (pack name & author) to WebP sticker
 */
function addExif(webp: Buffer, pack: string, author: string): Buffer {
  const json = JSON.stringify({
    "sticker-pack-id": "seaaveybot",
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author,
    emojis: ["✨"],
  });

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuf = Buffer.from(json, "utf-8");
  exifAttr.writeUIntLE(jsonBuf.length, 14, 4);
  const exif = Buffer.concat([exifAttr, jsonBuf]);

  if (webp.slice(0, 4).toString() !== "RIFF") return webp;
  if (webp.includes(Buffer.from("EXIF"))) return webp;

  const chunk = Buffer.concat([Buffer.from("EXIF"), Buffer.alloc(4), exif]);
  chunk.writeUInt32LE(exif.length, 4);

  const result = Buffer.concat([webp, chunk]);
  result.writeUInt32LE(result.length - 8, 4);
  return result;
}
