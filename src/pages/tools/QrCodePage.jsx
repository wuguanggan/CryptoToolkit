import { useEffect, useRef, useState } from 'react';
import { QrCode as QrCodeIcon, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import ToolShell from '../../components/ToolShell';
import { InPanel } from '../../components/Panels';

const LEVELS = { L: '低（7% 可纠错）', M: '中（15% 可纠错）', Q: '较高（25%）', H: '高（30%，可遮挡 Logo）' };

export default function QrCodePage() {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(360);
  const [level, setLevel] = useState('M');
  const [dataUrl, setDataUrl] = useState('');
  const [err, setErr] = useState('');
  const canvasWrap = useRef(null);

  useEffect(() => {
    let alive = true;
    const task = text.trim()
      ? QRCodeLib.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: '#17181C', light: '#FFFFFF' } })
        .then((url) => ({ url }))
        .catch(() => ({ err: '内容过长或包含无法编码的字符，请缩短内容后重试' }))
      : Promise.resolve({ url: '' });

    task.then((r) => {
      if (!alive) return;
      setDataUrl(r.url || '');
      setErr(r.err || '');
    });
    return () => { alive = false; };
  }, [text, size, level]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${size}px.png`;
    a.click();
  };

  return (
    <ToolShell toolId="qrcode" guide={{
      intro: [
        '二维码已成为线下场景与移动端分发的标配入口：菜单点单、活动报名、Wi-Fi 分享、App 下载引导都离不开它。本工具将您输入的文字、链接、名片信息实时渲染为高清 PNG 二维码，可直接打印或嵌入海报。',
        '生成过程在浏览器本地完成并即时预览——即使内容是内部系统地址或 Wi-Fi 密码也不会外泄。纠错等级越高，二维码被污损遮挡后仍可识别的概率越大。',
      ],
      usage: ['输入要编码的内容（支持网址、文本、电话号码等）', '按需调整尺寸与纠错等级', '点击下载按钮保存 PNG 图片'],
      faqs: [
        ['二维码能放多少内容？', '理论容量约 2953 字节（低纠错等级下），但内容越多码点越密集、越难扫描。建议链接控制在数百字符内，长内容可先短链化。'],
        ['为什么扫码失败？', '常见原因：尺寸过小导致模糊、纠错等级过高且打印质量差、深色前景浅色背景被反转。建议白底黑码、边距不小于 2 个模块宽度。'],
        ['生成的二维码会过期吗？', '不会。它是静态二维码，内容直接写死在图案里，永久有效，也不依赖任何第三方跳转服务。'],
      ],
    }}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
        {/* 左：参数区 */}
        <div className="card p-6 md:p-8 space-y-6">
          <InPanel label="二维码内容" value={text} onChange={setText} placeholder="输入文字、网址、Wi-Fi 信息…" rows={5} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">尺寸 (px)</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))}
                className="w-full bg-white border border-hairline rounded-xl px-3 py-3 text-sm font-semibold cursor-pointer outline-none">
                {[240, 360, 480, 600, 720].map((s) => <option key={s} value={s}>{s} × {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">纠错等级</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-white border border-hairline rounded-xl px-3 py-3 text-sm font-semibold cursor-pointer outline-none">
                {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
              </select>
            </div>
          </div>
          {err && <p className="text-sm font-semibold text-[#BE123C]">⚠ {err}</p>}
          <button className="btn-ink w-full" onClick={download} disabled={!dataUrl}><Download size={15} strokeWidth={2.2} /> 下载 PNG 图片</button>
        </div>

        {/* 右：预览 */}
        <div ref={canvasWrap} className="card p-8 grid place-items-center md:w-[320px] self-start sticky top-24">
          {dataUrl ? (
            <img src={dataUrl} alt="二维码预览" width={240} height={240}
              className="rounded-xl border border-hairline shadow-sm rise" />
          ) : (
            <div className="w-[240px] h-[240px] grid place-items-center rounded-xl bg-paper border border-dashed border-hairline text-gray-400 text-sm font-semibold gap-3">
              <QrCodeIcon size={40} strokeWidth={1.5} />
              输入内容后实时预览
            </div>
          )}
          <p className="mt-4 text-xs font-semibold text-gray-400">{dataUrl ? `${LEVELS[level].split(' ')[0]} 纠错 · ${size}px` : 'QR Preview'}</p>
        </div>
      </div>
    </ToolShell>
  );
}
