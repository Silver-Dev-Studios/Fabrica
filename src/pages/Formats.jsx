import { Link } from 'react-router-dom';
import './formats.css';

/* A tiny file-tree renderer. */
function FileTree({ name, children }) {
  return (
    <div className="ftree">
      <TreeRoot label={name} />
      <div className="ftree-children">{children}</div>
    </div>
  );
}
function TreeRoot({ label }) {
  return (
    <div className="tree-line tree-root">
      <span className="tree-ico">🗀</span>
      <code>{label}</code>
    </div>
  );
}
function Dir({ label, children, note }) {
  return (
    <div className="dir">
      <div className="tree-line">
        <span className="tree-ico">📁</span>
        <code>{label}</code>
        {note && <span className="tree-note term">{note}</span>}
        <span className="tree-branch" />
      </div>
      <div className="dir-children">{children}</div>
    </div>
  );
}
function File({ label, note, highlight }) {
  return (
    <div className="tree-line">
      <span className="tree-ico">📄</span>
      <code className={highlight ? 'tree-highlight' : ''}>{label}</code>
      {note && <span className="tree-note term">{note}</span>}
    </div>
  );
}
function JsonBlob({ title, tag = 'java', lines }) {
  return (
    <div className="jsoncard">
      <div className="jsoncard-head">
        <span className="jsoncard-title term">{title}</span>
        <span className={`chip ${tag === 'bedrock' ? 'bedrock' : 'java'}`}>
          {tag === 'bedrock' ? 'BEDROCK' : 'JAVA'}
        </span>
      </div>
      <pre>
        <code>{lines}</code>
      </pre>
    </div>
  );
}

const MANIFEST_JSON = `{
  "format_version": 2,
  "header": {
    "name": "Ruby Ores",
    "description": "Shiny!",
    "uuid": "2d8b0f13-...",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    {
      "type": "data",
      "uuid": "9a41f2c0-...",
      "version": [1, 0, 0]
    }
  ],
  "dependencies": [
    { "uuid": "62d77e1b-...", "version": [1, 0, 0] }
  ]
}`;

const PACK_MCMETA = `{
  "pack": {
    "description": "Ruby Ores and tools",
    "pack_format": 48,
    "supported_formats": [15, 48]
  }
}`;

const BLOCKSTATES = `{
  "variants": {
    "": { "model": "rapture:block/ruby_ore" }
  }
}`;

const LOOT_JSON = `{
  "type": "minecraft:block",
  "pools": [
    { "rolls": 1,
      "entries": [{ "type": "minecraft:item",
        "name": "rapture:ruby_ore" }] }
  ]
}`;

export default function Formats() {
  return (
    <div className="formats">
      <section className="page-hero" style={{ '--glow': 'rgba(255, 156, 63, 0.12)' }}>
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> / Formats</p>
          <h1>
            Pack formats, <span className="font-java">dug up</span>
            <span className="edition font-bedrock">.zip · .mcaddon · .mcpack</span>
          </h1>
          <p className="lede">
            Data packs and add-ons are just artfully organized folders. This page digs
            into exactly which files each format expects — and why Fabrica builds them
            the way it does.
          </p>
          <div className="stat-row">
            <span className="stat-pill"><b>.zip</b> Java data pack</span>
            <span className="stat-pill"><b>.mcaddon</b> two packs, one file</span>
            <span className="stat-pill"><b>.mcpack</b> single-pack drop</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">The short version</span>
          <h2 className="section-h">Every Minecraft pack is a zip in a fancy coat.</h2>
          <p className="section-sub">
            Both editions use <span className="mono">zip</span> archives under the hood.
            The extension only tells Minecraft how to treat the archive when it lands in
            the right folder.
          </p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Extension</th>
                  <th>Edition</th>
                  <th>What it actually is</th>
                  <th>Where it goes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="mono-small font-java">.zip</span></td>
                  <td><span className="chip java">Java</span></td>
                  <td>A vanilla <b>data pack</b> — JSON files driving recipes, loot, functions, advancements and tags.</td>
                  <td><span className="mono-small">world/datapacks/</span></td>
                </tr>
                <tr>
                  <td><span className="mono-small font-bedrock">.mcaddon</span></td>
                  <td><span className="chip bedrock">Bedrock</span></td>
                  <td>A zip containing <b>two</b> packs: a Behavior Pack (<span className="mono">BP</span>) and a Resource Pack (<span className="mono">RP</span>). Importing one file installs both and links them.</td>
                  <td><span className="mono-small">tap &amp; import</span></td>
                </tr>
                <tr>
                  <td><span className="mono-small font-bedrock">.mcpack</span></td>
                  <td><span className="chip bedrock">Bedrock</span></td>
                  <td>A zip containing <b>one</b> pack — either a Behavior Pack or a Resource Pack. Renaming it to .zip and back changes nothing; the contents are identical.</td>
                  <td><span className="mono-small">tap &amp; import</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="callout info">
            <span className="call-ico">💡</span>
            <div>
              <b>Fun fact:</b> rename any <span className="mono">.mcpack</span> to{' '}
              <span className="mono">.zip</span> and you can open it with any archive tool.
              The magic is in the <i>folders and manifest.json inside</i>, not the extension.
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <span className="eyebrow">Java Edition</span>
          <h2 className="section-h">.zip data packs</h2>
          <p className="section-sub">
            A Java data pack is organized into <span className="mono">data/</span> (game rules,
            recipes, loot, functions) and <span className="mono">assets/</span> (models, textures,
            sounds, language). Everything is plain-vanilla JSON sent with a{' '}
            <span className="mono">pack.mcmeta</span> ID card.
          </p>

          <div className="fmt-grid">
            <div>
              <FileTree name="my_pack.zip">
                <Dir label="pack.mcmeta" note="pack ID card">
                  <File label="pack_format: 48 → 1.21" />
                </Dir>
                <Dir label="data/">
                  <Dir label="rapture/ (your namespace)">
                    <Dir label="recipe/">
                      <File label="ruby_pickaxe.json" />
                    </Dir>
                    <Dir label="loot_table/blocks/">
                      <File label="ruby_ore.json" />
                    </Dir>
                    <Dir label="function/">
                      <File label="on_load.mcfunction" />
                    </Dir>
                    <Dir label="advancement/">
                      <File label="first_ruby.json" />
                    </Dir>
                    <Dir label="tag/block/">
                      <File label="mineable_with_pickaxe.json" />
                    </Dir>
                  </Dir>
                </Dir>
                <Dir label="assets/">
                  <Dir label="rapture/">
                    <Dir label="blockstates/">
                      <File label="ruby_ore.json" />
                    </Dir>
                    <Dir label="models/block/ | models/item/">
                      <File label="ruby_ore.json" />
                    </Dir>
                    <Dir label="textures/block/">
                      <File label="ruby_ore.png" />
                    </Dir>
                    <Dir label="sounds.json · lang/en_us.json"> </Dir>
                  </Dir>
                </Dir>
              </FileTree>
            </div>

            <div className="fmt-notes">
              <JsonBlob title="pack.mcmeta" lines={PACK_MCMETA} />
              <JsonBlob title="blockstates/ruby_ore.json" lines={BLOCKSTATES} />
              <JsonBlob title="loot_table/blocks/ruby_ore.json" lines={LOOT_JSON} />

              <div className="callout tip">
                <span className="call-ico">🪄</span>
                <div>
                  <b>No mod loader.</b> Data packs run on pure vanilla Java Edition. A world
                  loads every <span className="mono">.zip</span> inside its{' '}
                  <span className="mono">datapacks/</span> folder automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow bed">Bedrock Edition</span>
          <h2 className="section-h">.mcaddon &amp; .mcpack</h2>
          <p className="section-sub">
            Bedrock add-ons split their brain into two packs: a <b>Behavior Pack (BP)</b>{' '}
            holding entity JSON, block JSON and loot, and a <b>Resource Pack (RP)</b> holding
            textures, models and sounds. A <span className="mono">.mcaddon</span> bundles both;
            a <span className="mono">.mcpack</span> carries just one.
          </p>

          <div className="addon-arch">
            <div className="arch-pack arch-bp">
              <span className="arch-label term">BEHAVIOR PACK · what things DO</span>
              <FileTree name="BP/">
                <Dir label="manifest.json" note="ID card — links to RP">
                  <File label="header.uuid / modules.uuid" />
                </Dir>
                <Dir label="entities/">
                  <File label="ruby_golem.json" note="behaviour" />
                </Dir>
                <Dir label="blocks/">
                  <File label="ruby_ore.json" note="properties" />
                </Dir>
                <Dir label="items/">
                  <File label="ruby_sword.json" />
                </Dir>
                <Dir label="recipes/">
                  <File label="ruby_block.json" />
                </Dir>
                <Dir label="loot_tables/entities/">
                  <File label="ruby_golem.json" />
                </Dir>
                <Dir label="spawn_rules/">
                  <File label="ruby_golem.json" note="where it spawns" />
                </Dir>
              </FileTree>
            </div>

            <div className="arch-pack arch-rp">
              <span className="arch-label term">RESOURCE PACK · how things LOOK</span>
              <FileTree name="RP/">
                <Dir label="manifest.json" note="ID card — a module of type 'resources'">
                  <File label="dependencies: [BP uuid]" />
                </Dir>
                <Dir label="textures/blocks/">
                  <File label="ruby_ore.png" />
                </Dir>
                <Dir label="textures/items/">
                  <File label="ruby_sword.png" />
                </Dir>
                <Dir label="models/entity/">
                  <File label="ruby_golem.geo.json" />
                </Dir>
                <Dir label="textures/entity/">
                  <File label="ruby_golem.png" />
                </Dir>
                <Dir label="entity/">
                  <File label="ruby_golem.entity.json" note="renders the model" />
                </Dir>
                <Dir label="sound/">
                  <File label="sounds.json" />
                </Dir>
              </FileTree>
            </div>
          </div>

          <div className="manifest-spotlight">
            <h3 className="pixel">manifest.json — the piece that makes it an add-on</h3>
            <p className="ghost">
              Both packs must agree on UUIDs. The behavior pack declares a dependency on the
              resource pack’s UUID — that handshake is what Bedrock uses to install them as one
              add-on. Every pack ALSO needs a unique pack-specific header UUID, and every module
              gets its own UUID too. Fabrica generates fresh UUIDs for you with every export.
            </p>
            <JsonBlob title="BP/manifest.json" tag="bedrock" lines={MANIFEST_JSON} />
          </div>

          <div className="table-wrap mt">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="mono-small">header</span></td>
                  <td>Pack name, description, unique pack <b>UUID</b> and the minimum engine version.</td>
                </tr>
                <tr>
                  <td><span className="mono-small">modules</span></td>
                  <td>Declares what this pack contains — <span className="mono">data</span> (behavior) or <span className="mono">resources</span> (textures/models).</td>
                </tr>
                <tr>
                  <td><span className="mono-small">dependencies</span></td>
                  <td>UUID of the sibling pack. The BP points at the RP so spawn eggs get their skin and blocks get their texture.</td>
                </tr>
                <tr>
                  <td><span className="mono-small">format_version</span></td>
                  <td>The manifest schema version (2 for today’s add-ons).</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="callout warn">
            <span className="call-ico">⚠️</span>
            <div>
              <b>UUID gotcha:</b> if you copy a pack and forget to regenerate the header UUID,
              Bedrock treats it as an update to the original — which can overwrite customization.
              Always export fresh UUIDs (Fabrica does this automatically).
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <span className="eyebrow">Side by side</span>
          <h2 className="section-h">Which format should you use?</h2>
          <div className="table-wrap mt">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Format</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>You’re on a Java server or single-player world</td>
                  <td><span className="chip java">.zip</span></td>
                  <td>Drop it in <span className="mono">.minecraft/saves/&lt;world&gt;/datapacks/</span> and run <span className="mono-small">/reload</span>.</td>
                </tr>
                <tr>
                  <td>You’re sharing with friends on mobile / console</td>
                  <td><span className="chip bedrock">.mcaddon</span></td>
                  <td>One file, both packs, works on Android, iOS and Windows 10/11.</td>
                </tr>
                <tr>
                  <td>You need a single behavior pack or resource pack</td>
                  <td><span className="chip bedrock">.mcpack</span></td>
                  <td>Import one half of an add-on without the other. Great for pure texture packs.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cta-row">
            <Link to="/make" className="btn btn-primary btn-lg">
              ⚒ Build one now
            </Link>
            <Link to="/" className="btn btn-ghost btn-lg">
              Back home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}