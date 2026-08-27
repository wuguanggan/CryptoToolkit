import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap, Puzzle } from 'lucide-react';
import useMeta from '../hooks/useMeta';
import { SITE, CATS, TOOL_LIST } from '../data/tools';

const ToolCard = ({ tool, cat }) => {
  const Icon = tool.icon;
  return (
    <Link
      to={`/tools/${tool.id}`}
      className="card card-hover group relative overflow-hidden p-6 flex flex-col"
    >
      <span
        className="absolute top-0 left-0 right-0 h-1 opacity-80"
        style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }}
      />
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl grid place-items-center border" style={{ background: cat.tint, borderColor: cat.color + '30' }}>
          <Icon size={22} strokeWidth={2} color={cat.color} />
        </div>
        {tool.popular && (
          <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-ink text-paper">热门</span>
        )}
      </div>
      <h3 className="font-display font-bold text-lg leading-snug">{tool.name}</h3>
      <p className="font-mono-x text-[11px] text-gray-400 mt-0.5">{tool.en}</p>
      <p className="text-[13px] text-gray-500 leading-relaxed mt-3 flex-1">{tool.desc}</p>
      <p className="mt-4 text-sm font-bold flex items-center gap-1 transition-colors" style={{ color: cat.color }}>
        立即使用 <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </p>
    </Link>
  );
};

export default function Home() {
  useMeta('', 'JSON 格式化、Base64、MD5、SHA-256、AES 加解密、二维码生成、时间戳转换等免费在线工具，全部在浏览器本地处理。');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return null;
    return TOOL_LIST.filter((t) =>
      (t.name + t.en + t.desc + t.id).toLowerCase().includes(kw)
    );
  }, [q]);

  const popular = TOOL_LIST.filter((t) => t.popular);

  return (
    <div className="max-w-6xl mx-auto px-5">
      {/* ── Hero ── */}
      <section className="pt-16 pb-14 text-center rise">
        <p className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-white border border-hairline shadow-sm text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {TOOL_LIST.length} 款工具 · 100% 浏览器本地运行 · 免登录免上传
        </p>
        <h1 className="font-display font-extrabold tracking-tight leading-[1.15] mt-7 text-4xl sm:text-5xl md:text-[3.4rem]">
          常用工具，一站直达。
          <br />
          <span className="relative inline-block">
            数据
            <svg className="absolute -bottom-1 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 8 Q 50 2 100 6 T 198 4" fill="none" stroke="#0D7D71" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
            </svg>
          </span>
          不离开你的浏览器。
        </h1>
        <p className="mt-6 text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {SITE.slogan}——加密解密、JSON 格式化、二维码生成、时间戳转换……所有计算都在本地完成，
          关闭页面即刻销毁，比在线上传类工具更安全。
        </p>

        {/* 搜索 */}
        <div className="mt-9 max-w-xl mx-auto relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工具：json / md5 / 二维码 / 时间戳…"
            className="w-full h-14 pr-5 pl-12 rounded-2xl bg-white border border-hairline outline-none focus:border-ink focus:ring-4 focus:ring-black/5 transition-all font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal shadow-sm"
          />
          <Search size={19} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none" />
        </div>

        {/* 热门直达 */}
        {!filtered && (
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {popular.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.id} to={`/tools/${t.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-hairline text-xs font-bold text-gray-600 hover:border-ink hover:text-ink hover:-translate-y-0.5 transition-all shadow-sm">
                  <Icon size={14} strokeWidth={2.2} /> {t.name}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 搜索结果 ── */}
      {filtered !== null ? (
        <section className="pb-10 min-h-[300px]">
          <p className="text-sm font-semibold text-gray-400 mb-6">
            找到 <b className="text-ink">{filtered.length}</b> 个与「{q}」相关的工具
          </p>
          {filtered.length === 0 ? (
            <div className="card p-14 text-center text-gray-400 font-semibold">
              没有匹配的工具，试试「文本」「加密」「时间」等关键词
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((t) => (
                <ToolCard key={t.id} tool={t} cat={CATS.find((c) => c.id === t.cat)} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* ── 分类展示 ── */
        <>
          {CATS.map((cat, ci) => {
            const list = TOOL_LIST.filter((t) => t.cat === cat.id);
            if (!list.length) return null;
            return (
              <section key={cat.id} id={`cat-${cat.id}`} className="mb-16 scroll-mt-20 rise" style={{ animationDelay: `${0.06 * (ci + 1)}s` }}>
                <div className="flex items-end justify-between mb-6 pb-4 border-b border-hairline">
                  <div className="flex items-center gap-3.5">
                    {(() => { const CIcon = cat.icon; return (
                      <span className="w-11 h-11 rounded-xl grid place-items-center border" style={{ background: cat.tint, borderColor: cat.color + '30' }}>
                        <CIcon size={20} strokeWidth={2} color={cat.color} />
                      </span>
                    ); })()}
                    <div>
                      <h2 className="font-display font-bold text-2xl tracking-tight" style={{ color: cat.color }}>{cat.name}</h2>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block font-mono-x text-xs text-gray-400 font-bold">{String(list.length).padStart(2, '0')} tools</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.map((t) => (
                    <ToolCard key={t.id} tool={t} cat={cat} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── SEO 内容块 ── */}
          <section className="card p-8 md:p-12 mb-4 rise">
            <h2 className="font-display font-bold text-2xl mb-5">为什么选择 ToolHub？</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm leading-relaxed text-gray-600">
              <div>
                <h3 className="font-bold text-base mb-2.5 flex items-center gap-2"><ShieldCheck size={17} strokeWidth={2} className="text-teal-700" /> 隐私优先架构</h3>
                与需要上传文件的同类服务不同，本站全部工具基于纯前端技术实现：加密、格式化、生成均在浏览器内存中完成。
                您可以打开开发者工具的 Network 面板亲自验证——没有任何包含您数据的请求发往服务器。
              </div>
              <div>
                <h3 className="font-bold text-base mb-2.5 flex items-center gap-2"><Zap size={17} strokeWidth={2} className="text-amber-600" /> 即开即用零门槛</h3>
                无需注册账号、无需安装软件、没有使用次数限制与广告弹窗打扰。打开页面即刻工作，关闭即走，
                适合开发调试、内容创作与日常办公等碎片化场景。
              </div>
              <div>
                <h3 className="font-bold text-base mb-2.5 flex items-center gap-2"><Puzzle size={17} strokeWidth={2} className="text-indigo-600" /> 持续扩充的工具矩阵</h3>
                从经典的 MD5、SHA-256、AES 加解密，到 JSON 格式化、JWT 解析、二维码生成、时间戳换算，
                我们围绕「数据在本地」这一原则持续上新高频实用工具。
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
