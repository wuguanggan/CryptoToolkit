import { useMemo, useState } from 'react';
import { Dices, Pipette } from 'lucide-react';
import ToolShell from '../../components/ToolShell';
import { CopyBtn } from '../../components/Panels';

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
    raw: `#${s.toUpperCase()}`,
  };
};

const rgbToHsl = ({ r, g, b }) => {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0));
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const luminance = ({ r, g, b }) => {
  const a = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#17181C');
  const [eyeBusy, setEyeBusy] = useState(false);
  const [eyeErr, setEyeErr] = useState('');
  const eyeSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const lum = rgb ? luminance(rgb) : null;

  const rows = rgb && [
    ['HEX', rgb.raw],
    ['RGB', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
    ['RGBA', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`],
    ['HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
  ];

  const random = () => {
    const c = '#' + [...Array(6)].map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    setHex(c);
  };

  /* 吸管：吸取屏幕上任意像素的颜色（EyeDropper API，Chrome 95+ / Edge） */
  const pickScreen = async () => {
    setEyeErr('');
    setEyeBusy(true);
    try {
      const eye = new window.EyeDropper();
      const res = await eye.open();
      setHex(res.sRGBHex);
    } catch (e) {
      if (e?.name !== 'AbortError') setEyeErr('取色失败，请稍后重试');
    } finally {
      setEyeBusy(false);
    }
  };

  return (
    <ToolShell toolId="color" guide={{
      intro: [
        '写 CSS 时最常见的小麻烦：设计稿给的是 HEX 色值，你需要 rgba 半透明版本；或者从截图里看到一种好看的颜色，想知道它的 HSL 数值。本工具将这些常用色彩格式一页打通，所有转换公式遵循 W3C 标准。',
        '内置「吸管取色」：点击后鼠标变成十字准星，可直接吸取屏幕任意位置的像素颜色（包括其他页面与图片），颜色自动带入并转换为全格式。',
        '色块下方还给出了该颜色的相对亮度与对比度参考，帮你快速判断它适合搭配白底还是深底文字，这对无障碍（WCAG 对比度≥4.5:1）要求尤其有用。',
      ],
      usage: ['点击色块打开系统取色器，或点击「吸管取色」吸取屏幕任意像素', '也可直接粘贴 HEX 值或点击「随机灵感」', '各格式行右侧可一键复制对应的 CSS 值'],
      faqs: [
        ['HEX 和 RGB 有什么区别？', '两者表示同一颜色空间（sRGB），HEX 是十六进制紧凑写法如 #FF5733，RGB 是十进制函数写法如 rgb(255,87,51)。需要透明度时用 rgba() 或 8 位 HEX（#RRGGBBAA）。'],
        ['对比度数值怎么看？', '它是当前颜色亮度与白色/黑色文字亮度的比值（1~21）。数值越大文字越清晰：正文建议 ≥4.5，大标题 ≥3 即可通过 WCAG AA 级校验。'],
        ['吸管取色在所有浏览器都能用吗？', '吸管功能依赖浏览器原生的 EyeDropper API，目前 Chrome 95+ 与 Edge 支持；Firefox 与 Safari 暂不支持，届时按钮会置灰，可改用下方的系统取色器。'],
      ],
    }}>
      <div className="space-y-6">
        {/* 色卡展示 */}
        {rgb && (
          <div className="card p-8 rise">
            <div
              className="w-full h-36 md:h-48 rounded-2xl border border-hairline flex items-end p-5"
              style={{ backgroundColor: rgb.raw }}
            >
              <span className={`font-mono-x font-bold text-lg px-3 py-1 rounded-lg ${lum > 0.35 ? 'text-black' : 'text-white'} bg-black/10`}>
                {rgb.raw}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 mt-4">
              相对亮度 L ≈ {lum?.toFixed(3)} · 与白色文字对比度 {(21 / ((lum ?? 0) + 0.05)).toFixed(2)}:1 · 与黑色文字对比度 {(((lum ?? 1) + 0.05) / 0.05).toFixed(2)}:1
            </p>
          </div>
        )}

        {/* 输入区 */}
        <div className="card p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-hairline shadow-inner" title="点击拾取颜色">
              <input type="color" value={rgb ? rgb.raw : '#000000'}
                onChange={(e) => setHex(e.target.value)}
                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer" />
            </label>
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">HEX 色值</label>
              <input type="text" value={hex} onChange={(e) => setHex(e.target.value)}
                placeholder="#17181C 或 #171"
                className="field !font-sans !py-2.5" spellCheck={false} />
            </div>
            {eyeSupported ? (
              <button onClick={pickScreen} disabled={eyeBusy} className="btn-ink">
                <Pipette size={15} strokeWidth={2.2} /> {eyeBusy ? '取色中…' : '吸管取色'}
              </button>
            ) : (
              <span className="btn-ghost cursor-not-allowed opacity-60" title="当前浏览器不支持 EyeDropper API，建议使用 Chrome / Edge">
                <Pipette size={15} strokeWidth={2.2} /> 吸管（需 Chrome/Edge）
              </span>
            )}
            <button onClick={random} className="btn-ghost"><Dices size={15} strokeWidth={2.2} /> 随机灵感</button>
          </div>
          {eyeErr && <p className="text-sm font-semibold text-[#BE123C]">⚠ {eyeErr}</p>}
          {!rgb && hex.trim() && (
            <p className="text-sm font-semibold text-[#BE123C]">⚠ 不是合法的 HEX 颜色格式</p>
          )}
        </div>

        {/* 格式输出 */}
        {rows && (
          <div className="card divide-y divide-hairline">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="font-mono-x text-xs font-bold text-gray-400 w-14">{label}</span>
                <code className="font-mono-x text-sm font-semibold text-gray-800 flex-1 break-all">{value}</code>
                <CopyBtn text={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
