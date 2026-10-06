import { Link } from 'react-router-dom';
import './home.css';

const FEATURES = [
  {
    icon: '🧱',
    title: 'Custom Blocks',
    text: 'Ore, glass, machinery or pure decoration — define a block, pick a texture, and let Fabrica wire up the state file, model and loot table for you.',
    accent: 'java'
  },
  {
    icon: '👾',
    title: 'Custom Mobs',
    text: 'Spawn a new creature with its own health, attack and speed. Give it geometry, a cube-style skin and its own loot before exporting.',
    accent: 'bedrock'
  },
  {
    icon: '⚔️',
    title: 'Tools & Items',
    text: 'Swords, pickaxes, amulets and gizmos. Set stack size, damage, rarity or durability — then drop them on a crafting table recipe.',
    accent: 'java'
  },
  {
    icon: '🎨',
    title: 'Textures & Art',
    text: 'Sketch a 16×16 pixel texture right inside the studio. It flows into your pack automatically — no folder hunting required.',
    accent: 'bedrock'
  },
  {
    icon: '📦',
    title: 'True File Output',
    text: 'Java data packs export as .zip ready for a world’s datapack folder. Bedrock add-ons export as .mcaddon or .mcpack your device can import.',
    accent: 'java'
  },
  {
    icon: '🛠️',
    title: 'One Studio, Two Editions',
    text: 'Pick Java or Bedrock at creation time, then keep building. Fabrica speaks both dialects of Minecraft so you don’t have to.',
    accent: 'bedrock'
  }
];

const TESTIMONIALS = [
  {
    quote: 'I made my first working data pack without ever reading a decompiled jar. The block node just… works. The .zip drops straight into my world.',
    author: 'Naya R.',
    role: 'Java Edition builder',
    edition: 'java'
  },
  {
    quote: 'The .mcaddon export is insane. My friends installed the add-on on their phones from one file — both packs, zero setup.',
    author: 'Callum D.',
    role: 'Bedrock Edition add-on dev',
    edition: 'bedrock'
  },
  {
    quote: 'Found the format deep-dives page and finally understood manifest.json. Fabrica is the only site that explains it instead of assuming.',
    author: 'Mina K.',
    role: 'Adventures in Add-ons YouTube',
    edition: 'bedrock'
  }
];

const HOW_STEPS = [
  {
    step: '01',
    title: 'Create a project',
    text: 'Give your mod a name, a description and an owner. Then pick which edition of Minecraft you are forging for.'
  },
  {
    step: '02',
    title: 'Hit "New" and choose a block',
    text: 'Blocks, mobs, tools, textures, recipes, loot tables, commands, advancements, sounds and structures — pick one and start editing.'
  },
  {
    step: '03',
    title: 'Tweak everything',
    text: 'Rename, recolor, rebalance. Every property you fill lands in the right JSON so the pack behaves.'
  },
  {
    step: '04',
    title: 'Export & drop it in',
    text: 'Java? Download a .zip and drop it into your world. Bedrock? Grab a .mcaddon or .mcpack and import it. Done.'
  }
];

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <Editions />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Cta />
    </div>
  );
}

/* ---------------- hero ---------------- */

function pixelRow(color) {
  return (
    <div className="pix-row">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="pix"
          style={{ background: i % 3 === 0 ? 'var(--bg-3)' : color }}
        />
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-canvas" aria-hidden="true">
        <div className="hero-row hero-row-java">
          {pixelRow('#c96f2c')}
          {pixelRow('#e08a3c')}
        </div>
        <div className="hero-row hero-row-bedrock">
          {pixelRow('#1ba8a0')}
          {pixelRow('#2eccc2')}
        </div>
      </div>

      <div className="container hero-inner">
        <span className="chip bedrock">
          <span className="dot bedrock" /> A Silver Dev Studios product
        </span>

        <h1 className="hero-title">
          <span className="hero-word pixel font-java">FORGE</span>
          <span className="hero-word pixel font-bedrock">MINECRAFT</span>
          <span className="hero-sub-term term">data packs &amp; add-ons — without the headache</span>
        </h1>

        <p className="hero-lede">
          Fabrica is a browser forge for <b className="font-java">Java Edition</b> data packs
          (<span className="mono">.zip</span>) and <b className="font-bedrock">Bedrock Edition</b>{' '}
          add-ons (<span className="mono">.mcaddon</span> / <span className="mono">.mcpack</span>).
          Design custom blocks, mobs, tools, textures and recipes — then export real,
          import-ready files.
        </p>

        <div className="hero-actions">
          <Link to="/make" className="btn btn-primary btn-lg">
            ⚒ Start Forging
          </Link>
          <Link to="/formats" className="btn btn-ghost btn-lg">
            Learn the formats
          </Link>
        </div>

        <div className="stat-row">
          <span className="stat-pill"><b>2</b> editions supported</span>
          <span className="stat-pill"><b>11</b> node types</span>
          <span className="stat-pill"><b>3</b> export formats</span>
          <span className="stat-pill term"><b>100%</b> in your browser</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- editions ---------------- */

function EditionCard({ side }) {
  const java = side === 'java';
  return (
    <article className={`edition-card ${java ? 'java' : 'bedrock'}`}>
      <div className="edition-top">
        <div className="edition-badge">
          <span className={`dot ${java ? 'java' : 'bedrock'}`} />
          <span className="pixel edition-name">{java ? 'JAVA' : 'BEDROCK'}</span>
        </div>
        <span className="edition-ver term">
          {java ? 'Java Edition 1.13+ · currently 1.21' : 'Bedrock 1.16+ · currently 1.21'}
        </span>
      </div>

      <h3 className="edition-h">{java ? 'Data Packs' : 'Add-ons'}</h3>

      <ul className="edition-points">
        {java
          ? [
              'Pure vanilla JSON — no mod loader required',
              'Blocks, items, recipes, loot, functions & tags',
              'Built with pack.mcmeta + assets/data trees',
              'Drop the .zip into your world and teleport in',
              'Countless servers and worlds use them'
            ]
          : [
              'Behavior + resource packs in one nice bundle',
              'Mobs, blocks, items, recipes & spawn eggs',
              'manifest.json drives the whole add-on',
              'Works on mobile, console and Windows',
              'Import via one tap — .mcaddon or .mcpack'
            ]}
      </ul>

      <div className="edition-file">
        {java ? (
          <>
            <span className="file-chip term">world/datapacks/</span>
            <span className="file-chip file-chip-leaf term">my_pack.zip</span>
          </>
        ) : (
          <>
            <span className="file-chip term">📦</span>
            <span className="file-chip file-chip-leaf term">my_addon.mcaddon</span>
          </>
        )}
      </div>

      <Link to="/make" className={`btn ${java ? 'btn-primary' : 'btn-bed'} btn-block`}>
        Forge a {java ? 'data pack' : 'Bedrock add-on'}
      </Link>
    </article>
  );
}

function Editions() {
  return (
    <section className="section" id="editions">
      <div className="container">
        <span className="eyebrow">Pick your Minecraft</span>
        <h2 className="section-h">Two editions, one forge.</h2>
        <p className="section-sub">
          Fabrica generates the exact file structures each edition expects — so your
          creation actually works when you drop it in.
        </p>
        <div className="editions-grid">
          <EditionCard side="java" />
          <EditionCard side="bedrock" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- features ---------------- */

function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <span className="eyebrow">What you can smelt</span>
        <h2 className="section-h">Everything a mod needs, as nodes.</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`feature-card accent-${f.accent}`}>
              <div className="feature-ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  return (
    <section className="section how" id="how">
      <div className="container">
        <span className="eyebrow">The forge flow</span>
        <h2 className="section-h">From idea to world in four steps.</h2>

        <div className="steps-grid">
          {HOW_STEPS.map((s) => (
            <div key={s.step} className="step-card">
              <span className="step-num term">{s.step}</span>
              <h3 className="pixel step-title">{s.title}</h3>
              <p>{s.text}</p>
              <span className="step-arrow">↓</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */

function Testimonials() {
  return (
    <section className="section testis">
      <div className="container">
        <span className="eyebrow">Smelted &amp; shipped</span>
        <h2 className="section-h">Forgefolk love it.</h2>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <figure key={t.author} className={`testi-card ${t.edition}`}>
              <span className="testi-mark term">&ldquo;</span>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="dot dot-sm" /> {t.author}
                <span className="testi-role term"> — {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- final CTA ---------------- */

function Cta() {
  return (
    <section className="cta">
      <div className="container cta-inner">
        <h2 className="pixel">Ready to forge?</h2>
        <p className="term cta-term">
          Your first block is 30 seconds away. No installs, no sign-up, no nonsense.
        </p>
        <div className="cta-actions">
          <Link to="/make" className="btn btn-primary btn-lg">⚒ Open the Mod Maker</Link>
          <Link to="/formats" className="btn btn-ghost btn-lg">Peek at pack formats</Link>
        </div>
      </div>
    </section>
  );
}