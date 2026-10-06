/**
 * Fabrica — image utilities for the pixel-art editors.
 *
 * A "grid" is a flat array of `w * h` hex colour strings like `#rrggbbaa`
 * (pixel (x, y) lives at index `y * w + x`). Every texture/mob-skin editor
 * produces one of these and the forges turn it into a real PNG via renderPng.
 */

export const CHECKER_A = '#beaa5a'; // (190, 170, 90)
export const CHECKER_B = '#968246'; // (150, 130, 70)

/** Special colour meaning "unpainted" — stored with a zero alpha. */
export const CHROME = { transparent: '#00000000' };

export function emptyGrid(w, h, color = '#00000000') {
  return Array(w * h).fill(color);
}

export function checkerGrid(w, h) {
  const g = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      g.push((x + y) % 2 === 0 ? CHECKER_A : CHECKER_B);
    }
  }
  return g;
}

/* ---------- colour helpers ---------- */

export function hexToRgba(hex) {
  let h = (hex || '#00000000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 6) h += 'ff';
  if (h.length !== 8) h = '000000ff';
  const n = parseInt(h, 16);
  return [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbaToHex(r, g, b, a = 255) {
  const p = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}${p(a)}`;
}

/* ---------- grid <-> image data ---------- */

export function gridToImageData(grid, w, h) {
  const img = new ImageData(w, h);
  const d = img.data;
  for (let i = 0; i < w * h; i++) {
    const [r, g, b, a] = hexToRgba(grid[i]);
    d[i * 4] = r;
    d[i * 4 + 1] = g;
    d[i * 4 + 2] = b;
    d[i * 4 + 3] = a;
  }
  return img;
}

export function imageDataToGrid(imgData) {
  const { width: w, height: h, data: d } = imgData;
  const grid = [];
  for (let i = 0; i < w * h; i++) {
    grid.push(rgbaToHex(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]));
  }
  return grid;
}

/* ---------- image loading ---------- */

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/** Draw any image into a w×h grid (no smoothing — true nearest neighbour). */
export async function imageToGrid(img, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return imageDataToGrid(ctx.getImageData(0, 0, w, h));
}

/* ---------- canvas painting ---------- */

export function paintGrid(canvas, grid, w, h, scale = 1) {
  if (!canvas) return;
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const img = gridToImageData(grid, w, h);
  ctx.putImageData(img, 0, 0);
  if (scale !== 1) {
    // upscale with nearest-neighbour onto itself
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  }
}

/* ---------- PNG writer (no dependencies, real RGBA PNG) ---------- */

function concat(...arrs) {
  const total = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

function adler32(data) {
  let a = 1, b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

function crc32(data) {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function buildPng(type, data) {
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length, false);
  const typeBytes = new TextEncoder().encode(type);
  const crcBytes = new Uint8Array(4);
  new DataView(crcBytes.buffer).setUint32(0, crc32(concat(typeBytes, data)), false);
  return concat(len, typeBytes, data, crcBytes);
}

/** Raw deflate "stored" stream, split into ≤65535-byte fixed blocks. */
function deflateRaw(data) {
  const blocks = [];
  const MAX = 65535;
  for (let off = 0; off < data.length; off += MAX) {
    const chunk = data.subarray(off, Math.min(off + MAX, data.length));
    const head = new Uint8Array(5);
    const dv = new DataView(head.buffer);
    dv.setUint8(0, off + MAX >= data.length ? 1 : 0); // BFINAL, BTYPE=00
    dv.setUint16(1, chunk.length, true);
    dv.setUint16(3, (~chunk.length) & 0xffff, true);
    blocks.push(head, chunk);
  }
  return concat(...blocks);
}

function zlibWrap(raw, payload) {
  const out = new Uint8Array(raw.length + 6);
  out[0] = 0x78;
  out[1] = 0x01;
  out.set(raw, 2);
  new DataView(out.buffer).setUint32(2 + raw.length, adler32(payload), false);
  return out;
}

/** Build a real RGBA PNG from a grid. */
export function renderPng(grid, w, h) {
  const raw = new Uint8Array(h * (1 + w * 4));
  let off = 0;
  for (let y = 0; y < h; y++) {
    raw[off++] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = hexToRgba(grid[y * w + x]);
      raw[off++] = r;
      raw[off++] = g;
      raw[off++] = b;
      raw[off++] = a;
    }
  }
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, w, false);
  new DataView(ihdr.buffer).setUint32(4, h, false);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  const zlib = zlibWrap(deflateRaw(raw), raw);
  const atoms = [
    buildPng('IHDR', ihdr),
    buildPng('IDAT', zlib),
    buildPng('IEND', new Uint8Array(0))
  ];
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const body = concat(...atoms);
  const out = new Uint8Array(sig.length + body.length);
  out.set(sig, 0);
  out.set(body, sig.length);
  return out;
}

/** Grayscale preview marks (0..8) so a vanilla source keeps working offline. */
export function gridDataUrl(grid, w, h, scale = 4) {
  const canvas = document.createElement('canvas');
  paintGrid(canvas, grid, w, h, scale);
  return canvas.toDataURL('image/png');
}

/** Flood-fill the connected region of the same colour starting at (x, y). */
export function floodFill(grid, w, h, x, y, color) {
  const i = y * w + x;
  const target = grid[i];
  if (target === color) return grid;
  if (!target) return grid;
  const next = grid.slice();
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const ci = cy * w + cx;
    if (next[ci] !== target) continue;
    next[ci] = color;
    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < w - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < h - 1) stack.push([cx, cy + 1]);
  }
  return next;
}