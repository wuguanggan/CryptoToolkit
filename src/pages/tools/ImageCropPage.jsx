import { useEffect, useRef, useState } from 'react';
import { Crop as CropIcon, Scissors } from 'lucide-react';
import ToolShell from '../../components/ToolShell';

const ASPECTS = [
  ['1:1', 1],
  ['4:3', 4 / 3],
  ['16:9', 16 / 9],
  ['3:4', 3 / 4],
  ['9:16', 9 / 16],
];

export default function ImageCropPage() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [natW, setNatW] = useState(0);
  const [natH, setNatH] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [zoom, setZoom] = useState(110);        // 百分比：图片宽度相对裁剪框的宽度
  const [pos, setPos] = useState({ x: 50, y: 50 }); // background-position 百分比
  const [exporting, setExporting] = useState(false);

  const frameRef = useRef(null);
  const inputRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const pick = (f) => {
    if (!f || !/^image\//.test(f.type)) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    setFile(f);
    setZoom(110);
    setPos({ x: 50, y: 50 });
    const img = new Image();
    img.onload = () => {
      setNatW(img.naturalWidth);
      setNatH(img.naturalHeight);
    };
    img.onerror = () => setNatW(0);
    img.src = url;
  };

  /* ── 拖拽平移 ── */
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const fr = frameRef.current;
    if (!fr) return;
    const { sx, sy, px, py } = dragRef.current;
    const fw = fr.clientWidth;
    const dw = fw * (zoom / 100);
    const dh = dw * (natH / natW);
    const fh = fr.clientHeight;
    const dx = (e.clientX - sx) / Math.max(1, Math.abs(fw - dw)) * 100 * (fw > dw ? 0 : 1);
    const dy = (e.clientY - sy) / Math.max(1, Math.abs(fh - dh)) * 100 * (fh > dh ? 0 : 1);
    setPos({ x: Math.min(100, Math.max(0, px + dx)), y: Math.min(100, Math.max(0, py + dy)) });
  };
  const onPointerUp = () => { dragRef.current = null; };

  /* ── 导出裁剪 ── */
  const doCrop = async () => {
    const fr = frameRef.current;
    if (!fr || !natW) return;
    setExporting(true);
    await new Promise((r) => requestAnimationFrame(r));

    const fw = fr.clientWidth;
    const fh = fr.clientHeight;
    const dw = fw * (zoom / 100);
    const k = dw / natW;                     // css px → 自然像素 比例
    const xLeft = (fw - dw) * (pos.x / 100);
    const dhReal = dw * (natH / natW);
    const yTop = (fh - dhReal) * (pos.y / 100);

    const sw = fw / k;
    const sh = fh / k;
    const outW = Math.round(Math.min(sw, 2000));
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = Math.round(outW * (fh / fw));
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, -xLeft / k, -yTop / k, sw, sh, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setExporting(false);
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cropped-${Date.now()}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      }, 'image/png');
    };
    img.src = imgUrl;
  };

  return (
    <ToolShell toolId="image-crop" guide={{
      intro: [
        '裁剪是配图处理的高频动作：头像需要 1:1 正方形、公众号封面要求 2.35:1、短视频封面常用 9:16 竖版。本工具把"画面拖动定位 + 缩放调节 + 比例锁定"三个操作合并到一个可视化取景框中完成。',
        '与市面上需要在服务器解压再回传的在线裁剪器不同，这里直接读取你浏览器的位图数据完成像素级裁剪，私密截图、证件照等敏感素材不会经过任何第三方。',
      ],
      usage: ['选择图片后，在取景框内按住鼠标拖动画面位置', '用缩放滑杆放大或缩小画面，直至构图满意', '选择输出比例，点击「导出 PNG」保存裁剪结果'],
      faqs: [
        ['为什么画面不能缩小到比取景框更小？', '裁剪要求取景框始终被画面填满，否则会产出空白边。如需缩小画面的"留白式"处理，请先使用缩放功能调整原图尺寸。'],
        ['输出是什么格式？可以更高清吗？', '当前导出为无损 PNG。输出分辨率随源图与缩放比例动态计算（上限 2000px 宽），源图越大导出越清晰。'],
      ],
    }}>
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className="card border-dashed !border-2 p-14 md:p-20 text-center cursor-pointer hover:border-ink hover:bg-white transition-all group rise"
        >
          <CropIcon size={46} strokeWidth={1.5} className="text-gray-400 mb-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-ink" />
          <p className="font-display font-bold text-xl">拖拽图片到这里，或点击选择</p>
          <p className="text-sm text-gray-400 mt-2.5 font-medium">支持任意常见图片格式 · 本地裁剪不上传</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 取景框 */}
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="card !rounded-2xl w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
            style={{ aspectRatio: String(ratio) }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${zoom}% auto`,
                backgroundPosition: `${pos.x}% ${pos.y}%`,
              }}
              draggable="false"
            />
            {/* 三分线辅助 */}
            <div className="pointer-events-none absolute inset-0">
              <style>{`.crop-lines{position:absolute;background:rgba(255,255,255,.35)}.crop-lines.v{width:1px;top:33.33%;bottom:33.33%}.crop-lines.h{height:1px;left:33.33%;right:33.33%}`}</style>
              <span className="crop-lines v" style={{ left: '33.33%' }} />
              <span className="crop-lines v" style={{ left: '66.66%' }} />
              <span className="crop-lines h" style={{ top: '33.33%' }} />
              <span className="crop-lines h" style={{ top: '66.66%' }} />
            </div>
          </div>

          {/* 控制区 */}
          <div className="card p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-end">
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2.5">输出比例</label>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map(([label, r]) => (
                    <button key={label} onClick={() => setRatio(r)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        ratio === r ? 'bg-ink text-paper border-ink' : 'bg-white border-hairline text-gray-600 hover:border-ink hover:text-ink'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2.5">
                  缩放 <span className="font-mono-x text-ink">{zoom}%</span>
                </label>
                <input type="range" min={40} max={400} value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#17181C] cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button onClick={doCrop} disabled={exporting || !natW} className="btn-ink flex-1 sm:flex-none disabled:opacity-50">
                <Scissors size={15} strokeWidth={2.2} /> {exporting ? '正在导出…' : '导出 PNG'}
              </button>
              <button onClick={() => { setZoom(110); setPos({ x: 50, y: 50 }); }} className="btn-ghost">↺ 复位</button>
              <button onClick={() => { setFile(null); setImgUrl(''); setNatW(0); }}
                className="btn-ghost ml-auto">↺ 换一张图片</button>
            </div>
            <p className="text-xs text-gray-400 font-semibold">源图 {natW} × {natH}px · 构图满意后点击导出</p>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
    </ToolShell>
  );
}
