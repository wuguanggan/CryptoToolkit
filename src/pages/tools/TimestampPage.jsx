import { useEffect, useState } from 'react';
import ToolShell from '../../components/ToolShell';

const pad = (n) => String(n).padStart(2, '0');
const fmtLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fmtUTC = (d) => d.toISOString().replace('T', ' ').slice(0, 19);

export default function TimestampPage() {
  const [now, setNow] = useState(null);

  // TS → 日期
  const [tsInput, setTsInput] = useState('');
  const [tsOut, setTsOut] = useState(null);

  // 日期 → TS
  const [dateInput, setDateInput] = useState('');
  const [dateOut, setDateOut] = useState(null);
  const [unit, setUnit] = useState('s');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const convertTs = () => {
    setTsOut(null);
    if (!tsInput.trim()) return;
    const n = Number(tsInput.trim().replace(/[^\d]/g, ''));
    if (!Number.isFinite(n)) return;
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return;
    setTsOut({ ms: n, date: d, local: fmtLocal(d), utc: fmtUTC(d), week: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()] });
  };

  const convertDate = () => {
    setDateOut(null);
    const d = new Date(dateInput.replace(' ', 'T'));
    if (isNaN(d.getTime())) return;
    setDateOut(Math.floor(unit === 's' ? d.getTime() / 1000 : d.getTime()));
  };

  return (
    <ToolShell toolId="timestamp" guide={{
      intro: [
        'Unix 时间戳是从 1970 年 1 月 1 日（UTC）起经过的秒数或毫秒数，是程序世界通用的"时间语言"。日志系统、接口签名、数据库时间字段几乎都以它存储。',
        '13 位通常是毫秒、10 位是秒——本工具会自动识别。顶部还有实时走动的当前时间戳，方便您在调试签名时随时取值。',
      ],
      usage: ['上：粘贴时间戳，点击转换得到本地/UTC 双时区结果', '下：选择日期时间与单位，点击转换为对应的时间戳', '点击数值卡片即可复制'],
      faqs: [
        ['为什么时间戳显示和北京时间对不上？', '时间戳本身与时区无关，转成日期时依赖设备时区设置。UTC 行展示的是零时区标准时间。'],
      ],
    }}>
      <div className="space-y-6">
        {/* 当前时间 */}
        <div className="card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rise">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1.5">当前时间戳 Now</p>
            <p className="font-mono-x font-bold text-3xl tracking-tight">{now ? Math.floor(now / 1000) : '·····'}</p>
          </div>
          <div className="text-right">
            <p className="font-mono-x text-sm text-gray-500 font-semibold">{now ?? '……'}</p>
            <p className="font-sans text-xs text-gray-400 mt-1">{now ? fmtLocal(new Date(now)) : ''}</p>
          </div>
        </div>

        {/* TS → Date */}
        <div className="card p-6 md:p-8 space-y-5">
          <h2 className="font-display font-bold text-lg">时间戳 → 日期</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="field flex-1" value={tsInput} onChange={(e) => setTsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && convertTs()} placeholder="输入时间戳，10 位秒 / 13 位毫秒均可…" />
            <button className="btn-ink shrink-0" onClick={convertTs}>转换</button>
          </div>
          {tsOut && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => navigator.clipboard.writeText(tsOut.local)}
                className="text-left px-4 py-3.5 rounded-xl bg-[#FBFAF7] border border-hairline hover:border-ink transition-colors group">
                <p className="text-[11px] font-bold text-gray-400 mb-1">本地时间 · 周{tsOut.week}</p>
                <p className="font-mono-x font-bold text-sm group-hover:text-teal-700">{tsOut.local}</p>
              </button>
              <button onClick={() => navigator.clipboard.writeText(tsOut.utc)}
                className="text-left px-4 py-3.5 rounded-xl bg-[#FBFAF7] border border-hairline hover:border-ink transition-colors group">
                <p className="text-[11px] font-bold text-gray-400 mb-1">UTC 时间</p>
                <p className="font-mono-x font-bold text-sm group-hover:text-teal-700">{tsOut.utc}</p>
              </button>
              <button onClick={() => navigator.clipboard.writeText(String(tsOut.ms))}
                className="text-left px-4 py-3.5 rounded-xl bg-[#FBFAF7] border border-hairline hover:border-ink transition-colors group">
                <p className="text-[11px] font-bold text-gray-400 mb-1">标准化毫秒值</p>
                <p className="font-mono-x font-bold text-sm group-hover:text-teal-700">{tsOut.ms}</p>
              </button>
            </div>
          )}
        </div>

        {/* Date → TS */}
        <div className="card p-6 md:p-8 space-y-5">
          <h2 className="font-display font-bold text-lg">日期 → 时间戳</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="datetime-local" step="1" className="field !font-sans flex-1" value={dateInput}
              onChange={(e) => setDateInput(e.target.value)} placeholder="选择或输入日期时间" />
            <button type="button"
              onClick={() => { const d = new Date(); setDateInput(fmtLocal(d).slice(0, 16)); }}
              className="btn-ghost shrink-0 !px-4">
              填入现在
            </button>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              className="bg-white border border-hairline rounded-xl px-3 text-sm font-semibold cursor-pointer outline-none">
              <option value="s">秒 (10位)</option>
              <option value="ms">毫秒 (13位)</option>
            </select>
            <button className="btn-ink shrink-0" onClick={convertDate}>转换</button>
          </div>
          {dateOut !== null && (
            <button onClick={() => navigator.clipboard.writeText(String(dateOut))}
              className="w-full px-4 py-4 rounded-xl bg-ink text-paper font-mono-x font-bold text-xl tracking-wider hover:opacity-90 transition-opacity">
              {dateOut} <span className="text-xs opacity-60 font-semibold">点击复制</span>
            </button>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
