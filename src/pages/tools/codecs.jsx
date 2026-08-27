import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import ToolShell from '../../components/ToolShell';
import { InPanel, OutPanel } from '../../components/Panels';

/* ─────────────── Base64 ─────────────── */
const b64encode = (s) => window.btoa(unescape(encodeURIComponent(s)));
const b64decode = (s) => decodeURIComponent(escape(window.atob(s)));

export function Base64Page() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [err, setErr] = useState('');

  const run = (mode) => {
    setErr('');
    if (!input.trim()) return;
    try {
      setResult(mode === 'enc' ? b64encode(input) : b64decode(input.trim()));
    } catch {
      setErr('解码失败：内容不是合法的 Base64 字符串');
      setResult('');
    }
  };

  return (
    <ToolShell toolId="base64" guide={{
      intro: [
        'Base64 是一种将任意二进制数据转换为纯文本的编码方式，使用 64 个可打印字符（A-Z、a-z、0-9、+、/）表示数据。它常用于电子邮件附件（MIME）、Data URI 内联图片、HTTP Basic 认证以及 JSON 中传递二进制内容的场景。',
        '本工具完整支持中文等多字节字符，编解码过程完全在您的浏览器中完成，输入的内容不会被发送到任何服务器。',
      ],
      usage: ['在输入框粘贴需要处理的文本', '点击「编码」或「解码」按钮', '点击结果区右上角按钮复制输出'],
      faqs: [
        ['Base64 是加密吗？', '不是。Base64 只是编码格式转换，任何人都可以直接还原，切勿用于保护敏感信息。需要保密请使用 AES 等加密算法。'],
        ['为什么解码报错？', 'Base64 字符串长度应为 4 的倍数，且只包含合法字符。请检查是否有多余空格、换行或被截断。'],
      ],
    }}>
      <div className="card p-6 md:p-8 space-y-6">
        <InPanel label="输入文本" value={input} onChange={(v) => { setInput(v); setErr(''); }} placeholder="在此粘贴需要 Base64 编码或解码的内容…" />
        <div className="flex flex-wrap gap-3">
          <button className="btn-ink" onClick={() => run('enc')}>编码 Encode ↓</button>
          <button className="btn-ghost" onClick={() => run('dec')}>解码 Decode ↑</button>
        </div>
        {err && <p className="text-sm font-semibold text-[#BE123C]">⚠ {err}</p>}
        <OutPanel value={result} emptyText="等待处理…" />
      </div>
    </ToolShell>
  );
}

/* ─────────────── URL 编码 ─────────────── */
export function UrlCodecPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [component, setComponent] = useState(true);

  const run = (mode) => {
    if (!input) return;
    try {
      const fn = component ? encodeURIComponent : encodeURI;
      const dec = component ? decodeURIComponent : decodeURI;
      setResult(mode === 'enc' ? fn(input) : dec(input));
    } catch {
      setResult('解码失败：URL 编码格式不正确');
    }
  };

  return (
    <ToolShell toolId="url-codec" guide={{
      intro: [
        'URL 编码（百分号编码）会把 URL 中不安全或保留的字符转换为 %XX 形式，例如中文「工」会被编码为 %E5%B7%A5。这是 HTTP 协议传输查询参数时的标准做法。',
        '「组件模式」对应 JavaScript 的 encodeURIComponent，适合编码单个参数值；「整链模式」对应 encodeURI，会保留 ://?&= 等 URL 结构字符。',
      ],
      usage: ['选择编码模式（默认组件模式即可）', '粘贴需要处理的链接或参数值', '点击对应按钮获得结果'],
      faqs: [
        ['+ 和 %20 有什么区别？', '在表单提交（application/x-www-form-urlencoded）中空格会被编码为 +；标准 percent-encoding 则是 %20。处理服务端传来的 + 时需先替换为 %20 再解码。'],
      ],
    }}>
      <div className="card p-6 md:p-8 space-y-6">
        <InPanel label="输入内容" value={input} onChange={setInput} placeholder="https://example.com/search?q=关键词&lang=zh…" rows={5} />
        <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={component} onChange={(e) => setComponent(e.target.checked)}
            className="w-4 h-4 accent-[#17181C]" />
          组件模式（encodeURIComponent，推荐用于参数值）
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="btn-ink" onClick={() => run('enc')}>编码 Encode</button>
          <button className="btn-ghost" onClick={() => run('dec')}>解码 Decode</button>
        </div>
        <OutPanel value={result} emptyText="等待处理…" />
      </div>
    </ToolShell>
  );
}

/* ─────────────── JWT 解析 ─────────────── */
const prettyJson = (str) => JSON.stringify(JSON.parse(str), null, 2);

export function JwtDecodePage() {
  const [token, setToken] = useState('');
  const parts = token.trim().split('.');
  const validShape = parts.length === 3 && parts.every((p) => p.length > 0);
  let header = '';
  let payload = '';
  let error = '';

  if (validShape) {
    try {
      header = prettyJson(b64decode(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      payload = prettyJson(b64decode(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      error = '解析失败：Header 或 Payload 不是合法的 Base64Url JSON';
    }
  } else if (token.trim()) {
    error = '格式提示：JWT 应为由两个点号分隔的三段字符串（xxx.yyy.zzz）';
  }

  const expClaim = (() => {
    try { return JSON.parse(payload).exp; } catch { return null; }
  })();
  const expDate = expClaim ? new Date(expClaim * 1000) : null;
  const expired = expDate ? expDate < new Date() : null;

  return (
    <ToolShell toolId="jwt" guide={{
      intro: [
        'JWT（JSON Web Token）是前后端分离应用中最常用的身份凭证格式，由 Header（算法声明）、Payload（负载数据）和 Signature（签名）三段 Base64Url 字符串用点号连接而成。',
        '前两段本身只是编码而非加密，任何拿到 token 的人都能直接读取其内容。本工具帮助您快速查看其中的字段与过期时间，全程离线完成。',
      ],
      usage: ['粘贴完整的 JWT 字符串（无需密钥）', '自动展示解码后的 Header 与 Payload', '若存在 exp 字段，将显示令牌是否已过期'],
      faqs: [
        ['能用这个工具验证签名吗？', '不能。签名验证必须持有服务端密钥，请勿在前端公开验证逻辑。'],
      ],
    }}>
      <div className="space-y-6">
        <div className="card p-6 md:p-8 space-y-6">
          <InPanel label="JWT Token" value={token} onChange={setToken} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.xxxxx" rows={6} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <h3 className="font-display font-bold text-sm tracking-wide text-gray-500 uppercase">Header 头部</h3>
            <pre className="font-mono-x text-xs leading-relaxed whitespace-pre-wrap break-all text-teal-800 min-h-[6rem] bg-[#FBFAF7] border border-hairline rounded-xl p-4">{header || '—'}</pre>
          </div>
          <div className="card p-6 space-y-3">
            <h3 className="font-display font-bold text-sm tracking-wide text-gray-500 uppercase">Payload 负载</h3>
            <pre className="font-mono-x text-xs leading-relaxed whitespace-pre-wrap break-all text-gray-700 min-h-[6rem] bg-[#FBFAF7] border border-hairline rounded-xl p-4">{payload || '—'}</pre>
          </div>
        </div>
        {expired !== null && (
          <p className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-3 rounded-xl ${expired ? 'bg-red-50 text-[#BE123C]' : 'bg-emerald-50 text-[#0D7D71]'}`}>
            {expired
              ? <>⚠ 该令牌已于 {expDate.toLocaleString('zh-CN')} 过期</>
              : <><CheckCircle2 size={15} strokeWidth={2.5} /> 令牌有效期至 {expDate.toLocaleString('zh-CN')}</>}
          </p>
        )}
        {error && <p className="text-sm font-semibold text-[#BE123C]">⚠ {error}</p>}
      </div>
    </ToolShell>
  );
}
