import { useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Formats from './pages/Formats.jsx';
import Maker from './pages/Maker.jsx';
import './app.css';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/formats" element={<Formats />} />
          <Route path="/make" element={<Maker />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <img src="./fabrica-logo.svg" alt="Fabrica logo" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-name pixel">FABRICA</span>
            <span className="brand-sub term">data pack &amp; add-on forge</span>
          </span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Home
          </NavLink>
          <NavLink to="/make" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Mod Maker
          </NavLink>
          <NavLink to="/formats" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Formats
          </NavLink>
        </nav>

        <Link to="/make" className="btn btn-primary btn-sm header-cta">
          <span className="plus-glyph">+</span> Start Forging
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <img src="./fabrica-logo.svg" alt="Fabrica" className="footer-logo" />
          <p className="term footer-tagline">
            Forge data packs &amp; add-ons.<br />
            Bend worlds to your will.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading pixel">Explore</h4>
          <ul className="clean">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/make">Mod Maker</Link></li>
            <li><Link to="/formats">Pack Formats</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading pixel">Editions</h4>
          <ul className="clean">
            <li><span className="dot java" /> Java Edition — .zip</li>
            <li><span className="dot bedrock" /> Bedrock Edition — .mcaddon</li>
            <li><span className="dot bedrock" /> Bedrock Edition — .mcpack</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading pixel">Silver Dev Studios</h4>
          <p className="ghost footer-silver">
            Fabrica is a product of Silver Dev Studios — a small team smelting
            game tools, downloadable content and player-first utilities.
          </p>
          <p className="footer-slogan term">“smelt · forge · deploy”</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Silver Dev Studios. All rights reserved.</span>
        <span className="footer-note">
          Fabrica is not affiliated with Mojang Studios or Microsoft. Minecraft is a
          trademark of Mojang Synergies AB.
        </span>
      </div>
    </footer>
  );
}