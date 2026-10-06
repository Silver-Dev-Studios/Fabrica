import { useEffect, useMemo, useRef, useState } from 'react';
import {
  VANILLA_TEXTURES,
  VANILLA_CATEGORIES,
  VANILLA_CATEGORY_LABELS,
  VANILLA_TEXTURE_URL
} from '../data/vanillaTextures.js';
import {
  checkerGrid,
  emptyGrid,
  gridToImageData,
  imageToGrid,
  loadImage,
  fileToImage,
  floodFill,
  CHROME
} from '../data/imageUtils.js';

const CRAFT_PALETTE = [
  '#ffffffff', '#c8c8c8ff', '#8f8f8fff', '#555555ff', '#2b2b2bff', '#000000ff',
  '#ff5555ff', '#aa0000ff', '#ff7a00ff', '#aa3f00ff', '#ffae00ff', '#aa7f00ff',
  '#ffff55ff', '#aaaa00ff', '#55ff55ff', '#00aa00ff', '#00ff88ff', '#00aa55ff',
  '#55ffffff', '#00aaaaff', '#55aaffff', '#0055ffff', '#5555ffff', '#0000aaff',
  '#ff55ffff', '#aa00aaff', '#ff88ccff', '#aa5599ff', '#d87f68ff', '#8f4f3fff',
  '#6d788fff', '#3a4356ff', '#d0a34fff', '#7a4f1fff', '#8f4b6dff', '#4a2743ff'
];

// source image grayscale 0..8 (replaces the old "checker" fallback)
export const CHECKER_MARKS = ['#000000ff', '#555555ff', '#8f8f8fff', '#c8c8c8ff', '#ffffffff'];

const TOOLS = [
  { id: 'pencil', label: 'Pencil', icon: '✏️' },
  { id: 'eraser', label: 'Eraser', icon: '🧽' },
  { id: 'bucket', label: 'Fill', icon: '🪣' },
  { id: 'picker', label: 'Pick', icon: '💧' }
];

/**
 * Pure pixel-art canvas. `width`×`height` grid of `#rrggbbaa` strings.
 * Handles paints, erasing, flood-fill, eyedropper, mirror and import.
 */
export function PixelEditor({ width = 16, height = 16, grid, onChange, ready }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ff9c3fff');
  const [tool, setTool] = useState('pencil');
  const [mirrorX, setMirrorX] = useState(false);
  const [hover, setHover] = useState(false);
  const drawing = useRef(false);
  const lastCell = useRef(null);

  const cellPx = width <= 32 ? 20 : 11;
  const css = { width: width * cellPx, height: height * cellPx };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(gridToImageData(grid, width, height), 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 1; x < width; x++) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, height); }
    for (let y = 1; y < height; y++) { ctx.moveTo(0, y + 0.5); ctx.lineTo(width, y + 0.5); }
    ctx.stroke();
  }, [grid, width, height]);

  const cellAt = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / width));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / height));
    return [Math.max(0, Math.min(width - 1, x)), Math.max(0, Math.min(height - 1, y))];
  };

  const apply = (x, y, c, mode) => {
    if (!grid) return;
    let next;
    if (mode === 'bucket') {
      next = floodFill(grid, width, height, x, y, c);
    } else {
      next = grid.slice();
      next[y * width + x] = c;
      if (mirrorX) next[y * width + (width - 1 - x)] = c;
    }
    onChange(next);
  };

  const handleDown = (e) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const [x, y] = cellAt(e);
    lastCell.current = `${x},${y}`;
    if (tool === 'picker') {
      const c = grid[y * width + x];
      if (c) setColor(c);
      return;
    }
    const c = tool === 'eraser' ? CHROME.transparent : color;
    apply(x, y, c, tool === 'bucket' ? 'bucket' : 'paint');
  };

  const handleMove = (e) => {
    setHover(true);
    if (!drawing.current) return;
    const [x, y] = cellAt(e);
    const key = `${x},${y}`;
    if (key === lastCell.current) return;
    lastCell.current = key;
    if (tool === 'bucket' || tool === 'picker') return;
    apply(x, y, tool === 'eraser' ? CHROME.transparent : color, 'paint');
  };

  const handleUp = () => { drawing.current = false; };

  const onImportFile = async (file) => {
    try {
      const img = await fileToImage(file);
      const g = await imageToGrid(img, width, height);
      onChange(g);
    } catch (err) {
      console.error(err);
      alert('Could not read that image.');
    }
  };

  const onImportUrl = async (url) => {
    try {
      const img = await loadImage(url);
      const g = await imageToGrid(img, width, height);
      onChange(g);
    } catch (err) {
      console.error(err);
      alert('Could not load that image — check the URL or your connection.');
    }
  };

  const swatch = (c) => (
    <button
      key={c}
      type="button"
      className={`swatch ${color.toLowerCase() === c.toLowerCase() ? 'sel' : ''}`}
      style={{ background: c === CHROME.transparent ? 'transparent' : c }}
      onClick={() => { setColor(c); setTool('pencil'); }}
      title={c}
    >
      {c === CHROME.transparent && <span className="swatch-clear">∅</span>}
    </button>
  );

  return (
    <div className="pixie">
      <div className="pixie-canvas-wrap" style={css}>
        <canvas
          ref={canvasRef}
          className={`pixie-canvas ${hover ? 'hover' : ''}`}
          style={css}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={() => { setHover(false); drawing.current = false; }}
        />
      </div>

      <div className="pixie-side">
        <div className="pixie-tools term">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pixie-tool ${tool === t.id ? 'sel' : ''}`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <span className="pixie-tool-ico">{t.icon}</span>
              <span className="pixie-tool-name">{t.label}</span>
            </button>
          ))}
          <label className="pixie-col" title="Custom colour">
            <input
              type="color"
              value={color.slice(0, 7)}
              onChange={(e) => setColor(e.target.value + 'ff')}
            />
            <span className="pixie-tool-name">Colour</span>
          </label>
        </div>

        <label className="toggle-row tiny">
          <input type="checkbox" checked={mirrorX} onChange={(e) => setMirrorX(e.target.checked)} />
          <span className="term">Mirror X</span>
        </label>

        <div className="pixie-actions term">
          <button type="button" className="pixie-action" onClick={() => onChange(emptyGrid(width, height))}>Clear</button>
          <button type="button" className="pixie-action" onClick={() => onChange(checkerGrid(width, height))}>Reset</button>
        </div>

        <div className="pixie-import">
          <label className="btn btn-ghost btn-sm pixie-file">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }}
            />
            ⬆  Upload PNG
          </label>
          {ready == null ? (
            <span className="pixie-import-note term">checking…</span>
          ) : ready ? (
            <span className="pixie-import-note term">remote ok</span>
          ) : (
            <span className="pixie-import-note term warn-note">offline — fetch failed</span>
          )}
        </div>

        <div className="pixie-auto">
          <input
            className="pixie-url"
            placeholder="or paste an image URL…"
            onKeyDown={(e) => { if (e.key === 'Enter') onImportUrl(e.target.value.trim()); }}
          />
          <button type="button" className="pixie-go term" onClick={(e) => onImportUrl(e.target.previousElementSibling.value.trim())}>Go</button>
        </div>
      </div>

      <div className="pixie-palette">
        {CRAFT_PALETTE.map(swatch)}
        {swatch(CHROME.transparent)}
      </div>
    </div>
  );
}

/* ======================================================================
   Vanilla texture gallery
   ====================================================================== */

export function VanillaGallery({ category, onPick, width = 16 }) {
  const [filter, setFilter] = useState('');
  const list = useMemo(() => {
    const all = VANILLA_TEXTURES[category] || [];
    if (!filter.trim()) return all.slice(0, 90);
    const q = filter.trim().toLowerCase();
    return all.filter((t) => t.id.toLowerCase().includes(q) || t.label.toLowerCase().includes(q)).slice(0, 90);
  }, [category, filter]);

  return (
    <div className="vgallery">
      <div className="vgallery-head">
        <span className="pixie-import-note term">tap a tile to copy it into your canvas</span>
        <input
          className="pixie-url vgallery-search"
          placeholder="filter…  e.g. iron_sword"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="vgallery-list">
        {list.map((t) => (
          <Tile key={t.id} category={category} id={t.id} label={t.label} width={width} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function Tile({ category, id, label, onPick, width = 16 }) {
  const [state, setState] = useState('loading'); // loading | ok | err
  useEffect(() => {
    let alive = true;
    setState('loading');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => alive && setState('ok');
    img.onerror = () => alive && setState('err');
    img.src = VANILLA_TEXTURE_URL(category, id);
    return () => { alive = false; };
  }, [category, id]);

  const url = VANILLA_TEXTURE_URL(category, id);
  return (
    <button
      type="button"
      className={`vtile ${state}`}
      onClick={() => { if (state === 'ok') onPick({ category, id, label }); }}
      title={`${id} — click to import`}
    >
      {state === 'ok' ? (
        <img src={url} alt={label} loading="lazy" width={width} height={width} style={{ imageRendering: 'pixelated' }} />
      ) : state === 'err' ? (
        <span className="vtile-err">✖</span>
      ) : (
        <span className="vtile-load" />
      )}
    </button>
  );
}

export const VANILLA_GALLERY_CATS = VANILLA_CATEGORIES;

/* ======================================================================
   Mob skin sheet — 64×64 editor + vanilla gallery + device upload
   ====================================================================== */

export const MOB_SKIN_SIZE = 64;

// Curated vanilla mob skins (all exist in the 1.21.1 assets, mostly 64×64).
export const MOB_SKIN_GALLERY = [
  { id: 'zombie/zombie', label: 'Zombie' },
  { id: 'zombie/drowned', label: 'Drowned' },
  { id: 'zombie/husk', label: 'Husk' },
  { id: 'skeleton/skeleton', label: 'Skeleton' },
  { id: 'skeleton/stray', label: 'Stray' },
  { id: 'skeleton/bogged', label: 'Bogged' },
  { id: 'creeper/creeper', label: 'Creeper' },
  { id: 'enderman/enderman', label: 'Enderman' },
  { id: 'witch', label: 'Witch' },
  { id: 'pig/pig', label: 'Pig' },
  { id: 'cow/cow', label: 'Cow' },
  { id: 'cow/brown_mooshroom', label: 'Mooshroom' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'sheep/sheep', label: 'Sheep' },
  { id: 'wolf/wolf', label: 'Wolf' },
  { id: 'fox/fox', label: 'Fox' },
  { id: 'cat/black', label: 'Black Cat' },
  { id: 'cat/tabby', label: 'Tabby Cat' },
  { id: 'cat/red', label: 'Red Cat' },
  { id: 'cat/siamese', label: 'Siamese Cat' },
  { id: 'panda/panda', label: 'Panda' },
  { id: 'bear/polarbear', label: 'Polar Bear' },
  { id: 'goat/goat', label: 'Goat' },
  { id: 'spider/spider', label: 'Spider' },
  { id: 'spider/cave_spider', label: 'Cave Spider' },
  { id: 'slime/slime', label: 'Slime' },
  { id: 'slime/magmacube', label: 'Magma Cube' },
  { id: 'ghast/ghast', label: 'Ghast' },
  { id: 'blaze', label: 'Blaze' },
  { id: 'horse/horse_black', label: 'Black Horse' },
  { id: 'horse/horse_brown', label: 'Brown Horse' },
  { id: 'horse/horse_white', label: 'White Horse' },
  { id: 'horse/donkey', label: 'Donkey' },
  { id: 'villager/villager', label: 'Villager' },
  { id: 'wandering_trader', label: 'Wandering Trader' },
  { id: 'dolphin', label: 'Dolphin' },
  { id: 'squid/squid', label: 'Squid' },
  { id: 'squid/glow_squid', label: 'Glow Squid' },
  { id: 'fish/cod', label: 'Cod' },
  { id: 'fish/salmon', label: 'Salmon' },
  { id: 'piglin/piglin', label: 'Piglin' },
  { id: 'piglin/piglin_brute', label: 'Piglin Brute' },
  { id: 'piglin/zombified_piglin', label: 'Zombified Piglin' },
  { id: 'wither/wither', label: 'Wither' },
  { id: 'warden/warden', label: 'Warden' },
  { id: 'allay/allay', label: 'Allay' },
  { id: 'player/wide/steve', label: 'Steve' },
  { id: 'player/wide/alex', label: 'Alex' }
];

export const MOB_SKIN_URL = (id) => VANILLA_TEXTURE_URL('entity', id);

export function MobSkinEditor({ grid, setGrid, ready }) {
  const [filter, setFilter] = useState('');

  const list = useMemo(() => {
    if (!filter.trim()) return MOB_SKIN_GALLERY;
    const q = filter.trim().toLowerCase();
    return MOB_SKIN_GALLERY.filter((m) => m.label.toLowerCase().includes(q) || m.id.includes(q));
  }, [filter]);

  const pickSkin = async (m) => {
    try {
      const img = await loadImage(MOB_SKIN_URL(m.id));
      const g = await imageToGrid(img, MOB_SKIN_SIZE, MOB_SKIN_SIZE);
      setGrid(g);
    } catch {
      alert('Could not load that skin — check your connection.');
    }
  };

  return (
    <div className="mob-skin-editor">
      <PixelEditor
        width={MOB_SKIN_SIZE}
        height={MOB_SKIN_SIZE}
        grid={grid}
        onChange={setGrid}
        ready={ready}
      />

      <div className="gallery-wrap">
        <div className="vgallery-head">
          <span className="pixie-import-note term">
            pick a vanilla mob skin to start from (or upload your own above)
          </span>
          <input
            className="pixie-url vgallery-search"
            placeholder="filter skins…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="vgallery-list skin-list">
          {list.map((m) => (
            <SkinTile key={m.id} m={m} onPick={() => pickSkin(m)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkinTile({ m, onPick }) {
  const [state, setState] = useState('loading');
  useEffect(() => {
    let alive = true;
    setState('loading');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => alive && setState('ok');
    img.onerror = () => alive && setState('err');
    img.src = MOB_SKIN_URL(m.id);
    return () => { alive = false; };
  }, [m.id]);

  return (
    <button type="button" className={`stile ${state}`} onClick={onPick} title={`${m.id} — click to use`}>
      {state === 'ok' ? (
        <img src={MOB_SKIN_URL(m.id)} alt={m.label} loading="lazy" width={32} height={32} style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
      ) : state === 'err' ? (
        <span className="vtile-err">✖</span>
      ) : (
        <span className="vtile-load" />
      )}
      <span className="stile-name term">{m.label}</span>
    </button>
  );
}

/* ======================================================================
   Texture painter — used by block / item / tool / texture nodes
   ====================================================================== */

export function TexturePainter({ grid, setGrid, category = 'block', width = 16 }) {
  const [pickCat, setPickCat] = useState(category);
  const [ready, setReady] = useState(null);

  useEffect(() => {
    let alive = true;
    loadImage(VANILLA_TEXTURE_URL('block', 'stone'))
      .then(() => alive && setReady(true))
      .catch(() => alive && setReady(false));
    return () => { alive = false; };
  }, []);

  const pickFromGallery = async ({ category: cat, id }) => {
    try {
      const img = await loadImage(VANILLA_TEXTURE_URL(cat, id));
      const g = await imageToGrid(img, width, width);
      setGrid(g);
    } catch {
      alert('Could not load that texture — check your connection.');
    }
  };

  return (
    <div className="texture-painter">
      <PixelEditor width={width} height={width} grid={grid} onChange={setGrid} ready={ready} />

      <div className="gallery-wrap">
        <div className="gallery-cats term">
          {VANILLA_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`gcat ${pickCat === c ? 'sel' : ''}`}
              onClick={() => setPickCat(c)}
            >
              {VANILLA_CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>
        <VanillaGallery category={pickCat} onPick={pickFromGallery} width={width} />
      </div>
    </div>
  );
}