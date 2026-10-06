import { useEffect, useMemo, useRef, useState } from 'react';
import { makeNode, nodeByType, javaForge, bedrockForge, NODE_TYPES as NODES_LIST } from '../nodeRegistry.jsx';
import './maker.css';

const EDITIONS = [
  {
    id: 'java',
    name: 'Java Edition',
    ext: '.zip',
    extNote: 'Data pack for worlds & servers',
    blurb: 'Pure vanilla JSON. Drop the .zip into a world’s datapacks folder.',
    accent: 'java'
  },
  {
    id: 'bedrock',
    name: 'Bedrock Edition',
    ext: '.mcaddon',
    extNote: 'or .mcpack · for mobile, console & Windows',
    blurb: 'Behavior + resource packs bundled into importable add-on files.',
    accent: 'bedrock'
  }
];

export default function Maker() {
  const [project, setProject] = useState(() => loadProject());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const updateProject = (patch) => setProject((p) => ({ ...p, ...patch }));
  const updateNode = (id, patch) =>
    setProject((p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === id ? { ...n, ...patch, updated: Date.now() } : n))
    }));
  const addNode = (type) => {
    const node = makeNode(type, project.edition);
    setProject((p) => ({ ...p, nodes: [...p.nodes, node] }));
  };
  const removeNode = (id) =>
    setProject((p) => ({ ...p, nodes: p.nodes.filter((n) => n.id !== id) }));

  const canExport = project.name.trim() && project.description.trim() && project.owner.trim();

  const freshProject = (edition) => ({
    name: '',
    description: '',
    owner: '',
    namespace: 'fabrica',
    edition,
    createdAt: Date.now(),
    nodes: []
  });

  return (
    <div className="maker">
      {!project.nodes.length && !project.name && (
        <EmptyState onCreate={() => setCreating(true)} onRestore={project.nodes.length ? null : null} />
      )}

      {project.name && (
        <Studio
          project={project}
          updateProject={updateProject}
          updateNode={updateNode}
          addNode={addNode}
          removeNode={removeNode}
          canExport={canExport}
          onNewProject={() => setCreating(true)}
        />
      )}

      {creating && (
        <CreateModal
          initialEdition={project.edition}
          onClose={() => setCreating(false)}
          onCreate={(edition, meta) => {
            const p = freshProject(edition);
            p.name = meta.name.trim();
            p.description = meta.description.trim();
            p.owner = meta.owner.trim();
            setProject(p);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- persistence ---------- */

const STORAGE_KEY = 'fabrica-project-v1';

function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: '', description: '', owner: '', namespace: 'fabrica', edition: 'java', createdAt: 0, nodes: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes)) {
      return { name: '', description: '', owner: '', namespace: 'fabrica', edition: 'java', createdAt: 0, nodes: [] };
    }
    return parsed;
  } catch {
    return { name: '', description: '', owner: '', namespace: 'fabrica', edition: 'java', createdAt: 0, nodes: [] };
  }
}

function saveProject(project) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

/* ---------- empty state ---------- */

function EmptyState({ onCreate }) {
  return (
    <section className="maker-empty">
      <div className="container empty-inner">
        <span className="chip java"><span className="dot java" /> Forge station online</span>
        <h1 className="pixel">
          Design your first <span className="font-java">block</span>{' '}
          <span className="font-bedrock">or</span> <span className="font-java">mob</span>.
        </h1>
        <p className="empty-lede">
          Fabrica’s Mod Maker builds real Minecraft files as you work. Choose an edition,
          give your project a name, description and owner — then start dropping “New” blocks
          onto the forge table.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onCreate}>
          ⚒ Create a project
        </button>
      </div>
    </section>
  );
}

/* ---------- create modal ---------- */

function CreateModal({ initialEdition, onClose, onCreate }) {
  const [edition, setEdition] = useState(initialEdition || 'java');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [touched, setTouched] = useState({ name: false, description: false, owner: false });

  const valid = { name: name.trim().length > 0, description: description.trim().length > 0, owner: owner.trim().length > 0 };
  const allValid = valid.name && valid.description && valid.owner;

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true, owner: true });
    if (!allValid) return;
    onCreate(edition, { name, description, owner });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal anim-pop" role="dialog" aria-modal="true" aria-label="Create project">
        <div className="modal-head">
          <div>
            <span className="eyebrow">New project</span>
            <h2 className="pixel">Forge a new mod</h2>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="edition-picker" role="radiogroup" aria-label="Minecraft edition">
            {EDITIONS.map((ed) => (
              <button
                key={ed.id}
                type="button"
                role="radio"
                aria-checked={edition === ed.id}
                className={`edition-opt ${edition === ed.id ? 'sel accent-' + ed.accent : ''}`}
                onClick={() => setEdition(ed.id)}
              >
                <span className={`dot ${ed.accent}`} />
                <span className="edition-opt-main">
                  <b>{ed.name}</b>
                  <span className="term edition-opt-ext">{ed.ext} {ed.id === 'bedrock' && '· .mcpack'}</span>
                </span>
                <span className="edition-opt-note">{ed.blurb}</span>
              </button>
            ))}
          </div>

          <div className={`field ${touched.name && !valid.name ? 'invalid' : ''}`}>
            <label htmlFor="p-name">Name <span className="req">*</span></label>
            <input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g. Ruby Ores & Golems"
              autoFocus
            />
            {touched.name && !valid.name && <span className="err">Give your mod a name — your pack folder and file will be named after it.</span>}
          </div>

          <div className={`field ${touched.description && !valid.description ? 'invalid' : ''}`}>
            <label htmlFor="p-desc">Description <span className="req">*</span></label>
            <textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, description: true }))}
              placeholder="What does your mod do? This lands in pack.mcmeta and manifest.json."
            />
            {touched.description && !valid.description && <span className="err">Add a short description so players know what they’re installing.</span>}
          </div>

          <div className={`field ${touched.owner && !valid.owner ? 'invalid' : ''}`}>
            <label htmlFor="p-owner">Owner <span className="req">*</span></label>
            <input
              id="p-owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, owner: true }))}
              placeholder="Your name or studio — Silver Dev Studios"
            />
            {touched.owner && !valid.owner && <span className="err">Tell us who owns this creation.</span>}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${edition === 'bedrock' ? 'btn-bed' : 'btn-primary'} btn-lg`}>
              ⚒ Forge it
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- studio ---------- */

function Studio({ project, updateProject, updateNode, addNode, removeNode, canExport, onNewProject }) {
  const [selectedId, setSelectedId] = useState(project.nodes[0]?.id || null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);

  const selected = project.nodes.find((n) => n.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !project.nodes.some((n) => n.id === selectedId)) {
      setSelectedId(project.nodes[0]?.id || null);
    }
  }, [project.nodes, selectedId]);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3200);
  };

  const stats = useMemo(() => {
    const counts = {};
    project.nodes.forEach((n) => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return { total: project.nodes.length, counts };
  }, [project.nodes]);

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const doExport = async (flavor) => {
    if (!canExport || busy) return;
    setBusy(true);
    try {
      let file;
      if (project.edition === 'java') {
        file = await javaForge.pack(project, project.nodes);
      } else if (flavor === 'mcaddon') {
        file = await bedrockForge.pack(project, project.nodes, 'mcaddon');
      } else if (flavor === 'behavior') {
        file = await bedrockForge.pack(project, project.nodes, 'behavior');
      } else {
        file = await bedrockForge.pack(project, project.nodes, 'resource');
      }
      downloadFile(file);
      showToast(`⛏ Exported ${file.name} — go install it!`);
    } catch (err) {
      console.error(err);
      showToast('⚠ Export failed. Check your identifiers and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (type) => {
    addNode(type);
    setPaletteOpen(false);
    showToast(`${nodeByType(type).icon} ${nodeByType(type).label} added to the forge table`);
  };

  return (
    <div className="studio">
      <StudioToolbar
        project={project}
        updateProject={updateProject}
        stats={stats}
        canExport={canExport}
        onNewProject={onNewProject}
        onExportJava={() => doExport('zip')}
        onExportMcaddon={() => doExport('mcaddon')}
        onExportMcpack={() => doExport('behavior')}
        onExportRp={() => doExport('resource')}
        busy={busy}
      />

      <div className="studio-body container">
        <aside className="forge-panel">
          <div className="forge-panel-head">
            <span className="pixel forge-panel-title">FORGE TABLE</span>
            <span className="term forge-count">{stats.total} node{stats.total === 1 ? '' : 's'}</span>
          </div>

          <button className="new-block-btn btn" onClick={() => setPaletteOpen((o) => !o)}>
            <span className="new-block-plus">+</span>
            <span>
              <b>New</b>
              <span className="term new-block-sub">add a block, mob, tool…</span>
            </span>
            <span className={`term new-block-caret ${paletteOpen ? 'open' : ''}`}>▾</span>
          </button>

          {paletteOpen && (
            <div className="palette anim-pop">
              <span className="term palette-hint">CHOOSE A NODE TYPE</span>
              <div className="palette-grid">
                {NODES_LIST.map((t) => (
                  <button key={t.type} className="palette-item" onClick={() => handleAdd(t.type)}>
                    <span className="palette-icon" style={{ background: t.gradient }}>{t.icon}</span>
                    <span className="palette-text">
                      <b>{t.label}</b>
                      <span className="term">{t.tagline}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="node-list">
            {project.nodes.map((n) => (
              <button
                key={n.id}
                className={`node-chip ${selectedId === n.id ? 'sel' : ''}`}
                onClick={() => setSelectedId(n.id)}
              >
                <span className="node-chip-icon" style={{ background: nodeByType(n.type)?.gradient }}>
                  {nodeByType(n.type)?.icon}
                </span>
                <span className="node-chip-text">
                  <span className="node-chip-name">{n.name || nodeByType(n.type)?.label}</span>
                  <span className="term node-chip-id">{n.identifier || n.type}</span>
                </span>
                <span
                  className="node-chip-del"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); removeNode(n.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeNode(n.id); } }}
                  aria-label={`Delete ${n.name}`}
                >
                  ✕
                </span>
              </button>
            ))}

            {!project.nodes.length && (
              <p className="term node-list-empty">
                Forge table is clear — hit “New” above to drop your first node.
              </p>
            )}
          </div>

          <div className="forge-panel-foot term">
            <span className={`dot ${project.edition === 'java' ? 'java' : 'bedrock'}`} />
            {project.edition === 'java'
              ? 'Exporting as a .zip data pack'
              : 'Exporting as .mcaddon / .mcpack'}
          </div>
        </aside>

        <section className="node-editor">
          {selected ? (
            <NodeEditor
              key={selected.id}
              node={selected}
              update={updateNode}
              remove={removeNode}
              project={project}
            />
          ) : (
            <NodeEditorEmpty onAdd={() => setPaletteOpen(true)} />
          )}
        </section>
      </div>

      {toast && <div className="toast anim-pop">{toast}</div>}
    </div>
  );
}

/* ---------- toolbar ---------- */

function ExportMenu({ canExport, busy, edition, onJava, onMcaddon, onMcpackBehavior, onMcpackResource }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const items = [];
  if (edition === 'java') {
    items.push({ label: 'Data pack', note: '.zip — world/datapacks/', color: 'java', action: onJava });
  } else {
    items.push({ label: 'Add-on (both packs)', note: '.mcaddon — share one file', color: 'bedrock', action: onMcaddon });
    items.push({ label: 'Behavior pack only', note: '.mcpack — what things DO', color: 'bedrock', action: onMcpackBehavior });
    items.push({ label: 'Resource pack only', note: '.mcpack — how things LOOK', color: 'bedrock', action: onMcpackResource });
  }

  return (
    <div className="export-menu" ref={ref}>
      <button
        className={`btn ${edition === 'java' ? 'btn-primary' : 'btn-bed'}`}
        disabled={!canExport || busy}
        onClick={() => setOpen((o) => !o)}
      >
        {busy ? '⏳ Forging…' : '⬇ Export'}
        <span className="term caret">▾</span>
      </button>
      {open && (
        <div className="export-dropdown anim-pop">
          {items.map((it) => (
            <button key={it.label} className="export-item" onClick={() => { setOpen(false); it.action(); }}>
              <span className={`dot ${it.color}`} />
              <span>
                <b>{it.label}</b>
                <span className="term">{it.note}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StudioToolbar({ project, updateProject, stats, canExport, onNewProject, onExportJava, onExportMcaddon, onExportMcpack, onExportRp, busy }) {
  return (
    <div className="studio-bar">
      <div className="container studio-bar-inner">
        <div className="studio-meta">
          <span className="studio-edition chip java">
            <span className="dot java" /> {project.edition === 'java' ? 'JAVA EDITION' : 'BEDROCK EDITION'}
          </span>
          <div className="studio-title">
            <span className="pixel">{project.name}</span>
            <span className="term studio-owner">by {project.owner} · {stats.total} node{stats.total === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="studio-actions">
          <button className="btn btn-ghost btn-sm" onClick={onNewProject} title="Start a new project">
            ＋ New project
          </button>
          <ExportMenu
            canExport={canExport}
            busy={busy}
            edition={project.edition}
            onJava={onExportJava}
            onMcaddon={onExportMcaddon}
            onMcpackBehavior={onExportMcpack}
            onMcpackResource={onExportRp}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- node editor ---------- */

function Field({ label, hint, invalid, error, children }) {
  return (
    <div className={`field ${invalid ? 'invalid' : ''}`}>
      <label>{label}</label>
      {children}
      {hint && !invalid && <span className="hint">{hint}</span>}
      {invalid && error && <span className="err">{error}</span>}
    </div>
  );
}

const SectionTitle = ({ children }) => (
  <div className="nodepane-section-title term">{children}</div>
);

function NodeEditor({ node, update, remove, project }) {
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef(null);

  // little "saved" flash after every update
  useEffect(() => {
    setSaved(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaved(false), 700);
  }, [node.updated]);

  const set = (patch) => update(node.id, patch);

  const idOk = /^[a-z0-9_.]+$/.test((node.identifier || '').trim());

  const common = (
    <>
      <SectionTitle>Identity</SectionTitle>
      <Field label="Name" hint="Shown in menus, descriptions and file names.">
        <input value={node.name || ''} onChange={(e) => set({ name: e.target.value })} placeholder="Ruby Ore" />
      </Field>
      <Field
        label="Identifier"
        hint="Lowercase namespace:name. Spaces become underscores."
        invalid={!!node.identifier && !idOk}
        error="Only lowercase letters, numbers, dots and underscores."
      >
        <input value={node.identifier || ''} onChange={(e) => set({ identifier: e.target.value })} placeholder={project.namespace + ':ruby_ore'} />
      </Field>
    </>
  );

  const specific = <NodeSpecific node={node} set={set} project={project} />;

  return (
    <div className="node-pane">
      <div className="node-pane-head">
        <span className="node-pane-ico" style={{ background: nodeByType(node.type)?.gradient }}>
          {nodeByType(node.type)?.icon}
        </span>
        <div className="node-pane-titles">
          <span className="term node-pane-type">{nodeByType(node.type)?.label}</span>
          <span className="pixel node-pane-name">{node.name || 'Untitled Node'}</span>
        </div>
        <span className={`saved-flash ${saved ? 'on' : ''}`}>✓ saved</span>
        <button
          className="node-delete"
          onClick={() => remove(node.id)}
          title="Delete node"
        >
          ✕
        </button>
      </div>

      <div className="node-pane-body">
        {common}
        {specific}
      </div>

      <div className="node-pane-foot term">
        <span className={`dot ${node.edition === 'java' ? 'java' : 'bedrock'}`} />
        {node.edition === 'java' ? node.type + ' · java data' : node.type + ' · bedrock behavior'}
        <span className="foot-spacer" />
        {project.namespace}:{node.identifier || 'untitled'}
      </div>
    </div>
  );
}

const TIERS = ['wooden', 'stone', 'iron', 'gold', 'diamond', 'netherite'];
const TOOL_KINDS = ['sword', 'pickaxe', 'axe', 'shovel', 'hoe'];

function NodeSpecific({ node, set, project }) {
  switch (node.type) {
    case 'block':
      return (
        <>
          <SectionTitle>Block behaviour</SectionTitle>
          <Field label="Texture path" hint="Without the .png. Defaults to textures/&lt;namespace&gt;/&lt;id&gt;.">
            <input value={node.texture || ''} onChange={(e) => set({ texture: e.target.value })} placeholder="textures/blocks/ruby_ore" />
          </Field>
          <Field label="Render method (Bedrock)" hint="opaque, alpha_test (cutout) or blends for glass.">
            <select value={node.renderMethod || 'opaque'} onChange={(e) => set({ renderMethod: e.target.value })}>
              <option value="opaque">opaque — solid block</option>
              <option value="alpha_test">alpha_test — cutout (leaves, bars)</option>
              <option value="blend">blend — translucent (glass, water)</option>
            </select>
          </Field>
          <Field label="Creative category">
            <select value={node.category || 'nature'} onChange={(e) => set({ category: e.target.value })}>
              {['construction', 'nature', 'equipment', 'items', 'none'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </>
      );

    case 'mob':
      return (
        <>
          <SectionTitle>Combat & movement</SectionTitle>
          <Field label="Health" hint="1 point = half a heart. Default 20 = 10 hearts.">
            <input type="number" min="1" value={node.health} onChange={(e) => set({ health: e.target.value })} />
          </Field>
          <Field label="Attack damage" hint="How many hearts of damage it deals.">
            <input type="number" min="0" value={node.damage} onChange={(e) => set({ damage: e.target.value })} />
          </Field>
          <Field label="Movement speed" hint="Vanilla player ≈ 0.1, zombie ≈ 0.23.">
            <input type="number" min="0" step="0.01" value={node.speed} onChange={(e) => set({ speed: e.target.value })} />
          </Field>
          <SectionTitle>Spawning</SectionTitle>
          <label className="toggle-row">
            <input type="checkbox" checked={!!node.spawnEgg} onChange={(e) => set({ spawnEgg: e.target.checked })} />
            <span>Give it a spawn egg</span>
          </label>
        </>
      );

    case 'item':
      return (
        <>
          <SectionTitle>Item properties</SectionTitle>
          <Field label="Max stack size">
            <select value={node.maxStack} onChange={(e) => set({ maxStack: Number(e.target.value) })}>
              {[1, 16, 64].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Creative category">
            <select value={node.category || 'items'} onChange={(e) => set({ category: e.target.value })}>
              {['items', 'equipment', 'nature', 'construction'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </>
      );

    case 'tool':
      return (
        <>
          <SectionTitle>Tool type</SectionTitle>
          <Field label="Kind of tool">
            <select value={node.toolKind || 'sword'} onChange={(e) => set({ toolKind: e.target.value })}>
              {TOOL_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Material tier">
            <select value={node.tier || 'iron'} onChange={(e) => set({ tier: e.target.value })}>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Texture path">
            <input value={node.texture || ''} onChange={(e) => set({ texture: e.target.value })} placeholder="textures/item/ruby_sword" />
          </Field>
        </>
      );

    case 'texture':
      return (
        <>
          <SectionTitle>Texture artwork</SectionTitle>
          <Field label="Texture path" hint="Generated placeholder pixels to start; swap in your own .png later.">
            <input value={node.texture || ''} onChange={(e) => set({ texture: e.target.value })} placeholder="textures/blocks/ruby_ore" />
          </Field>
          <div className="texpreview">
            <PixelTexture seed={node.texture || node.id} />
            <div>
              <b>16×16 placeholder</b>
              <span className="term">A real PNG with an RGBA checkerboard lands in your pack so nothing is ever missing.</span>
            </div>
          </div>
        </>
      );

    case 'recipe':
      return (
        <>
          <SectionTitle>Shaped recipe</SectionTitle>
          <RecipeGrid node={node} set={set} />
          <Field label="Result item" hint="Identifier of what this crafts onto.">
            <input value={node.resultItem || 'minecraft:diamond'} onChange={(e) => set({ resultItem: e.target.value })} placeholder="minecraft:diamond" />
          </Field>
          <Field label="Amount">
            <input type="number" min="1" value={node.resultCount || 1} onChange={(e) => set({ resultCount: e.target.value })} />
          </Field>
        </>
      );

    case 'loot':
      return (
        <>
          <SectionTitle>Loot table</SectionTitle>
          <Field label="Rolls">
            <input type="number" min="1" value={node.rolls} onChange={(e) => set({ rolls: e.target.value })} />
          </Field>
          <Field label="Dropped item">
            <input value={node.dropItem || project.namespace + ':item'} onChange={(e) => set({ dropItem: e.target.value })} />
          </Field>
        </>
      );

    case 'command':
      return (
        <>
          <SectionTitle>Function commands</SectionTitle>
          <Field label="Run on load" hint="One command per line — written to a .mcfunction.">
            <textarea
              value={(node.lines || []).join('\n')}
              onChange={(e) => set({ lines: e.target.value.split('\n') })}
              rows={6}
              placeholder={'give @p diamond 1\nsay Hi from ' + project.name}
            />
          </Field>
        </>
      );

    case 'advancement':
      return (
        <>
          <SectionTitle>Advancement</SectionTitle>
          <Field label="Icon item">
            <input value={node.iconItem || 'minecraft:stone'} onChange={(e) => set({ iconItem: e.target.value })} />
          </Field>
          <Field label="Frame">
            <select value={node.frame || 'task'} onChange={(e) => set({ frame: e.target.value })}>
              {['task', 'goal', 'challenge'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </>
      );

    case 'sound':
      return (
        <>
          <SectionTitle>Sound pack</SectionTitle>
          <Field label="Sound id" hint="Referenced from events as namespace:id.">
            <input value={node.identifier || ''} onChange={(e) => set({ identifier: e.target.value })} placeholder={project.namespace + ':ambient' } />
          </Field>
          <p className="ghost node-note">
            A placeholder .ogg ships in your pack. Swapping in the real audio is as easy as
            replacing the file inside the archive.
          </p>
        </>
      );

    case 'structure':
      return (
        <>
          <SectionTitle>Structure</SectionTitle>
          <p className="ghost node-note">
            Structure nodes add an empty .nbt placeholder to your data pack. Drop a real
            structure file in the same path (.minecraft/generated / structure block output)
            and it will be picked up.
          </p>
        </>
      );

    default:
      return null;
  }
}

/* a deterministic 16x16 preview from a tiny string hash */
function PixelTexture({ seed }) {
  const rows = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < (seed || '').length; i++) {
      h ^= (seed || '').charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const palette = [
      '#ff9c3f', '#2de3d5', '#8f4b6d', '#4f8fd0', '#43b07a',
      '#d0a34f', '#7a5fd0', '#c96f2c', '#6d788f'
    ];
    const px = [];
    for (let y = 0; y < 16; y++) {
      const row = [];
      for (let x = 0; x < 16; x++) {
        h ^= (x << 8) ^ y;
        h = Math.imul(h, 16777619);
        row.push(palette[h % palette.length]);
      }
      px.push(row);
    }
    return px;
  }, [seed]);

  return (
    <div className="pixel-preview">
      {rows.flatMap((row, y) =>
        row.map((color, x) => (
          <span
            key={`${x}-${y}`}
            className="px"
            style={{ background: color }}
          />
        ))
      )}
    </div>
  );
}

function RecipeGrid({ node, set }) {
  const shape = node.shape || [['', ''], ['', '']];
  const bump = (r, c, val) => {
    const next = shape.map((row) => [...row]);
    next[r][c] = val;
    set({ shape: next });
  };
  return (
    <div className="recipe-editor">
      {shape.map((row, r) => (
        <div className="recipe-row" key={r}>
          {row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              className="cell"
              maxLength={1}
              value={cell}
              onChange={(e) => bump(r, c, e.target.value.slice(-1).toUpperCase())}
              placeholder="·"
            />
          ))}
          <button className="row-del term" onClick={() => set({ shape: shape.filter((_, i) => i !== r) })} title="Remove row">✕</button>
        </div>
      ))}
      <button className="row-add term" onClick={() => set({ shape: [...shape, ['', '', '']] })}>
        + row
      </button>
      <p className="hint">Use a letter for each ingredient. Fabrica maps every letter to the result’s ingredient slot.</p>
    </div>
  );
}

function NodeEditorEmpty({ onAdd }) {
  return (
    <div className="node-empty">
      <span className="node-empty-ico">🪄</span>
      <span className="pixel">Forge table is empty</span>
      <p className="ghost">
        Click <b>New</b> and pick blocks, mobs, tools, textures, recipes and more.
        Each one becomes real, working files in your exported pack.
      </p>
      <button className="btn btn-primary" onClick={onAdd}>＋ New node</button>
    </div>
  );
}