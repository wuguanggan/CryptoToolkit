import { useEffect, useRef, useState } from 'react';
import { ImageUp, Download } from 'lucide-react';
import ToolShell from '../../components/ToolShell';

const fmtSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

export default function ImageCompressPage() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState('jpeg');
  const [maxWidth, setMaxWidth] = useState('');
  const [orig, setOrig] = useState(null);     // {url,w,h,size,name}
  const [result, setResult] = useState(null); // {url,w,h,size,name}
  const [err, setErr] = useState('');
  const urlsRef = useRef([]);
  const inputRef = useRef(null);

  const revokeAll = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  };

  useEffect(() => () => revokeAll(), []);

  /* 压缩流水线：仅在任何异步回调中更新状态 */
  useEffect(() => {
    if (!file) return undefined;
    let alive = true;
    const srcUrl = URL.createObjectURL(file);

    const loadImg = new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = srcUrl;
    });

    loadImg
      .then(async (img) => {
        const mw = parseInt(maxWidth, 10);
        const tw = mw > 0 ? Math.min(img.naturalWidth, mw) : img.naturalWidth;
        const scale = tw / img.naturalWidth;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(tw);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (format === 'jpeg') {           // JPEG 无透明通道，铺白底避免透明区域变黑
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((res) =>
          canvas.toBlob(res, `image/${format}`, format === 'png' ? undefined : quality / 100));
        return blob ? { blob, w: canvas.width, h: canvas.height } : null;
      })
      .then((out) => {
        if (!alive || !out) return;
        const outUrl = URL.createObjectURL(out.blob);
        urlsRef.current.push(outUrl);
        setResult({
          url: outUrl,
          w: out.w,
          h: out.h,
          size: out.blob.size,
          name: file.name.replace(/\.[^.]+$/, '') + `-compressed.${format}`,
        });
      })
      .catch(() => {
        if (alive) setErr('图片处理失败，请确认文件为常见图片格式后重试');
      });

    return () => {
      alive = false;
      URL.revokeObjectURL(srcUrl);
    };
  }, [file, quality, format, maxWidth]);

  const pick = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      setErr('请选择图片文件（PNG / JPG / WebP…）');
      return;
    }
    revokeAll();
    setErr('');
    setResult(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => setOrig({ url, w: img.naturalWidth, h: img.naturalHeight, size: f.size, name: f.name });
    img.onerror = () => setErr('图片解析失败，请更换文件重试');
    img.src = url;
  };

  const reset = () => {
    revokeAll();
    setFile(null);
    setOrig(null);
    setResult(null);
    setErr('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    a.click();
  };

  const savedPct = orig && result && result.size < orig.size
    ? Math.max(1, Math.round((1 - result.size / orig.size) * 100))
    : null;

  return (
    <ToolShell toolId="image-compress" guide={{
      intro: [
        '图片是网页与聊天传输中体积最大的内容：一张手机直出的照片动辄 5MB 以上，而网页展示、公众号配图、表单上传往往限制在几百 KB。本工具通过调整画质参数对图片重新编码，通常能把体积压缩到原来的 20%~60%，肉眼几乎无感知差异。',
        '与传统"上传到服务器压缩"的网站不同，本工具基于浏览器 Canvas 引擎在您的设备本地完成全部处理——照片不会离开电脑，没有数量与频率限制，也没有隐私泄露风险。',
      ],
      usage: ['拖拽或点击选择图片', '按需调整画质、输出格式或最大宽度', '对比预览两侧效果，满意后点击下载'],
      faqs: [
        ['画质调多低比较合适？', '一般 70~85 是画质与体积的最佳平衡区间；用于网页展示可降到 60 左右，用于打印或二次编辑建议保持 90 以上。'],
        ['支持 PNG 吗？透明背景会丢失吗？', '支持输入 PNG。选择 WebP 输出可保留透明背景；若选择 JPEG 输出，透明区域会被填充为白色（JPEG 格式本身不支持透明）。'],
        ['GIF 动图压缩后会动吗？', 'Canvas 处理会丢弃动画帧，GIF 压缩后变为静态首帧图片，如需保留动画请使用专门的 GIF 工具。'],
        ['处理大图有内存限制吗？', '受浏览器可用内存约束，建议单张图片不超过 30MB；超大尺寸 RAW 照片请先转 JPEG 再处理。'],
      ],
    }}>
      {/* 上传区 */}
      {!file && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className="card border-dashed !border-2 p-14 md:p-20 text-center cursor-pointer hover:border-ink hover:bg-white transition-all group rise"
        >
          <ImageUp size={48} strokeWidth={1.5} className="text-gray-400 mb-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:text-ink" />
          <p className="font-display font-bold text-xl">拖拽图片到这里，或点击选择</p>
          <p className="text-sm text-gray-400 mt-2.5 font-medium">支持 PNG / JPG / WebP · 全程本地处理，图片不上传服务器</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={(e) => pick(e.target.files[0])} />

      {file && (
        <div className="space-y-6">
          {/* 参数区 */}
          <div className="card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-display font-bold text-lg">压缩设置</h2>
              <button onClick={reset} className="btn-ghost !py-2 !px-4">↺ 换一张图片</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-3">
                  画质 Quality <span className="font-mono-x text-ink">{quality}</span>
                </label>
                <input type="range" min={10} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-[#17181C] cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-3">输出格式</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl px-3 py-2.5 text-sm font-semibold cursor-pointer outline-none focus:border-ink">
                  <option value="jpeg">JPEG（兼容性最好）</option>
                  <option value="webp">WebP（体积最小）</option>
                  <option value="png">PNG（无损）</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-3">最大宽度 (px)</label>
                <input type="number" min={16} value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  placeholder="留空保持原尺寸"
                  className="field !font-sans" />
              </div>
            </div>
          </div>

          {err && <p className="text-sm font-semibold text-[#BE123C]">⚠ {err}</p>}

          {/* 统计卡 */}
          {result && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card px-4 py-4 text-center">
                <p className="font-mono-x font-bold text-xl">{fmtSize(orig.size)}</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">原始大小</p>
              </div>
              <div className="card px-4 py-4 text-center">
                <p className="font-mono-x font-bold text-xl">{fmtSize(result.size)}</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">压缩后 ({result.w}×{result.h})</p>
              </div>
              <div className={`card px-4 py-4 text-center ${savedPct !== null ? '!border-teal-200' : ''}`}>
                <p className={`font-mono-x font-bold text-xl ${savedPct !== null ? 'text-[#0D7D71]' : 'text-gray-400'}`}>
                  {savedPct !== null ? `-${savedPct}%` : '—'}
                </p>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">节省空间</p>
              </div>
            </div>
          )}

          {/* 对比预览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-3">
              <h3 className="font-display font-bold text-sm tracking-wide text-gray-500 uppercase">原图 Original</h3>
              <div className="rounded-xl overflow-hidden border border-hairline bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:18px_18px] min-h-[12rem] grid place-items-center">
                {orig && <img src={orig.url} alt="原图预览" className="max-h-72 object-contain" />}
              </div>
              {orig && (
                <p className="font-mono-x text-xs text-gray-400 font-semibold">{orig.name} · {orig.w}×{orig.h}</p>
              )}
            </div>
            <div className="card p-6 space-y-3">
              <h3 className="font-display font-bold text-sm tracking-wide uppercase" style={{ color: '#0D7D71' }}>压缩结果 Compressed</h3>
              <div className="rounded-xl overflow-hidden border border-hairline bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:18px_18px] min-h-[12rem] grid place-items-center">
                {result
                  ? <img src={result.url} alt="压缩结果预览" className="max-h-72 object-contain" />
                  : <span className="text-sm text-gray-400 italic font-sans">正在生成…</span>}
              </div>
              {result && (
                <button onClick={download} className="btn-ink w-full"><Download size={15} strokeWidth={2.2} className="shrink-0" /> 下载压缩后的图片（{fmtSize(result.size)}）</button>
              )}
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
