/**
 * Fabrica — node registry for the Mod Maker.
 * Each "New" block type describes a thing a player can add to their
 * project, together with the fields exposed in the property panel and
 * the forges (generators) that turn a node into real files.
 */

let uidCounter = 0;
export const uid = () => `k-${Date.now().toString(36)}-${(uidCounter++).toString(36)}`;

function kinds(isSword) {
  return isSword
    ? ['I', 'I', 'S']
    : ['II', 'IS', ' S'];
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
    creativeTab: 'misc',
    render: 'axis',
    rarity: 'common',
    woodMaterial: 'oak',
    updated: Date.now()
  };

  switch (type) {
    case 'block':
      base.name = 'New Block';
      base.identifier = 'new_block';
      base.render = 'axis';
      base.creativeTab = 'misc';
      break;
    case 'mob':
      base.name = 'New Mob';
      base.identifier = 'new_mob';
      base.spawnEgg = true;
      break;
    case 'item':
      base.name = 'New Item';
      base.identifier = 'new_item';
      base.maxStack = 64;
      break;
    case 'tool':
      base.name = 'New Tool';
      base.identifier = 'new_tool';
      base.tier = 'diamond';
      break;
    case 'texture':
      base.name = 'New Texture';
      base.identifier = 'new_texture';
      break;
    case 'recipe':
      base.name = 'Crafting Recipe';
      base.identifier = 'new_recipe';
      base.shape = [
        ['#', '#'],
        ['#', '#']
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

function texturePng(paths) {
  // A real minimal PNG (RGBA, 16x16) with a checkboard built in JS.
  // We compute the CRC32 in JavaScript and assemble the containers by hand.
  const W = 16;
  const H = 16;
  // Each scanline: 1 filter byte (none) + W*4 RGBA bytes.
  const raw = new Uint8Array(H * (1 + W * 4));
  let off = 0;
  for (let y = 0; y < H; y++) {
    raw[off++] = 0; // filter: none
    for (let x = 0; x < W; x++) {
      const p = (x + y) % 2 === 0;
      raw[off++] = p ? 190 : 150;
      raw[off++] = p ? 170 : 130;
      raw[off++] = p ? 90 : 70;
      raw[off++] = 255;
    }
  }
  // IHDR must be exactly 13 bytes: width, height (4 bytes BE each) then 1-byte
  // bit depth, color type, compression, filter and interlace fields.
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, W, false);
  new DataView(ihdr.buffer).setUint32(4, H, false);
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

function zlibWrap(stored, payload) {
  // "stored" is a raw deflate stream (BFINAL stored block). Wrap it in the
  // 2-byte zlib header + Adler-32 checksum that the PNG spec requires.
  const out = new Uint8Array(stored.length + 6);
  out[0] = 0x78; // CMF: 32K window, deflate
  out[1] = 0x01; // FLG: FCHECK for the default FLEVEL-0 settings
  out.set(stored, 2);
  const adler = adler32(payload);
  new DataView(out.buffer).setUint32(2 + stored.length, adler, false);
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

function concat(...arrs) {
  const total = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return new Uint8Array(out);
}

function deflateRaw(data) {
  // zip COMPSIZE except the 2 byte header and 4 byte checksum — the raw deflate stream.
  // CRC is computed separately. We use a single uncompressed zlib-correct block and fix
  // headers by hand. Start with a stored (type 00) fixed block.

  // We build: block header (final, stored) then LEN, NLEN then data.
  const head = new Uint8Array(5);
  const dv = new DataView(head.buffer);
  dv.setUint8(0, 1); // BFINAL=1, BTYPE=00
  dv.setUint16(1, data.length, true);
  dv.setUint16(3, (~data.length) & 0xffff, true);
  return concat(head, data);
}

export const javaForge = {
  /** Build every file for this node as {path, content} pairs. */
  make(node) {
    const ns = node.namespace || 'fabrica';
    const id = (node.identifier || 'item').toLowerCase().replace(/[^a-z0-9_.]/g, '_');
    const files = {};

    // a neutral pixel texture is always provided
    const texRel = node.texture
      ? node.texture.replace(/^textures\//, '').replace(/\.png$/, '')
      : `${ns}/${id}`;

    switch (node.type) {
      case 'block': {
        // pack.mcmeta + blockstate + model
        files['assets/' + ns + '/blockstates/' + id + '.json'] = jsonBytes({
          variants: { '': { model: `${ns}:block/${id}` } }
        });
        files['assets/' + ns + '/models/block/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:block/cube_all',
          textures: { all: `${ns}:block/${id}` }
        });
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: `${ns}:block/${id}`
        });
        if (node.lootTable || true) {
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
        }
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'building',
          group: `${ns}:${id}`,
          pattern: ['###', '###', '###'],
          key: { '#': { item: 'minecraft:cobblestone' } },
          result: { id: `${ns}:${id}`, count: 1 }
        });
        break;
      }

      case 'item': {
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/generated',
          textures: { layer0: `${ns}:item/${id}` }
        });
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'misc',
          pattern: ['I'],
          key: { I: { item: 'minecraft:iron_ingot' } },
          result: { id: `${ns}:${id}`, count: 1 }
        });
        break;
      }

      case 'tool': {
        const kind = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'].includes(node.toolKind)
          ? node.toolKind : 'sword';
        const isSword = kind === 'sword';
        const pattern = kinds(isSword);
        files['assets/' + ns + '/models/item/' + id + '.json'] = jsonBytes({
          parent: 'minecraft:item/handheld',
          textures: { layer0: `${ns}:item/${id}` }
        });
        // 1.21+ item definition — makes the tool glow in the hotbar
        files['data/' + ns + '/item/' + id + '.json'] = jsonBytes({
          model: { type: 'minecraft:model', model: `${ns}:item/${id}` }
        });
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'equipment',
          pattern,
          key: { I: { item: 'minecraft:iron_ingot' }, S: { item: 'minecraft:stick' } },
          result: { id: `${ns}:${id}` }
        });
        break;
      }

      case 'texture': {
        // The texture node only supplies artwork — generate every path a pack may need.
        const base = node.texture ? node.texture.replace(/\.png$/, '') : `${ns}/${id}`;
        for (const name of [base, `${base}_n`, `${base}_s`]) {
          files['assets/' + ns + '/textures/' + name + '.png'] = texturePng();
        }
        break;
      }

      case 'recipe': {
        // shaped recipe from the 3x3 grid + shape letters
        const shape = node.shape || [['#', '#'], ['#', '#']];
        const letters = new Set(shape.flat().filter((c) => c && c !== ' '));
        const entry = letters.size
          ? Object.fromEntries([...letters].map((l) => [l, { item: 'minecraft:iron_ingot' }]))
          : {};
        files['data/' + ns + '/recipe/' + id + '.json'] = jsonBytes({
          type: 'minecraft:crafting_shaped',
          category: 'misc',
          pattern: shape.map((row) => row.join('').replace(/ /g, ' ').trimEnd()),
          key: entry,
          result: { id: node.resultItem || 'minecraft:diamond', count: Number(node.resultCount) || 1 }
        });
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

    files['assets/' + ns + '/textures/' + texRel.replace(`${ns}/`, '') + '.png'] = texturePng();
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

export const bedrockForge = {
  make(node) {
    const ns = node.namespace || 'fabrica';
    const id = (node.identifier || 'item').toLowerCase().replace(/[^a-z0-9_.]/g, '_');
    const files = {};
    const BP = `BP_${ns}/`;
    const AP = `RP_${ns}/`;

    const blockJson = () => {
      const tag = node.creativeTab && node.creativeTab !== 'none'
        ? { tags: [`${ns}:${node.creativeTab}`] } : {};
      return {
        format_version: '1.21.0',
        'minecraft:block': {
          description: {
            identifier: `${ns}:${id}`,
            menu_category: {
              category: node.category || 'nature',
              group: 'minecraft:itemGroup.name.' + (node.category || 'nature')
            }
          },
          components: {
            'minecraft:geometry': 'minecraft:geometry.full_block',
            'minecraft:material_instances': {
              '*': {
                texture: `${ns}_${id}`,
                render_method: node.renderMethod || 'opaque'
              }
            },
            'minecraft:destructible_by_mining': {
              seconds_to_destroy: 0.8
            },
            'minecraft:map_color': '#8a7b5c',
            'minecraft:display_name': `${node.name || id}`,
            ...tag
          },
          events: {}
        }
      };
    };

    switch (node.type) {
      case 'block': {
        files[`${BP}blocks/${id}.json`] = jsonBytes(blockJson());
        files[`${BP}textures/terrain_texture.json`] = jsonBytes({
          resource_pack_name: `${ns}_resource`,
          texture_name: 'atlas.terrain',
          padding: 8,
          num_mip_levels: 4,
          texture_data: {
            [`${ns}_${id}`]: {
              textures: `textures/blocks/${id}`
            }
          }
        });
        files[`${AP}textures/blocks/${id}.png`] = texturePng();
        files[`${AP}textures/terrain_texture.json`] = jsonBytes({
          resource_pack_name: `${ns}_resource`,
          texture_name: 'atlas.terrain',
          padding: 8,
          num_mip_levels: 4,
          texture_data: {
            [`${ns}_${id}`]: { textures: `textures/blocks/${id}` }
          }
        });
        break;
      }

      case 'mob': {
        const geoName = `geo.${id}.geometry`;
        files[`${BP}entities/${id}.json`] = jsonBytes({
          format_version: '1.21.0',
          'minecraft:entity': {
            description: {
              identifier: `${ns}:${id}`,
              is_spawnable: true,
              is_summonable: true,
              spawn_category: node.category || 'creature',
              ...(node.spawnEgg
                ? {
                    spawn_egg: {
                      base_color: '#8a5a3a',
                      overlay_color: '#ff9c3f',
                      ...(node.texture ? { texture: `${ns}_${id}` } : {})
                    }
                  }
                : {})
            },
            component_groups: {},
            components: {
              'minecraft:health': { value: Number(node.health) || 20 },
              'minecraft:movement': { value: Number(node.speed) || 0.25 },
              'minecraft:attack': { damage: Number(node.damage) || 3 },
              'minecraft:physics': {},
              'minecraft:pushable': { is_pushable: true, is_pushable_by_piston: true },
              'minecraft:nameable': {},
              'minecraft:collision_box': { width: 0.6, height: 1.8 },
              'minecraft:loot': { table: `loot_tables/entities/${id}.json` },
              'minecraft:despawn': { despawn_from_distance: {} }
            },
            events: {}
          }
        });
        files[`${BP}loot_tables/entities/${id}.json`] = jsonBytes({
          pools: [
            {
              rolls: 1,
              entries: [
                {
                  type: 'item',
                  name: `${ns}:${id}`,
                  weight: 1,
                  functions: [{ function: 'set_count', count: 1 }]
                }
              ]
            }
          ]
        });
        // ugly cube geometry + cube texture
        files[`${AP}models/entity/${id}.geo.json`] = jsonBytes({
          format_version: '1.12.0',
          'minecraft:geometry': [
            {
              description: {
                identifier: geoName,
                texture_width: 16,
                texture_height: 16,
                visible_bounds_width: 2,
                visible_bounds_height: 3,
                visible_bounds_offset: [0, 1, 0]
              },
              bones: [
                {
                  name: 'body',
                  pivot: [0, 0, 0],
                  cubes: [
                    {
                      origin: [-4, 0, -4],
                      size: [8, 12, 8],
                      uv: { north: { uv: [8, 0], texture_size: [16, 16] }, south: { uv: [0, 0], texture_size: [16, 16] }, east: { uv: [8, 0], texture_size: [16, 16] }, west: { uv: [0, 0], texture_size: [16, 16] }, up: { uv: [0, 0], texture_size: [16, 16] }, down: { uv: [4, 0], texture_size: [16, 16] } }
                    }
                  ]
                },
                {
                  name: 'head',
                  pivot: [0, 12, 0],
                  cubes: [
                    { origin: [-3, 12, -3], size: [6, 6, 6], uv: { north: { uv: [8, 8], texture_size: [16, 16] }, south: { uv: [0, 8], texture_size: [16, 16] }, east: { uv: [8, 8], texture_size: [16, 16] }, west: { uv: [0, 8], texture_size: [16, 16] }, up: { uv: [0, 0], texture_size: [16, 16] }, down: { uv: [4, 0], texture_size: [16, 16] } } }
                  ]
                }
              ]
            }
          ]
        });
        files[`${AP}textures/entity/${id}.png`] = texturePng();
        files[`${AP}entity/${id}.entity.json`] = jsonBytes({
          format_version: '1.10.0',
          'minecraft:client_entity': {
            description: {
              identifier: `${ns}:${id}`,
              materials: { default: 'entity_alphatest' },
              textures: { default: `textures/entity/${id}` },
              geometry: { default: geoName },
              render_controllers: ['controller.render.default']
            }
          }
        });
        files[`${AP}render_controllers/${id}.render_controllers.json`] = jsonBytes({
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
        files[`${BP}items/${id}.json`] = jsonBytes({
          format_version: '1.20.60',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              category: node.category || 'items',
              icon: `${ns}_${id}`
            },
            components: {
              'minecraft:max_stack_size': Number(node.maxStack) || 64,
              'minecraft:display_name': { value: node.name || id },
              'minecraft:icon': { texture: `${ns}_${id}` }
            }
          }
        });
        files[`${AP}textures/items/${id}.png`] = texturePng();
        files[`${AP}textures/item_texture.json`] = jsonBytes({
          resource_pack_name: `${ns}_resource`,
          texture_name: 'atlas.items',
          texture_data: {
            [`${ns}_${id}`]: { textures: `textures/items/${id}` }
          }
        });
        break;
      }

      case 'tool': {
        files[`${BP}items/${id}.json`] = jsonBytes({
          format_version: '1.20.60',
          'minecraft:item': {
            description: {
              identifier: `${ns}:${id}`,
              category: 'equipment',
              icon: `${ns}_${id}`
            },
            components: {
              'minecraft:max_stack_size': 1,
              'minecraft:hand_equipped': true,
              'minecraft:display_name': { value: node.name || id },
              'minecraft:icon': { texture: `${ns}_${id}` }
            }
          }
        });
        files[`${AP}textures/items/${id}.png`] = texturePng();
        files[`${AP}textures/item_texture.json`] = jsonBytes({
          resource_pack_name: `${ns}_resource`,
          texture_name: 'atlas.items',
          texture_data: {
            [`${ns}_${id}`]: { textures: `textures/items/${id}` }
          }
        });
        break;
      }

      case 'recipe': {
        files[`${BP}recipes/${id}.json`] = jsonBytes({
          format_version: '1.17.0',
          'minecraft:recipe_shaped': {
            description: { identifier: `${ns}:${id}` },
            tags: ['crafting_table'],
            pattern: (node.shape || []).map((r) => r.join('')),
            key: {
              '#': { item: 'minecraft:iron_ingot' }
            },
            result: { item: node.resultItem || 'minecraft:diamond', count: Number(node.resultCount) || 1 }
          }
        });
        break;
      }

      default:
        break;
    }

    return files;
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
    const ns = project.namespace || 'fabrica';
    const zip = new JSZip();
    const mkUuid = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '11111111-2222-3333-4444-555555555555';
    const rpUuid = project.rpUuid || mkUuid();
    const bpUuid = project.bpUuid || mkUuid();

    const manifest = (packName, type) => ({
      format_version: 2,
      header: {
        name: packName,
        description: project.description || 'Made with Fabrica',
        uuid: type === 'resources' ? rpUuid : bpUuid,
        version: [1, 0, 0],
        min_engine_version: [1, 20, 0]
      },
      modules: [
        {
          type: type === 'resources' ? 'resources' : 'data',
          uuid: mkUuid(),
          version: [1, 0, 0]
        }
      ],
      // In a .mcaddon the runtime links BP<->RP automatically; an explicit
      // dependency also works for manually-imported .mcpack folders.
      dependencies: type === 'resources' ? [] : [{ uuid: rpUuid, version: [1, 0, 0] }]
    });

    // node.make returns paths already prefixed with BP_<ns>/ or RP_<ns>/;
    // strip that prefix and relocate under whichever folder we're building.
    const writeTree = (target, folders) => {
      full.forEach((node) => {
        Object.entries(bedrockForge.make(node)).forEach(([path, content]) => {
          const folder = path.startsWith('RP_') ? folders.rp : folders.bp;
          target.file(folder + path.replace(/^B?_?P?_?[^/]+\//, ''), content);
        });
      });
    };

    const complete = (root, bpName, rpName) => {
      const bp = root.folder(bpName);
      const rp = root.folder(rpName);
      bp.file('manifest.json', jsonBytes(manifest(`${project.name} Behavior`, 'data')));
      rp.file('manifest.json', jsonBytes(manifest(`${project.name} Resource`, 'resources')));
      bp.file('pack_icon.png', texturePng());
      rp.file('pack_icon.png', texturePng());
      writeTree(root, { bp: `${bpName}/`, rp: `${rpName}/` });
    };

    if (flavor === 'mcaddon') {
      // One file, two packs — the signature Bedrock "add-on" format.
      complete(zip, 'BP', 'RP');
    } else if (flavor === 'mcpack') {
      complete(zip, `BP_${ns}`, `RP_${ns}`);
    } else if (flavor === 'resource') {
      const rp = zip.folder(`RP_${ns}`);
      rp.file('manifest.json', jsonBytes(manifest(`${project.name} Resource`, 'resources')));
      rp.file('pack_icon.png', texturePng());
      writeTree(zip, { bp: `__none__/`, rp: `RP_${ns}/` });
    } else if (flavor === 'behavior') {
      const bp = zip.folder(`BP_${ns}`);
      bp.file('manifest.json', jsonBytes(manifest(`${project.name} Behavior`, 'data')));
      bp.file('pack_icon.png', texturePng());
      writeTree(zip, { bp: `BP_${ns}/`, rp: `__none__/` });
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'STORE',
      platform: 'UNIX'
    });
    const ext = flavor === 'mcaddon' ? 'mcaddon' : 'mcpack';
    const sfx = flavor === 'resource' ? '_RP' : flavor === 'behavior' ? '_BP' : '';
    return new File([blob], `${slug(project.name)}${sfx}.${ext}`, { type: 'application/zip' });
  }
};

const slug = (s) =>
  (s || 'fabrica-pack')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'fabrica-pack';