/**
 * Fabrica — node registry for the Mod Maker.
 * Each "New" block type describes a thing a player can add to their
 * project, together with the fields exposed in the property panel and
 * the forges (generators) that turn a node into real files.
 */

import {
  checkerGrid,
  renderPng
} from './data/imageUtils.js';
import { MOB_SKIN_SIZE } from './components/Painters.jsx';

let uidCounter = 0;
export const uid = () => `k-${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

/** A 16×16 pixel grid (#rrggbbaa strings), with fallback for old projects. */
export function pixelGridOf(node, size = 16) {
  const g = node && node.pixelGrid;
  if (Array.isArray(g) && g.length === size * size) return g;
  return checkerGrid(size, size);
}

/** A 64×64 skin grid, with fallback for old projects. */
export function skinGridOf(node) {
  const s = MOB_SKIN_SIZE * MOB_SKIN_SIZE;
  const g = node && node.skinGrid;
  if (Array.isArray(g) && g.length === s) return g;
  return checkerGrid(MOB_SKIN_SIZE, MOB_SKIN_SIZE);
}

function kinds(isSword) {
  return isSword
    ? ['I', 'I', 'S']
    : ['II', 'IS', ' S'];
}

/**
 * Map one recipe-grid letter to an actual ingredient. Each node can supply an
 * optional `ingredients` map ({A: "minecraft:stick", B: "ns:ruby", ...});
 * unknown letters fall back to a sensible material.
 */
function lookupIngredient(node, letter) {
  const overrides = node.ingredients || {};
  if (overrides[letter] && overrides[letter].trim()) return overrides[letter].trim();
  return { A: 'minecraft:stick', B: 'minecraft:iron_ingot', C: 'minecraft:coal', D: 'minecraft:diamond' }[letter] || 'minecraft:stone';
}

export function makeNode(type, edition) {
  const base = {
    id: uid(),
    type,
    edition,
    // cosmetic / identifiers
    identifier: '',
    name: '',
    namespace: 'fabrica',
    // shared core fields
    description: '',
    texture: '',
    health: 20,
    damage: 3,
    speed: 0.25,
    // java only
    item: '',
    maxStack: 64,
    // bedrock only
    componentGroups: [],
    // toggle flags
    dropsSelf: true,
    spawnEgg: true,
    projectile: false,
    rideable: false,
    burning: false,
    hostile: false,
    creativeTab: 'misc',
    render: 'axis',
    rarity: 'common',
    woodMaterial: 'oak',
    // food
    nutrition: 4,
    saturation: 0.6,
    canAlwaysEat: false,
    useDuration: 1.6,
    // armor
    armorSlot: 'chest',
    protection: 4,
    // tool / weapon
    attackDamage: 5,
    durability: 264,
    digSpeed: 6,
    // mob
    scale: 1,
    spawnEggBase: '#8a5a3a',
    spawnEggOverlay: '#ff9c3f',
    // recipe
    recipeKind: 'crafting',
    smeltInput: 'minecraft:iron_ore',
    smeltResult: 'minecraft:iron_ingot',
    smeltXp: 0.7,
    // ore
    oreDrop: '',
    oreCount: 1,
    updated: Date.now()
  };

  switch (type) {
    case 'block':
      base.name = 'New Block';
      base.identifier = 'new_block';
      base.render = 'axis';
      base.creativeTab = 'misc';
      base.pixelGrid = checkerGrid(16, 16);
      break;
    case 'mob':
      base.name = 'New Mob';
      base.identifier = 'new_mob';
      base.spawnEgg = true;
      base.skinGrid = checkerGrid(MOB_SKIN_SIZE, MOB_SKIN_SIZE);
      break;
    case 'item':
      base.name = 'New Item';
      base.identifier = 'new_item';
      base.maxStack = 64;
      base.pixelGrid = checkerGrid(16, 16);
      break;
    case 'tool':
      base.name = 'New Tool';
      base.identifier = 'new_tool';
      base.tier = 'diamond';
      base.pixelGrid = checkerGrid(16, 16);
      break;
    case 'texture':
      base.name = 'New Texture';
      base.identifier = 'new_texture';
      base.pixelGrid = checkerGrid(16, 16);
      base.textureCategory = 'block';
      break;
    case 'recipe':
      base.name = 'Crafting Recipe';
      base.identifier = 'new_recipe';
      base.shape = [
        ['A', 'A'],
        ['A', 'A']
      ];
      base.patternNote = 'Edit the grid below — use letters for ingredients, blank for empty.';
      break;
    case 'loot':
      base.name = 'Loot Table';
      base.identifier = 'new_loot';
      base.rolls = 1;
      break;
    case 'command':
      base.name = 'Command';
      base.identifier = 'new_command';
      base.lines = ['say Hello from my Fabrica pack!'];
      break;
    case 'advancement':
      base.name = 'Advancement';
      base.identifier = 'new_advancement';
      base.target = 'minecraft:stone';
      break;
    case 'sound':
      base.name = 'Sound Pack';
      base.identifier = 'new_sound';
      break;
    case 'structure':
      base.name = 'Structure';
      base.identifier = 'new_structure';
      break;
    case 'food':
      base.name = 'New Food';
      base.identifier = 'new_food';
      base.nutrition = 4;
      base.saturation = 0.6;
      base.pixelGrid = checkerGrid(16, 16);
      break;
    case 'armor':
      base.name = 'New Armor';
      base.identifier = 'new_armor';
      base.armorSlot = 'chest';
      base.protection = 4;
      base.pixelGrid = checkerGrid(16, 16);
      break;
    case 'ore':
      base.name = 'New Ore';
      base.identifier = 'new_ore';
      base.oreDrop = '';
      base.oreCount = 1;
      base.pixelGrid = checkerGrid(16, 16);
      break;
    default:
      base.name = 'New Node';
      base.identifier = 'new_' + type;
  }
  return base;
}

/**
 * The "New" block menu.
 * icon  -> emoji glyph shown on the block
 * tints -> css gradient for the pixel-block face
 */
export const NODE_TYPES = [
  {
    type: 'block',
    label: 'Block',
    tagline: 'A brand-new placeable block',
    icon: '⬛',
    gradient: 'linear-gradient(135deg,#6d788f,#3a4356)'
  },
  {
    type: 'mob',
    label: 'Mob',
    tagline: 'Custom creature, boss or friend',
    icon: '👾',
    gradient: 'linear-gradient(135deg,#8f4b6d,#4a2743)'
  },
  {
    type: 'item',
    label: 'Item',
    tagline: 'A stackable item with tooltip',
    icon: '💠',
    gradient: 'linear-gradient(135deg,#4f8fd0,#1f4a7a)'
  },
  {
    type: 'tool',
    label: 'Tool',
    tagline: 'Sword, pickaxe, axe & co.',
    icon: '⚔️',
    gradient: 'linear-gradient(135deg,#d0a34f,#7a4f1f)'
  },
  {
    type: 'armor',
    label: 'Armor',
    tagline: 'Helm, chestplate, leggings & boots',
    icon: '🛡️',
    gradient: 'linear-gradient(135deg,#5fb0d0,#1f5c7a)'
  },
  {
    type: 'food',
    label: 'Food',
    tagline: 'Snacks, feasts & questionable stew',
    icon: '🍗',
    gradient: 'linear-gradient(135deg,#d06b4f,#7a2b1f)'
  },
  {
    type: 'ore',
    label: 'Ore',
    tagline: 'Minable ore that drops and smelts',
    icon: '💎',
    gradient: 'linear-gradient(135deg,#4f7ad0,#1f2f7a)'
  },
  {
    type: 'texture',
    label: 'Texture',
    tagline: 'Paint-block, item art & skins',
    icon: '🎨',
    gradient: 'linear-gradient(135deg,#7a5fd0,#3d2a7a)'
  },
  {
    type: 'recipe',
    label: 'Recipe',
    tagline: 'Make it craftable (or smelt!)',
    icon: '🧪',
    gradient: 'linear-gradient(135deg,#43b07a,#1f5c40)'
  },
  {
    type: 'loot',
    label: 'Loot Table',
    tagline: 'What drops when it breaks',
    icon: '💰',
    gradient: 'linear-gradient(135deg,#c98a2e,#6e4713)'
  },
  {
    type: 'command',
    label: 'Command',
    tagline: 'run commands on load & tick',
    icon: '⌨️',
    gradient: 'linear-gradient(135deg,#23a0a8,#0c4d52)'
  },
  {
    type: 'advancement',
    label: 'Advancement',
    tagline: 'Quest, trophy & unlock chain',
    icon: '🏆',
    gradient: 'linear-gradient(135deg,#d0553f,#7a1f14)'
  },
  {
    type: 'sound',
    label: 'Sound Pack',
    tagline: 'Ambience, jukebox & effects',
    icon: '🔊',
    gradient: 'linear-gradient(135deg,#4aa8d0,#1e567a)'
  },
  {
    type: 'structure',
    label: 'Structure',
    tagline: 'Village, dungeon & ruins',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg,#9a8f5f,#5c5230)'
  }
];

export const nodeByType = (t) => NODE_TYPES.find((n) => n.type === t);

export const WOOD_TYPES = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'cherry', 'mangrove', 'bamboo'];

/* ============================================================
   Java Edition forge — every node becomes real files
   ============================================================ */

function jsonBytes(obj) {
  return new TextEncoder().encode(JSON.stringify(obj, null, 2));
}

function texturePng(grid, w = 16, h = 16) {
  return renderPng(grid, w, h);
}

/**
 * Build a 64×64 translucent armor-layer texture from a 16×16 item grid.
 * Each body part region on the armour layer (head/chest/legs/feet) receives
 * the scaled-up artwork with 204 alpha so worn armor shows the player
 * model underneath. Cadences/regions follow the classic vanilla armour layer.
 */
function armorLayerBytes(grid16) {
  const S = 64;
  const layer = Array(S * S).fill('#00000000');
  const copy = (dstX, dstY, srcX, srcY, w, h, scale) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const src = grid16[srcY * 16 + srcX];
        if (!src || (src.length === 9 && src.endsWith('00'))) continue; // transparent
        const r = src.slice(1, 7);
        for (let yy = 0; yy < scale; yy++) {
          for (let xx = 0; xx < scale; xx++) {
            const dx = dstX + x * scale + xx;
            const dy = dstY + y * scale + yy;
            if (dx >= 0 && dx < S && dy >= 0 && dy < S) layer[dy * S + dx] = `#${r}cc`;
          }
        }
      }
    }
  };
  // head
  copy(8, 0, 0, 0, 16, 8, 1);
  // chest
  copy(16, 16, 0, 8, 16, 4, 1);
  // legs (leggings region)
  copy(16, 32, 0, 8, 16, 4, 1);
  // feet
  copy(16, 48, 0, 12, 16, 4, 1);
  return renderPng(layer, S, S);
}

export const javaForge = {
  /** Build every file for this node as {path, content} pairs. */
  make(node) {
    const ns = node.namespace || 'fabrica';
    const id = (node.identifier || 'item').toLowerCase().replace(/[^a-z0-9_.]/g, '_');
    const files = {};

    // custom texture path if given, else a per-type default
    const customTex = (node.texture || '').toLowerCase().replace(/^textures\//, '').replace(/\.png$/, '').trim();
    const defaultTex = () => {
      if (node.type === 'block') return `block/${id}`;
      if (node.type === 'mob') return `entity/${id}`;
      if (node.type === 'texture') return (node.textureCategory === 'item' ? 'item' : 'block') + `/${id}`;
      return `item/${id}`;
    };
    const texRef = customTex || defaultTex();

    switch (node.type) {
      case 'block': {
        files['assets/' + ns + '/blockstates/' + id + '.json'] = jsonBytes({
          variants: { '': { model: `${ns}:block/${id}` } }
        });
        files['assets/' + ns + '/models/block/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:block/cube_all',
          textures: { all: `${ns}:${texRef}` }
        });
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: `${ns}:block/${id}`
        });
        files['data/' + ns + '/loot_table/blocks/' + id + '.json'] = jsonBytes({
          type: 'minecraft:block',
          pools: [
            {
              rolls: 1,
              entries: [{ type: 'minecraft:item', name: `${ns}:${id}` }],
              conditions: [{ condition: 'minecraft:survives_explosion' }]
            }
          ]
        });
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'building',
          group: `${ns}:${id}`,
          pattern: ['###', '###', '###'],
          key: { '#': { item: 'minecraft:cobblestone' } },
          result: { id: `${ns}:${id}`, count: 1 }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'mob': {
        // Java Edition has no data-pack mob model, but we still ship the skin
        // so it can be referenced by resource packs / future datapack models.
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(skinGridOf(node), 64, 64);
        break;
      }

      case 'item': {
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/generated',
          textures: { layer0: `${ns}:${texRef}` }
        });
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'misc',
          pattern: ['I'],
          key: { I: { item: 'minecraft:iron_ingot' } },
          result: { id: `${ns}:${id}`, count: 1 }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'tool': {
        const kind = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'].includes(node.toolKind)
          ? node.toolKind : 'sword';
        const isSword = kind === 'sword';
        const pattern = kinds(isSword);
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/handheld',
          textures: { layer0: `${ns}:${texRef}` }
        });
        // 1.21.4+ data-driven item with combat + durability behaviour
        files['data/' + ns + '/item/' + id + '.json'] = jsonBytes({
          model: { type: 'minecraft:model', model: `${ns}:item/${id}` },
          attributes: [
            { type: 'minecraft:attack_damage', amount: Number(node.attackDamage) || 1, operation: 'add_value', id: `${ns}:attack.${id}` },
            { type: 'minecraft:attack_speed', amount: -2.4, operation: 'add_value', id: `${ns}:speed.${id}` }
          ],
          max_stack_size: 1,
          max_damage: Number(node.durability) || 264,
          ...(isSword
            ? { tool: { rules: [], damage_per_block: 1 } }
            : { tool: { rules: [{ blocks: `#minecraft:mineable/${kind === 'pickaxe' ? 'pickaxe' : kind === 'axe' ? 'axe' : kind === 'shovel' ? 'shovel' : 'hoe'}`, speed: Number(node.digSpeed) || 6, correct_for_drops: true }], damage_per_block: 1 } })
        });
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'equipment',
          pattern,
          key: { I: { item: lookupIngredient(node, 'I') || 'minecraft:iron_ingot' }, S: { item: 'minecraft:stick' } },
          result: { id: `${ns}:${id}` }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'texture': {
        // The texture node only supplies artwork — generate every path a pack may need.
        for (const name of [texRef, `${texRef}_n`, `${texRef}_s`]) {
          files['assets/' + ns + '/textures/' + name + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        }
        break;
      }

      case 'recipe': {
        // shaped recipe from the 3x3 grid + shape letters, or a smelting recipe
        if (node.recipeKind === 'smelting') {
          files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
            type: 'minecraft:smelting',
            category: 'misc',
            experience: Number(node.smeltXp) || 0.7,
            cookingtime: 200,
            ingredient: { item: String(node.smeltInput || 'minecraft:iron_ore') },
            result: { id: String(node.smeltResult || 'minecraft:iron_ingot'), count: 1 }
          });
          break;
        }
        const shape = node.shape || [['A', 'A'], ['A', 'A']];
        const letters = new Set(shape.flat().filter((c) => c && c.trim()));
        const entry = letters.size
          ? Object.fromEntries([...letters].map((l) => [l, { item: lookupIngredient(node, l) }]))
          : {};
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'misc',
          group: `${ns}:${id}`,
          pattern: shape.map((row) => row.map((c) => (c && c.trim() ? c : ' ')).join('')),
          key: entry,
          result: { id: node.resultItem || 'minecraft:diamond', count: Number(node.resultCount) || 1 }
        });
        break;
      }

      case 'food': {
        files['data/' + ns + '/item/' + id + '.json'] = jsonBytes({
          model: { type: 'minecraft:model', model: `${ns}:item/${id}` },
          food: {
            nutrition: Number(node.nutrition) || 4,
            saturation: Number(node.saturation) || 0.6,
            can_always_eat: !!node.canAlwaysEat
          },
          ...(Number(node.maxStack) !== 1 ? {} : { max_stack_size: 1 })
        });
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/generated',
          textures: { layer0: `${ns}:${texRef}` }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'armor': {
        const slotJava = { helmet: 'head', chestplate: 'chest', leggings: 'legs', boots: 'feet' }[node.armorSlot || 'chest'];
        files['data/' + ns + '/item/' + id + '.json'] = jsonBytes({
          model: { type: 'minecraft:model', model: `${ns}:item/${id}` },
          attributes: [
            { type: 'minecraft:armor', amount: Number(node.protection) || 1, slot: slotJava, operation: 'add_value', id: `${ns}:armor.${id}` }
          ],
          max_stack_size: 1
        });
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/generated',
          textures: { layer0: `${ns}:${texRef}` }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'ore': {
        const drop = String(node.oreDrop || `${ns}:${id}`);
        // blockstate → cube_all model → drops itself (or a custom item) via loot table.
        files['assets/' + ns + '/blockstates/' + id + '.json'] = jsonBytes({
          variants: { '': { model: `${ns}:block/${id}` } }
        });
        files['assets/' + ns + '/models/block/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:block/cube_all',
          textures: { all: `${ns}:${texRef}` }
        });
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: `${ns}:block/${id}`
        });
        files['data/' + ns + '/loot_table/blocks/' + id + '.json'] = jsonBytes({
          type: 'minecraft:block',
          pools: [
            {
              rolls: 1,
              entries: [
                {
                  type: 'minecraft:item',
                  name: drop,
                  functions: [
                    {
                      function: 'minecraft:set_count',
                      count: {
                        type: 'minecraft:uniform',
                        min: 1,
                        max: Math.max(1, Number(node.oreCount) || 1)
                      }
                    }
                  ]
                }
              ],
              conditions: [{ condition: 'minecraft:survives_explosion' }]
            }
          ]
        });
        // Smelt the mined drop into an ingot (classic ore upgrade path).
        files['data/' + ns + '/recipe/' + id + '_smelt.json'] = jsonBytes({
          type: 'minecraft:smelting',
          category: 'misc',
          experience: Number(node.smeltXp) || 0.7,
          cookingtime: 200,
          ingredient: { item: drop },
          result: { id: String(node.smeltResult || 'minecraft:iron_ingot'), count: 1 }
        });
        files['assets/' + ns + '/textures/' + texRef + '.png'] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'loot': {
        files['data/' + ns + '/loot_table/blocks/' + id + '.json'] = jsonBytes({
          type: 'minecraft:block',
          pools: [
            {
              rolls: Number(node.rolls) || 1,
              entries: [
                {
                  type: 'minecraft:item',
                  name: node.dropItem || `${ns}:${id}`,
                  functions: [
                    {
                      function: 'minecraft:set_count',
                      count: { type: 'minecraft:uniform', min: 1, max: Number(node.rolls) || 1 }
                    }
                  ]
                }
              ],
              conditions: [{ condition: 'minecraft:survives_explosion' }]
            }
          ]
        });
        break;
      }

      case 'command': {
        const lines = Array.isArray(node.lines) ? node.lines : [String(node.lines || '')];
        files['data/' + ns + '/function/' + id + '.mcfunction'] =
          new TextEncoder().encode(lines.join('\n') + '\n');
        break;
      }

      case 'advancement': {
        files['data/' + ns + '/advancement/' + id + '.json'] = jsonBytes({
          display: {
            icon: { id: node.iconItem || 'minecraft:stone' },
            title: node.name || `${ns}:advancement`,
            description: node.description || 'Earned with Fabrica',
            frame: node.frame || 'task',
            show_toast: true,
            announce_to_chat: true
          },
          criteria: {
            trigger: { trigger: 'minecraft:impossible' }
          }
        });
        break;
      }

      case 'sound': {
        files['assets/' + ns + '/sounds.json'] = jsonBytes({
          [id]: {
            sounds: [{ name: `${ns}:${id}`, stream: false }]
          }
        });
        // a tiny silent one-second ogg placeholder keeps the pack importable
        files['assets/' + ns + '/sounds/' + id + '.ogg'] = new TextEncoder().encode(
          'OggS' + '\u0000'.repeat(4) + 'placeholder silence'
        );
        break;
      }

      case 'structure': {
        files['data/' + ns + '/structure/' + id + '.nbt'] = new TextEncoder().encode(
          'FABRICA_PLACEHOLDER_STRUCTURE'
        );
        break;
      }

      default:
        break;
    }

    return files;
  },

  /** Sum everything into one .zip bytes blob. */
  async pack(project, full) {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const packRoot = zip.folder(`pack_${project.name.replace(/\s+/g, '_').toLowerCase()}`);

    packRoot.file('pack.mcmeta', jsonBytes({
      pack: { description: project.description || 'Made with Fabrica', pack_format: 48 }
    }));

    full.forEach((node) => {
      Object.entries(javaForge.make(node)).forEach(([path, content]) => {
        packRoot.file(path, content);
      });
    });

    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'STORE',
      compressionOptions: { level: 0 }
    });
    return new File([blob], `${slug(project.name)}.zip`, { type: 'application/zip' });
  }
};

/* ============================================================
   Bedrock Edition forge — .mcpack / .mcaddon
   ============================================================ */

const sanitizeId = (s) => (s || 'item').toLowerCase().replace(/[^a-z0-9_.]/g, '_').replace(/^_+|_+$/g, '') || 'item';

// Per-face UV helper for the classic mob skin layout (64x64 texture).
const box = (origin, size, facesBySide) => ({
  origin,
  size,
  uv: {
    north: { uv: facesBySide.north, texture_size: [64, 64] },
    south: { uv: facesBySide.south, texture_size: [64, 64] },
    east: { uv: facesBySide.east, texture_size: [64, 64] },
    west: { uv: facesBySide.west, texture_size: [64, 64] },
    up: { uv: facesBySide.up, texture_size: [64, 64] },
    down: { uv: facesBySide.down, texture_size: [64, 64] }
  }
});

// Classic humanoid geometry (zombie-style) wired to a standard 64x64 skin.
function humanoidGeometry(id) {
  const head = box([-4, 24, -4], [8, 8, 8], {
    north: [8, 8], south: [24, 8], east: [16, 8], west: [0, 8],
    up: [8, 0], down: [16, 0]
  });
  const body = box([-4, 12, -2], [8, 12, 4], {
    north: [20, 20], south: [32, 20], east: [28, 20], west: [16, 20],
    up: [20, 16], down: [28, 16]
  });
  const arm = box([-8, 12, -2], [4, 12, 4], {
    north: [44, 20], south: [52, 20], east: [48, 20], west: [40, 20],
    up: [44, 16], down: [48, 16]
  });
  const rightLeg = box([-4, 0, -2], [4, 12, 4], {
    north: [4, 20], south: [12, 20], east: [8, 20], west: [0, 20],
    up: [4, 16], down: [8, 16]
  });
  return {
    format_version: '1.12.0',
    'minecraft:geometry': [
      {
        description: {
          identifier: `geo.${id}.geometry`,
          texture_width: 64,
          texture_height: 64,
          visible_bounds_width: 3,
          visible_bounds_height: 4,
          visible_bounds_offset: [0, 2, 0]
        },
        bones: [
          {
            name: 'body',
            pivot: [0, 12, 0],
            cubes: [
              body,
              { ...arm, origin: [-8, 12, -2] },
              { ...arm, origin: [4, 12, -2] }
            ]
          },
          { name: 'head', pivot: [0, 24, 0], cubes: [head] },
          { name: 'rightLeg', pivot: [-2, 12, 0], cubes: [rightLeg] },
          { name: 'leftLeg', pivot: [2, 12, 0], cubes: [{ ...rightLeg, origin: [0, 0, -2] }] }
        ]
      }
    ]
  };
}

export const bedrockForge = {
  /**
   * Build a node's Bedrock files as { bp: {path:bytes}, rp: {path:bytes} }.
   * paths are relative to the pack root (no BP/RP folder prefix).
   */
  make(node) {
    const ns = node.namespace || 'fabrica';
    const id = sanitizeId(node.identifier);
    const bp = {};
    const rp = {};

    switch (node.type) {
      case 'block': {
        const category = node.category || 'nature';
        const tag = node.creativeTab && node.creativeTab !== 'none'
          ? { tags: [`${ns}:${node.creativeTab}`] } : {};
        bp[`blocks/${id}.json`] = jsonBytes({
          format_version: '1.21.0',
          'minecraft:block': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: {
                category,
                group: 'minecraft:itemGroup.name.' + category
              }
            },
            components: {
              // modern 1.21.x block format — no experiment toggle required
              'minecraft:unit_cube': {},
              'minecraft:material_instances': {
                '*': {
                  texture: `${ns}_${id}`,
                  render_method: node.renderMethod || 'opaque',
                  ambient_occlusion: true
                }
              },
              'minecraft:destructible_by_mining': { seconds_to_destroy: 0.8 },
              'minecraft:map_color': '#8a7b5c',
              'minecraft:display_name': `${node.name || id}`,
              ...tag
            },
            events: {}
          }
        });
        bp[`loot_tables/blocks/${id}.json`] = jsonBytes({
          pools: [
            {
              rolls: 1,
              entries: [{ type: 'item', name: `${ns}:${id}`, weight: 1 }]
            }
          ]
        });
        rp[`textures/blocks/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'mob': {
        bp[`entities/${id}.json`] = jsonBytes({
          format_version: '1.21.0',
          'minecraft:entity': {
            description: {
              identifier: `${ns}:${id}`,
              is_spawnable: true,
              is_summonable: true,
              spawn_category: node.hostile ? 'monster' : node.category || 'creature'
            },
            component_groups: {},
            components: {
              'minecraft:type_family': { family: [id, node.hostile ? 'monster' : 'creature'] },
              'minecraft:health': { value: Number(node.health) || 20 },
              'minecraft:movement': { value: Number(node.speed) || 0.25 },
              'minecraft:movement.basic': {},
              'minecraft:navigation.walk': { can_path_over_water: true, avoid_water: true },
              'minecraft:attack': { damage: Number(node.damage) || 3 },
              'minecraft:physics': {},
              'minecraft:pushable': { is_pushable: true, is_pushable_by_piston: true },
              'minecraft:nameable': { allow_name_tag_renaming: true },
              'minecraft:collision_box': { width: 0.6, height: 1.8 },
              'minecraft:scale': { value: Number(node.scale) > 0 ? Number(node.scale) : 1 },
              'minecraft:behavior.float': { priority: 0 },
              ...(node.hostile
                ? {
                    'minecraft:behavior.nearest_attackable_target': {
                      priority: 2,
                      entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'player' } }],
                      must_see: true,
                      reselect_target_in_ticks: 20
                    },
                    'minecraft:behavior.hurt_by_target': { priority: 1 },
                    'minecraft:behavior.melee_attack': { priority: 3, speed_multiplier: 1 }
                  }
                : {}),
              'minecraft:behavior.random_stroll': { priority: 4, speed_multiplier: 0.8 },
              'minecraft:behavior.random_look_around': { priority: 6 },
              'minecraft:loot': { table: `loot_tables/entities/${id}.json` },
              'minecraft:despawn': { despawn_from_distance: { min_distance: 48, max_distance: 64 } }
            },
            events: {}
          }
        });
        bp[`loot_tables/entities/${id}.json`] = jsonBytes({ pools: [] });
        rp[`models/entity/${id}.geo.json`] = jsonBytes(humanoidGeometry(id));
        rp[`textures/entity/${id}.png`] = texturePng(skinGridOf(node), 64, 64);
        rp[`entity/${id}.entity.json`] = jsonBytes({
          format_version: '1.10.0',
          'minecraft:client_entity': {
            description: {
              identifier: `${ns}:${id}`,
              materials: { default: 'entity_alphatest' },
              textures: { default: `textures/entity/${id}` },
              geometry: { default: `geo.${id}.geometry` },
              render_controllers: ['controller.render.default'],
              ...(node.spawnEgg
                ? {
                    spawn_egg: {
                      base_color: node.spawnEggBase || '#8a5a3a',
                      overlay_color: node.spawnEggOverlay || '#ff9c3f'
                    }
                  }
                : {})
            }
          }
        });
        rp[`render_controllers/${id}.render_controllers.json`] = jsonBytes({
          format_version: '1.10.0',
          render_controllers: {
            'controller.render.default': {
              geometry: 'Geometry.default',
              materials: [{ '*': 'Material.default' }],
              textures: ['Texture.default']
            }
          }
        });
        break;
      }

      case 'item': {
        bp[`items/${id}.json`] = jsonBytes({
          format_version: '1.21.10',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: { category: node.category || 'items' }
            },
            components: {
              'minecraft:max_stack_size': Number(node.maxStack) || 64,
              'minecraft:display_name': { value: node.name || id },
              'minecraft:icon': `${ns}_${id}`
            }
          }
        });
        rp[`textures/items/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'tool': {
        const kind = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'].includes(node.toolKind)
          ? node.toolKind : 'sword';
        const dur = Number(node.durability) || 264;
        const components = {
          'minecraft:max_stack_size': 1,
          'minecraft:hand_equipped': true,
          'minecraft:durability': { max_durability: dur },
          'minecraft:damage': Number(node.attackDamage) || 1,
          'minecraft:display_name': { value: node.name || id },
          'minecraft:icon': `${ns}_${id}`
        };
        if (kind !== 'sword') {
          components['minecraft:digger'] = {
            use_efficiency: true,
            destroy_speeds: [
              {
                block: {
                  tags: `q.any_tag('minecraft:is_${kind === 'pickaxe' ? 'pickaxe' : kind === 'axe' ? 'axe' : kind === 'shovel' ? 'shovel' : 'hoe'}_item_destructible')`
                },
                speed: Number(node.digSpeed) || 6
              }
            ]
          };
        }
        bp[`items/${id}.json`] = jsonBytes({
          format_version: '1.21.10',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: { category: 'equipment' }
            },
            components
          }
        });
        rp[`textures/items/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'food': {
        bp[`items/${id}.json`] = jsonBytes({
          format_version: '1.21.10',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: { category: 'items' }
            },
            components: {
              'minecraft:max_stack_size': Number(node.maxStack) || 64,
              'minecraft:display_name': { value: node.name || id },
              'minecraft:icon': `${ns}_${id}`,
              'minecraft:use_animation': 'eat',
              'minecraft:use_modifiers': { use_duration: Number(node.useDuration) || 1.6, movement_modifier: 0.35 },
              'minecraft:food': {
                nutrition: Number(node.nutrition) || 4,
                saturation_modifier: Number(node.saturation) || 0.6,
                can_always_eat: !!node.canAlwaysEat
              }
            }
          }
        });
        rp[`textures/items/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'armor': {
        const slot = node.armorSlot || 'chest';
        const slotName = { helmet: 'Helmet', chestplate: 'Chestplate', leggings: 'Leggings', boots: 'Boots' }[slot];
        const iconKey = `${ns}_${id}_${slot}`;
        bp[`items/${id}.json`] = jsonBytes({
          format_version: '1.21.10',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: { category: 'equipment', group: `minecraft:itemGroup.name.${slot}` }
            },
            components: {
              'minecraft:max_stack_size': 1,
              'minecraft:display_name': { value: `${node.name || id} ${slotName}` },
              'minecraft:icon': iconKey,
              'minecraft:wearable': { protection: Number(node.protection) || 1, slot: `slot.armor.${slot}` },
              'minecraft:durability': { max_durability: Number(node.durability) || 300 }
            }
          }
        });
        // 16×16 item icon + a 64×64 armor-layer texture so the piece actually
        // renders on the player model when worn.
        rp[`textures/items/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        rp[`textures/models/armor/${id}.png`] = armorLayerBytes(pixelGridOf(node));
        rp[`attachables/${id}.json`] = jsonBytes({
          format_version: '1.10.0',
          'minecraft:attachable': {
            description: {
              identifier: `${ns}:${id}`,
              materials: { default: 'armor', enchanted: 'armor_enchanted' },
              textures: {
                default: `textures/models/armor/${id}`,
                enchanted: 'textures/misc/enchanted_actor_glint'
              },
              geometry: {
                default: {
                  helmet: 'geometry.humanoid.armor.helmet',
                  chestplate: 'geometry.humanoid.armor.chestplate',
                  leggings: 'geometry.humanoid.armor.leggings',
                  boots: 'geometry.humanoid.armor.boots'
                }[slot]
              },
              scripts: {
                parent_setup: `variable.${slot === 'helmet' ? 'helmet' : slot === 'chestplate' ? 'chest' : slot === 'leggings' ? 'legs' : 'feet'}_layer_visible = 0.0;`
              },
              render_controllers: ['controller.render.armor']
            }
          }
        });
        break;
      }

      case 'ore': {
        const category = node.category || 'nature';
        const drop = String(node.oreDrop || `${ns}:${id}`);
        bp[`blocks/${id}.json`] = jsonBytes({
          format_version: '1.21.0',
          'minecraft:block': {
            description: {
              identifier: `${ns}:${id}`,
              menu_category: {
                category,
                group: 'minecraft:itemGroup.name.' + category
              }
            },
            components: {
              'minecraft:unit_cube': {},
              'minecraft:material_instances': {
                '*': { texture: `${ns}_${id}`, render_method: 'opaque', ambient_occlusion: true }
              },
              'minecraft:destructible_by_mining': { seconds_to_destroy: 3 },
              'minecraft:map_color': '#6a5a2c',
              'minecraft:display_name': `${node.name || id}`
            },
            events: {}
          }
        });
        bp[`loot_tables/blocks/${id}.json`] = jsonBytes({
          pools: [
            {
              rolls: 1,
              entries: [
                {
                  type: 'item',
                  name: drop,
                  weight: 1,
                  functions: [
                    { function: 'set_count', count: Math.max(1, Number(node.oreCount) || 1) }
                  ]
                }
              ]
            }
          ]
        });
        // Smelt the mined drop into an ingot.
        bp[`recipes/${id}_smelt.json`] = jsonBytes({
          format_version: '1.20.10',
          'minecraft:recipe_furnace': {
            description: { identifier: `${ns}:smelt_${id}` },
            tags: ['furnace', 'blast_furnace'],
            input: drop,
            output: String(node.smeltResult || 'minecraft:iron_ingot')
          }
        });
        rp[`textures/blocks/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'texture': {
        const cat = node.textureCategory === 'item' ? 'items' : 'blocks';
        rp[`textures/${cat}/${id}.png`] = texturePng(pixelGridOf(node), 16, 16);
        break;
      }

      case 'recipe': {
        // shaped crafting or smelting recipe
        if (node.recipeKind === 'smelting') {
          bp[`recipes/${id}.json`] = jsonBytes({
            format_version: '1.20.10',
            'minecraft:recipe_furnace': {
              description: { identifier: `${ns}:${id}` },
              tags: ['furnace', 'blast_furnace'],
              input: String(node.smeltInput || 'minecraft:iron_ore'),
              output: String(node.smeltResult || 'minecraft:iron_ingot')
            }
          });
          break;
        }
        // Crafting recipes: empty grid cells become spaces, letters map to
        // ingredients via the node's `ingredients` map (or a sensible default).
        const shape = node.shape || [['A', 'A'], ['A', 'A']];
        const letters = new Set(shape.flat().filter((c) => c && c.trim()));
        const key = {};
        [...letters].forEach((l) => { key[l] = { item: lookupIngredient(node, l) }; });
        bp[`recipes/${id}.json`] = jsonBytes({
          format_version: '1.20.10',
          'minecraft:recipe_shaped': {
            description: { identifier: `${ns}:${id}` },
            tags: ['crafting_table'],
            pattern: shape.map((r) => r.map((c) => (c && c.trim() ? c : ' ')).join('')),
            key,
            unlock: [{ item: 'minecraft:crafting_table' }],
            result: { item: node.resultItem || 'minecraft:diamond', count: Number(node.resultCount) || 1 }
          }
        });
        break;
      }

      default:
        break;
    }

    return { bp, rp };
  },

  /**
   * Assemble a Bedrock add-on.
   * @param {object} project
   * @param {Array} full  full node list
   * @param {string} flavor 'mcaddon' | 'mcpack' | 'resource' | 'behavior'
   * @returns {Promise<File>}
   */
  async pack(project, full, flavor) {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const mkUuid = () =>
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : '11111111-2222-3333-4444-555555555555';
    const rpUuid = project.rpUuid || mkUuid();
    const bpUuid = project.bpUuid || mkUuid();

    // Split every node into BP / RP file maps.
    const bpFiles = {};
    const rpFiles = {};
    full.forEach((node) => {
      const { bp, rp } = bedrockForge.make(node);
      Object.entries(bp).forEach(([p, c]) => { bpFiles[p] = c; });
      Object.entries(rp).forEach(([p, c]) => { rpFiles[p] = c; });
    });

    // Aggregated texture atlases — required for multiple blocks/items to import.
    const terrain = {};
    const items = {};
    full.forEach((node) => {
      const ns = node.namespace || 'fabrica';
      const id = sanitizeId(node.identifier);
      if (node.type === 'block') terrain[`${ns}_${id}`] = `textures/blocks/${id}`;
      else if (node.type === 'item' || node.type === 'tool' || node.type === 'food') items[`${ns}_${id}`] = `textures/items/${id}`;
      else if (node.type === 'armor') {
        // one bedrock item per slot — all render from the same texture art
        const slot = node.armorSlot || 'chest';
        items[`${ns}_${id}_${slot}`] = `textures/items/${id}`;
      }
      else if (node.type === 'ore') terrain[`${ns}_${id}`] = `textures/blocks/${id}`;
      else if (node.type === 'texture') {
        (node.textureCategory === 'item' ? items : terrain)[`${ns}_${id}`] =
          `textures/${node.textureCategory === 'item' ? 'items' : 'blocks'}/${id}`;
      }
    });
    if (Object.keys(terrain).length) {
      rpFiles['textures/terrain_texture.json'] = jsonBytes({
        resource_pack_name: 'vanilla',
        texture_name: 'atlas.terrain',
        padding: 8,
        num_mip_levels: 4,
        texture_data: terrain
      });
    }
    if (Object.keys(items).length) {
      rpFiles['textures/item_texture.json'] = jsonBytes({
        resource_pack_name: 'vanilla',
        texture_name: 'atlas.items',
        texture_data: items
      });
    }

    // min_engine_version must be >= every content file's format_version, or
    // Bedrock silently skips those files on world load (import works, world shows nothing).
    const manifest = (packName, type) => ({
      format_version: 2,
      header: {
        name: packName,
        description: project.description || 'Made with Fabrica',
        uuid: type === 'resources' ? rpUuid : bpUuid,
        version: [1, 0, 0],
        min_engine_version: [1, 21, 10]
      },
      modules: [
        { type: type === 'resources' ? 'resources' : 'data', uuid: mkUuid(), version: [1, 0, 0] }
      ],
      dependencies: type === 'resources'
        ? []
        : [{ uuid: rpUuid, version: [1, 0, 0] }]
    });

    const writeSingle = (folder, files, rootZip = zip) => {
      Object.entries(files).forEach(([p, c]) => {
        const target = folder ? rootZip.folder(folder) : rootZip;
        target.file(p, c);
      });
    };

    if (flavor === 'mcaddon') {
      // One file, two packs — proper .mcaddon layout (manifests at folder roots).
      const bp = zip.folder('BP');
      const rp = zip.folder('RP');
      bp.file('manifest.json', jsonBytes(manifest(`${project.name} Behavior`, 'data')));
      rp.file('manifest.json', jsonBytes(manifest(`${project.name} Resource`, 'resources')));
      bp.file('pack_icon.png', texturePng(checkerGrid(16, 16), 16, 16));
      rp.file('pack_icon.png', texturePng(checkerGrid(16, 16), 16, 16));
      writeSingle('BP', bpFiles, zip);
      writeSingle('RP', rpFiles, zip);
    } else if (flavor === 'resource') {
      // Single resource pack: manifest sits at the ZIP ROOT or Minecraft
      // refuses to import it.
      const root = zip;
      root.file('manifest.json', jsonBytes(manifest(`${project.name} Resource`, 'resources')));
      root.file('pack_icon.png', texturePng(checkerGrid(16, 16), 16, 16));
      writeSingle(null, rpFiles, root);
    } else {
      // Single behavior pack (flavor 'behavior', and legacy 'mcpack'):
      // manifest at the ZIP ROOT.
      const root = zip;
      root.file('manifest.json', jsonBytes(manifest(`${project.name} Behavior`, 'data')));
      root.file('pack_icon.png', texturePng(checkerGrid(16, 16), 16, 16));
      writeSingle(null, bpFiles, root);
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'STORE',
      platform: 'UNIX'
    });
    const ext = flavor === 'mcaddon' ? 'mcaddon' : 'mcpack';
    const sfx = flavor === 'resource' ? '_RP' : flavor === 'behavior' ? '_BP' : '_pack';
    return new File([blob], `${slug(project.name)}${sfx}.${ext}`, { type: 'application/zip' });
  }
};

const slug = (s) =>
  (s || 'fabrica-pack')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'fabrica-pack';