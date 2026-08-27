import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import ToolShell from '../../components/ToolShell';

const fmtSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

const FORMATS = [
  ['png', 'PNG — 无损，支持透明'],
  ['jpeg', 'JPEG — 体积小，兼容性强'],
  ['webp', 'WebP — 现代 Web 首选'],
];

export default function ImageConvertPage() {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState('png');
  const [quality, setQuality] = useState(90);
  const [orig, setOrig] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const urlsRef = useRef([]);
  const inputRef = useRef(null);

  const revokeAll = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  };
  useEffect(() => () => revokeAll(), []);

  useEffect(() => {
    if (!file) return undefined;
    let alive = true;
    const srcUrl = URL.createObjectURL(file);
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = srcUrl;
    })
      .then(async (img) => {
        if (target === 'jpeg') {
          // JPEG 无透明通道：先铺白底
          const c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const cx = c.getContext('2d');
          cx.fillStyle = '#ffffff';
          cx.fillRect(0, 0, c.width, c.height);
          cx.drawImage(img, 0, 0);
          return new Promise((res2) => c.toBlob(res2, 'image/jpeg', quality / 100));
        }
        return fetch(srcUrl).then((r) => (target === 'webp'
          ? new Promise((res2) => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            c.toBlob(res2, 'image/webp', quality / 100);
          })
          : r.blob()));
      })
      .then((blob) => {
        if (!alive || !blob) return;
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        setResult({
          url,
          size: blob.size,
          name: file.name.replace(/\.[^.]+$/, '') + '.' + target,
        });
      })
      .catch(() => { if (alive) setErr('转换失败，请更换文件重试'); });

    return () => { alive = false; URL.revokeObjectURL(srcUrl); };
  }, [file, target, quality]);

  const pick = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr('请选择图片文件'); return; }
    revokeAll();
    setErr('');
    setResult(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setOrig({ url, size: f.size, name: f.name });
  };

  return (
    <ToolShell toolId="image-convert" guide={{
      intro: [
        '不同场景对图片格式的要求不同：部分表单只接受 JPG、公众号配图推荐 PNG 保清晰、网页性能优化则倾向体积更小的 WebP。本工具在浏览器本地完成格式重编码，不需要注册任何在线转换服务账号。',
        '转换为有损格式（JPEG/WebP）时可以调节画质参数平衡体积与观感；输出 PNG 则为无损转存，适合需要透明背景的设计素材。',
      ],
      usage: ['选择需要转换的源图片', '在右侧选择目标格式（有损格式可再调画质）', '点击下载按钮保存转换结果'],
      faqs: [
        ['把 PNG 转成 JPG 后怎么变大了？', '若 PNG 本身是调色板小图（如图标），强行转 JPEG 反而可能更大。这类图保持 PNG 或转 WebP 更划算。'],
        ['格式之间有什么取舍？', 'JPEG 兼容性最好但不支持透明；PNG 支持透明但体积大；WebP 两者兼顾，仅极老旧浏览器不支持。'],
      ],
    }}>
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className="card border-dashed !border-2 p-14 md:p-20 text-center cursor-pointer hover:border-ink hover:bg-white transition-all group rise"
        >
          <RefreshCw size={46} strokeWidth={1.5} className="text-gray-400 mb-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-90 group-hover:text-ink" />
          <p className="font-display font-bold text-xl">拖拽图片到这里，或点击选择</p>
          <p className="text-sm text-gray-400 mt-2.5 font-medium">PNG / JPG / WebP / GIF / BMP · 本地转换不上传</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <h2 className="font-display font-bold text-lg truncate">{orig.name}</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">原始大小 {fmtSize(orig.size)}</p>
              </div>
              <button onClick={() => { setFile(null); setOrig(null); setResult(null); revokeAll(); }}
                className="btn-ghost !py-2 !px-4 shrink-0">↺ 换一张图片</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2.5">目标格式</label>
                <select value={target} onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl px-3 py-3 text-sm font-semibold cursor-pointer outline-none focus:border-ink">
                  {FORMATS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>
              {target !== 'png' && (
                <div className="min-w-[220px]">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2.5">
                    画质 <span className="font-mono-x text-ink">{quality}</span>
                  </label>
                  <input type="range" min={10} max={100} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={target === 'png'}
                    className="w-full accent-[#17181C] cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          {err && <p className="text-sm font-semibold text-[#BE123C]">⚠ {err}</p>}

          {result && (
            <div className="card p-6 md:p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center rise">
              <img src={result.url} alt="转换结果预览"
                className="w-40 h-40 rounded-xl border border-hairline object-contain bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-mono-x font-bold text-lg break-all">{result.name}</p>
                  <p className="text-xs font-semibold mt-1.5">
                    <span className="text-gray-400">{fmtSize(orig.size)} → </span>
                    <span className={result.size <= orig.size ? 'text-[#0D7D71]' : 'text-[#B45309]'}>
                      {fmtSize(result.size)}
                      {result.size > orig.size && '（比原图更大，建议换其他格式对比）'}
                    </span>
                  </p>
                </div>
                <button onClick={() => { const a = document.createElement('a'); a.href = result.url; a.download = result.name; a.click(); }}
                  className="btn-ink shrink-0"><Download size={15} strokeWidth={2.2} /> 下载</button>
              </div>
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
    </ToolShell>
  );
}
