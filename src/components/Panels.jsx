import { useState } from 'react';
import { Check } from 'lucide-react';

/** 复制按钮 */
export const CopyBtn = ({ text, label = '复制' }) => {
  const [ok, setOk] = useState(false);
  if (!text) return null;
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        })
      }
      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-ink bg-white border border-hairline px-3 py-1.5 rounded-lg transition-colors"
    >
      {ok ? <Check size={13} strokeWidth={2.5} className="text-teal-600" /> : null}
      {ok ? '已复制' : `⧉ ${label}`}
    </button>
  );
};

/** 输入面板 */
export const InPanel = ({ label, value, onChange, placeholder, rows = 8 }) => (
  <div>
    <div className="flex items-center justify-between mb-2 px-0.5">
      <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</label>
      {value && (
        <button onClick={() => onChange('')} className="text-xs font-semibold text-gray-400 hover:text-gray-700">
          清空
        </button>
      )}
    </div>
    <textarea
      className="field resize-none leading-relaxed"
      style={{ height: `${rows * 1.75}rem` }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
    />
  </div>
);

/** 输出面板 */
export const OutPanel = ({ label = '输出结果', value, emptyText, mono = true, children }) => (
  <div>
    <div className="flex items-center justify-between mb-2 px-0.5">
      <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</label>
      <CopyBtn text={typeof value === 'string' ? value : ''} />
    </div>
    <div
      className={`min-h-[7rem] w-full bg-[#FBFAF7] border border-hairline border-dashed rounded-xl px-4 py-3 text-sm break-all leading-relaxed overflow-auto max-h-[24rem] ${
        mono ? 'font-mono-x' : ''
      }`}
    >
      {value || children || <span className="text-gray-400 italic font-sans">{emptyText}</span>}
    </div>
  </div>
);

/** 工具页内的说明折叠区（SEO 内容） */
export const GuideBlock = ({ intro = [], usage = [], faqs = [] }) => (
  <section className="card p-8 md:p-10 mt-10">
    <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-ink inline-block" /> 工具介绍与常见问题
    </h2>
    <div className="space-y-4 text-sm leading-loose text-gray-600">
      {intro.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
    {usage.length > 0 && (
      <>
        <h3 className="font-display font-bold text-base mt-8 mb-3">使用步骤</h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5 marker:font-bold marker:text-gray-400">
          {usage.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </>
    )}
    {faqs.length > 0 && (
      <div className="mt-8 space-y-5">
        <h3 className="font-display font-bold text-base">常见问题</h3>
        {faqs.map(([q, a], i) => (
          <div key={i} className="border-l-2 border-hairline pl-4">
            <p className="text-sm font-bold text-gray-800">{q}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    )}
  </section>
);
