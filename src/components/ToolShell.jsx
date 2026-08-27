import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import useMeta from '../hooks/useMeta';
import { TOOL_LIST, getTool, getCat } from '../data/tools';
import { GuideBlock } from './Panels';

/**
 * 工具页统一外壳：面包屑 + 标题头 + 工具主体 + 说明区
 */
export default function ToolShell({ toolId, metaDesc, children, guide }) {
  const tool = getTool(toolId);
  const cat = getTool(toolId) && getCat(tool.cat);
  useMeta(tool ? tool.name : '工具', metaDesc || (tool && tool.desc));

  if (!tool) return null;

  return (
    <div className="max-w-4xl mx-auto px-5 pt-10 pb-4">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8">
        <Link to="/" className="hover:text-ink transition-colors">首页</Link>
        <span>/</span>
        <a href={`/#cat-${cat.id}`} className="hover:text-ink transition-colors">{cat.name}</a>
        <span>/</span>
        <span className="text-gray-700">{tool.name}</span>
      </nav>

      {/* 标题头 */}
      <header className="rise mb-10">
        <div className="flex items-start gap-5">
          {(() => { const TIcon = tool.icon; return (
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center shrink-0 shadow-sm border"
              style={{ background: cat.tint, borderColor: cat.color + '33' }}
            >
              <TIcon size={30} strokeWidth={1.8} color={cat.color} />
            </div>
          ); })()}
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight leading-tight">
              {tool.name}
              <span className="ml-3 align-middle font-mono-x text-xs font-semibold text-gray-400 bg-white border border-hairline px-2.5 py-1 rounded-full">
                {tool.en}
              </span>
            </h1>
            <p className="mt-2.5 text-gray-500 text-sm md:text-base leading-relaxed">{metaDesc || tool.desc}</p>
          </div>
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: cat.tint, color: cat.color }}>
          <ShieldCheck size={13} strokeWidth={2.5} /> 纯本地处理 · 数据不离开浏览器
        </p>
      </header>

      {/* 工具主体 */}
      <div className="rise" style={{ animationDelay: '0.08s' }}>{children}</div>

      {/* SEO 内容区 */}
      {guide && (
        <div className="rise" style={{ animationDelay: '0.14s' }}>
          <GuideBlock {...guide} />
        </div>
      )}

      {/* 相关工具推荐（内链） */}
      <RelatedTools toolId={toolId} cat={tool.cat} />
    </div>
  );
}

const RelatedTools = ({ toolId, cat }) => {
  const related = TOOL_LIST.filter((t) => t.cat === cat && t.id !== toolId).slice(0, 4);
  if (!related.length) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-base mb-4 text-gray-500">同类工具推荐</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((t) => {
          const RIcon = t.icon;
          return (
            <Link
              key={t.id}
              to={`/tools/${t.id}`}
              className="card card-hover flex items-center gap-4 px-5 py-4 group"
            >
              <span className="w-10 h-10 rounded-xl grid place-items-center border shrink-0" style={{ background: cat.tint, borderColor: cat.color + '30' }}>
                <RIcon size={18} strokeWidth={2} color={cat.color} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 truncate">{t.en}</p>
              </div>
              <span className="ml-auto text-gray-300 group-hover:text-ink transition-colors">→</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
