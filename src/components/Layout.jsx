import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE, CATS, TOOL_LIST } from '../data/tools';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group">
    <span className="w-9 h-9 rounded-xl bg-ink text-paper grid place-items-center font-display font-extrabold text-lg rotate-[-6deg] group-hover:rotate-0 transition-transform duration-300 shadow-md">
      T
    </span>
    <span className="leading-tight">
      <span className="font-display font-bold text-[17px] tracking-tight block">{SITE.name}</span>
      <span className="text-[11px] text-gray-500 font-medium">{SITE.cnName} · 全部本地运行</span>
    </span>
  </Link>
);

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/85 border-b border-hairline">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {CATS.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.id}
                href={`/#cat-${c.id}`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:text-ink hover:bg-white transition-colors"
              >
                <Icon size={15} strokeWidth={2.2} /> {c.name}
              </a>
            );
          })}
          <NavLink to="/about" className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'text-ink bg-white' : 'text-gray-600 hover:text-ink hover:bg-white'}`}>
            关于
          </NavLink>
          <Link to="/privacy" className="ml-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-ink transition-colors">
            隐私协议
          </Link>
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 grid place-items-center rounded-xl border border-hairline bg-white"
          aria-label="菜单"
        >
          {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-hairline bg-paper px-5 py-4 space-y-1">
          {TOOL_LIST.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.id} to={`/tools/${t.id}`} onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white">
                <Icon size={15} strokeWidth={2.2} /> {t.name}
              </Link>
            );
          })}
          <div className="pt-2 flex gap-2">
            <Link to="/about" onClick={() => setOpen(false)} className="btn-ghost flex-1 !py-2">关于</Link>
            <Link to="/privacy" onClick={() => setOpen(false)} className="btn-ghost flex-1 !py-2">隐私协议</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="mt-24 border-t border-hairline bg-white/60">
    <div className="max-w-6xl mx-auto px-5 py-14">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            所有工具均在您的浏览器本地运行，不收集、不上传任何数据。
          </p>
        </div>
        {CATS.map((cat) => (
          <div key={cat.id}>
            <h4 className="font-display font-bold text-sm mb-4" style={{ color: cat.color }}>
              {cat.name}
            </h4>
            <ul className="space-y-2.5">
              {TOOL_LIST.filter((t) => t.cat === cat.id).map((t) => (
                <li key={t.id}>
                  <Link to={`/tools/${t.id}`} className="text-xs font-medium text-gray-500 hover:text-ink transition-colors">
                    {t.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400">&copy; 2026 {SITE.name} · Free Online Tools. All rights reserved.</p>
        <div className="flex gap-5 text-xs font-semibold text-gray-500">
          <Link to="/privacy" className="hover:text-ink">隐私协议</Link>
          <Link to="/about" className="hover:text-ink">关于本站</Link>
          <a href="https://github.com/wuguanggan/CryptoToolkit" target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
