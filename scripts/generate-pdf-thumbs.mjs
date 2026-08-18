/**
 * Pre-renders page 1 of every work-sample PDF into a small WebP.
 *
 * The work-sample grid used to mount a react-pdf <Document> per card, which
 * meant the browser downloaded every source PDF (~19-38MB) just to paint
 * thumbnails a couple of hundred pixels wide. These pre-rendered files are
 * a few dozen KB each instead.
 *
 * Run with:  npm run thumbs
 */
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { readdir, mkdir, writeFile, stat, readFile } from "node:fs/promises";
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "public", "work-samples");
const OUT_DIR = join(SOURCE_DIR, "thumbs");
const WIDTH = 600;   // cards render ~250-530px wide; 600 covers retina
const QUALITY = 82;

async function findPdfs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "thumbs") continue;
      out.push(...(await findPdfs(full)));
    } else if (extname(entry.name).toLowerCase() === ".pdf") {
      out.push(full);
    }
  }
  return out;
}

// mirrors the public URL path so a thumb is findable from the pdf's url
function thumbNameFor(pdfPath) {
  const rel = relative(SOURCE_DIR, pdfPath).replace(/\\/g, "/");
  return rel.replace(/\.pdf$/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".webp";
}

// point pdf.js at its bundled fonts/cmaps, otherwise embedded-font PDFs fall
// back and some glyphs render wrong
const PDFJS_ROOT = join(ROOT, "node_modules", "pdfjs-dist");
const STANDARD_FONTS = join(PDFJS_ROOT, "standard_fonts") + "/";
const CMAPS = join(PDFJS_ROOT, "cmaps") + "/";

async function renderFirstPage(pdfPath) {
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    standardFontDataUrl: STANDARD_FONTS,
    cMapUrl: CMAPS,
    cMapPacked: true,
  }).promise;
  const page = await doc.getPage(1);

  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: WIDTH / base.width });

  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  // PDFs assume white paper; without this, transparent areas render black
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  await doc.destroy();
  return canvas.encode("webp", QUALITY);
}

const pdfs = await findPdfs(SOURCE_DIR);
await mkdir(OUT_DIR, { recursive: true });

let done = 0;
let sourceBytes = 0;
let thumbBytes = 0;

for (const pdfPath of pdfs) {
  const name = thumbNameFor(pdfPath);
  try {
    const buf = await renderFirstPage(pdfPath);
    await writeFile(join(OUT_DIR, name), buf);
    sourceBytes += (await stat(pdfPath)).size;
    thumbBytes += buf.length;
    done++;
    console.log(`  ✓ ${basename(pdfPath)} -> thumbs/${name} (${Math.round(buf.length / 1024)} KB)`);
  } catch (err) {
    console.error(`  ✗ ${basename(pdfPath)}: ${err.message}`);
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(
  `\n${done}/${pdfs.length} thumbnails written` +
  `\nsource PDFs: ${mb(sourceBytes)} MB  ->  thumbnails: ${mb(thumbBytes)} MB` +
  (sourceBytes ? `  (${(100 - (thumbBytes / sourceBytes) * 100).toFixed(1)}% smaller)` : "")
);
