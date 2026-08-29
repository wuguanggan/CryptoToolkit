import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download, Upload, Trash2, Plus, RotateCcw, Undo2, Redo2,
  ZoomIn, ZoomOut, Maximize, FileJson, FileText, Image as ImageIcon,
} from 'lucide-react';
import ToolShell from '../../components/ToolShell';
import {
  uid, defaultTree, findNodeAndParent, setText, addChild, addSibling,
  removeNode, toggleCollapse, setOffset, moveBy, resetPosition,
  layoutTree, layoutBounds, branchColor, treeToMarkdown, treeToJSON, treeFromJSON,
} from '../../lib/mindmap';

const STORAGE_KEY = 'toolhub-mindmap-docs';
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function loadDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((d) => ({
          ...d,
          tree: d.tree && d.tree.id ? d.tree : defaultTree(),
        }));
      }
    }
  } catch {
    /* ignore */
  }
  return [{ id: uid(), name: '未命名导图', updatedAt: Date.now(), tree: defaultTree() }];
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const safeName = (name) => (name || '未命名导图').trim() || '未命名导图';

export default function MindMapPage() {
  const [docs, setDocs] = useState(loadDocs);
  const [currentId, setCurrentId] = useState(() => docs[0]?.id);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const currentDoc = docs.find((d) => d.id === currentId) || docs[0];
  const tree = currentDoc?.tree;

  const svgRef = useRef(null);
  const treeRef = useRef(tree);
  const pastRef = useRef(past);
  const futureRef = useRef(future);
  useEffect(() => { treeRef.current = tree; }, [tree]);
  useEffect(() => { pastRef.current = past; }, [past]);
  useEffect(() => { futureRef.current = future; }, [future]);

  // 自动保存（防抖）
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [docs]);

  const recordHistory = useCallback(() => {
    setPast((p) => [...p, treeRef.current]);
    setFuture([]);
  }, []);

  const commit = useCallback((newTree, record = true) => {
    if (record) recordHistory();
    setDocs((prev) => prev.map((d) => (d.id === currentId ? { ...d, tree: newTree, updatedAt: Date.now() } : d)));
  }, [currentId, recordHistory]);

  const updateNoHistory = useCallback((newTree) => {
    setDocs((prev) => prev.map((d) => (d.id === currentId ? { ...d, tree: newTree, updatedAt: Date.now() } : d)));
  }, [currentId]);

  const undo = useCallback(() => {
    const arr = pastRef.current;
    if (!arr.length) return;
    const prev = arr[arr.length - 1];
    setPast(arr.slice(0, -1));
    setFuture([treeRef.current, ...futureRef.current]);
    setDocs((ds) => ds.map((d) => (d.id === currentId ? { ...d, tree: prev, updatedAt: Date.now() } : d)));
  }, [currentId]);

  const redo = useCallback(() => {
    const arr = futureRef.current;
    if (!arr.length) return;
    const next = arr[0];
    setFuture(arr.slice(1));
    setPast([...pastRef.current, treeRef.current]);
    setDocs((ds) => ds.map((d) => (d.id === currentId ? { ...d, tree: next, updatedAt: Date.now() } : d)));
  }, [currentId]);

  // ── 文档管理 ──
  const selectDoc = (id) => {
    setCurrentId(id);
    setPast([]);
    setFuture([]);
  };
  const newDoc = () => {
    const doc = { id: uid(), name: '未命名导图', updatedAt: Date.now(), tree: defaultTree() };
    setDocs((prev) => [...prev, doc]);
    selectDoc(doc.id);
  };
  const renameDoc = (name) =>
    setDocs((prev) => prev.map((d) => (d.id === currentId ? { ...d, name } : d)));
  const deleteDoc = () => {
    const next = docs.filter((d) => d.id !== currentId);
    const remaining = next.length ? next : [{ id: uid(), name: '未命名导图', updatedAt: Date.now(), tree: defaultTree() }];
    setDocs(remaining);
    selectDoc(remaining[0].id);
  };

  // ── 导出 ──
  const docName = safeName(currentDoc?.name);
  const exportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    downloadBlob(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }), `${docName}.svg`);
  };
  const exportPNG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const scale = 2;
    const w = svg.width.baseVal.value;
    const h = svg.height.baseVal.value;
    const xml = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => b && downloadBlob(b, `${docName}.png`), 'image/png');
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };
  const exportJSON = () =>
    downloadBlob(new Blob([treeToJSON(tree)], { type: 'application/json;charset=utf-8' }), `${docName}.json`);
  const exportMarkdown = () =>
    downloadBlob(new Blob([treeToMarkdown(tree)], { type: 'text/markdown;charset=utf-8' }), `${docName}.md`);

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        commit(treeFromJSON(reader.result));
      } catch {
        window.alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ToolShell toolId="mindmap" guide={{
      intro: [
        '思维导图是一种把想法围绕中心主题向外发散的视觉化工具，常用于头脑风暴、会议纪要、知识梳理与项目拆解。本工具在浏览器本地即可完成创建、编辑与导出，无需注册账号。',
        '所有节点数据与多份导图文档都通过 localStorage 保存在你自己的浏览器里，刷新或关闭页面都不会丢失，也不会被上传到任何服务器。你可以随时导出为 PNG、SVG、JSON 或 Markdown，方便分享与归档。',
      ],
      usage: [
        '双击节点可重命名；选中节点后按 Tab 新增子节点、Enter 新增兄弟节点',
        '拖动节点自由摆放位置，拖动空白处平移画布，滚轮或右上角按钮缩放',
        '点击节点旁的小圆点可折叠/展开分支，工具栏可新建、切换、重命名与删除导图',
        '点击「导出」按需下载 PNG 图片、SVG 矢量图、JSON 数据或 Markdown 大纲',
      ],
      faqs: [
        ['数据保存在哪里？', '全部保存在浏览器的 localStorage 中，仅限本机本浏览器，清除浏览器数据会一并删除，请及时导出备份。'],
        ['导出的 JSON 有什么用？', 'JSON 保存了完整的导图结构，可再次通过「导入」按钮恢复到编辑状态，也方便迁移到其它设备。'],
        ['可以拖动节点吗？', '可以。拖动会记录手动偏移，点击工具栏的「重置布局」即可恢复到自动排列。'],
      ],
    }}>
      <div className="space-y-4">
        {/* ── 工具栏：文档管理 + 撤销重做 + 导出 ── */}
        <div className="card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentDoc?.id}
              onChange={(e) => selectDoc(e.target.value)}
              className="field !w-auto !py-2 !px-3 !text-xs cursor-pointer"
            >
              {docs.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button onClick={newDoc} className="btn-ghost !py-2 !px-3 !text-xs"><Plus size={13} /> 新建</button>
            <input
              value={currentDoc?.name || ''}
              onChange={(e) => renameDoc(e.target.value)}
              className="field !w-32 !py-2 !px-3 !text-xs"
              placeholder="导图名称"
            />
            <button
              onClick={() => { if (window.confirm('确定删除当前导图？')) deleteDoc(); }}
              className="btn-ghost !py-2 !px-3 !text-xs text-red-600 hover:!border-red-500 hover:!text-red-600"
            >
              <Trash2 size={13} /> 删除
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={undo} className="btn-ghost !py-2 !px-3 !text-xs" title="撤销"><Undo2 size={13} /></button>
            <button onClick={redo} className="btn-ghost !py-2 !px-3 !text-xs" title="重做"><Redo2 size={13} /></button>
            <button onClick={() => commit(resetPosition(tree))} className="btn-ghost !py-2 !px-3 !text-xs" title="重置布局"><RotateCcw size={13} /></button>

            <span className="w-px h-5 bg-hairline mx-1 hidden sm:block" />

            <button onClick={exportPNG} className="btn-ink !py-2 !px-3 !text-xs"><ImageIcon size={13} /> PNG</button>
            <button onClick={exportSVG} className="btn-ghost !py-2 !px-3 !text-xs">SVG</button>
            <button onClick={exportJSON} className="btn-ghost !py-2 !px-3 !text-xs"><FileJson size={13} /> JSON</button>
            <button onClick={exportMarkdown} className="btn-ghost !py-2 !px-3 !text-xs"><FileText size={13} /> MD</button>
            <label className="btn-ghost !py-2 !px-3 !text-xs cursor-pointer">
              <Upload size={13} /> 导入
              <input type="file" accept=".json,application/json" className="hidden"
                onChange={(e) => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; }} />
            </label>
          </div>
        </div>

        {/* ── 画布 ── */}
        <MindMapCanvas
          key={currentId}
          tree={tree}
          svgRef={svgRef}
          onCommit={commit}
          onUpdateNoHistory={updateNoHistory}
          onRecordStart={recordHistory}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
    </ToolShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 画布组件：负责渲染、平移缩放、选中/编辑、拖拽与键盘交互
// ─────────────────────────────────────────────────────────────
function MindMapCanvas({ tree, svgRef, onCommit, onUpdateNoHistory, onRecordStart, onUndo, onRedo }) {
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const containerRef = useRef(null);
  const viewRef = useRef(view);
  const treeRef = useRef(tree);
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const fitRef = useRef(false);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { treeRef.current = tree; }, [tree]);

  const { nodes, edges, bounds } = useMemo(() => {
    const { nodes, edges } = layoutTree(tree);
    const bounds = layoutBounds(nodes);
    return { nodes, edges, bounds };
  }, [tree]);

  const fitView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const k = clamp(Math.min(el.clientWidth / bounds.width, el.clientHeight / bounds.height, 1), 0.1, 1);
    setView({ k, x: (el.clientWidth - bounds.width * k) / 2, y: (el.clientHeight - bounds.height * k) / 2 });
  }, [bounds]);

  // 初始与切换文档时自适应画布
  useEffect(() => {
    if (!fitRef.current) {
      fitRef.current = true;
      const t = setTimeout(fitView, 0);
      return () => clearTimeout(t);
    }
  }, [fitView]);

  const zoomBy = (f) => {
    const el = containerRef.current;
    const mx = el ? el.clientWidth / 2 : 0;
    const my = el ? el.clientHeight / 2 : 0;
    setView((v) => {
      const k = clamp(v.k * f, 0.25, 3);
      const ff = k / v.k;
      return { k, x: mx - (mx - v.x) * ff, y: my - (my - v.y) * ff };
    });
  };

  // 滚轮缩放（非被动监听以允许 preventDefault）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setView((v) => {
        const k = clamp(v.k * f, 0.25, 3);
        const ff = k / v.k;
        return { k, x: mx - (mx - v.x) * ff, y: my - (my - v.y) * ff };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // 节点拖拽 + 画布平移
  useEffect(() => {
    const move = (e) => {
      if (dragRef.current) {
        const d = dragRef.current;
        const dx = (e.clientX - d.sx) / viewRef.current.k;
        const dy = (e.clientY - d.sy) / viewRef.current.k;
        if (!d.moved) {
          if (Math.abs(dx) + Math.abs(dy) < 3) return;
          d.moved = true;
          onRecordStart();
        }
        onUpdateNoHistory(setOffset(treeRef.current, d.id, d.odx + dx, d.ody + dy));
      } else if (panRef.current) {
        const p = panRef.current;
        setView((v) => ({ ...v, x: p.ox + (e.clientX - p.sx), y: p.oy + (e.clientY - p.sy) }));
      }
    };
    const up = () => { dragRef.current = null; panRef.current = null; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [onUpdateNoHistory, onRecordStart]);

  const startEdit = (id) => {
    const n = findNodeAndParent(treeRef.current, id)?.node;
    if (!n) return;
    setEditingId(id);
    setEditingText(n.text);
  };

  const commitEdit = () => {
    if (editingId) {
      const txt = (editingText || '').trim();
      const target = findNodeAndParent(treeRef.current, editingId)?.node;
      if (txt && target && txt !== target.text) onCommit(setText(treeRef.current, editingId, txt));
    }
    setEditingId(null);
    setEditingText('');
  };

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? onRedo() : onUndo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); onRedo(); return; }
      if (!selectedId) return;
      if (!findNodeAndParent(treeRef.current, selectedId)) { setSelectedId(null); return; }
      switch (e.key) {
        case 'Tab': e.preventDefault(); onCommit(addChild(treeRef.current, selectedId)); break;
        case 'Enter': e.preventDefault(); onCommit(addSibling(treeRef.current, selectedId)); break;
        case 'Delete':
        case 'Backspace': e.preventDefault(); onCommit(removeNode(treeRef.current, selectedId)); setSelectedId(null); break;
        case 'F2': e.preventDefault(); startEdit(selectedId); break;
        case 'Escape': setSelectedId(null); break;
        case 'ArrowUp': e.preventDefault(); onCommit(moveBy(treeRef.current, selectedId, 0, -24)); break;
        case 'ArrowDown': e.preventDefault(); onCommit(moveBy(treeRef.current, selectedId, 0, 24)); break;
        case 'ArrowLeft': e.preventDefault(); onCommit(moveBy(treeRef.current, selectedId, -24, 0)); break;
        case 'ArrowRight': e.preventDefault(); onCommit(moveBy(treeRef.current, selectedId, 24, 0)); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onNodeMouseDown = (e, id) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedId(id);
    const n = findNodeAndParent(treeRef.current, id)?.node;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, odx: n?._dx || 0, ody: n?._dy || 0, moved: false };
  };

  const onCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    panRef.current = { sx: e.clientX, sy: e.clientY, ox: viewRef.current.x, oy: viewRef.current.y };
    setSelectedId(null);
  };

  const ox = bounds.minX;
  const oy = bounds.minY;
  const editingEntry = editingId ? nodes.find((n) => n.node.id === editingId) : null;

  return (
    <div className="card overflow-hidden relative">
      <div
        ref={containerRef}
        className="relative w-full h-[34rem] overflow-hidden select-none"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onMouseDown={onCanvasMouseDown}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: bounds.width,
            height: bounds.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: '0 0',
          }}
        >
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width={Math.max(1, Math.ceil(bounds.width))}
            height={Math.max(1, Math.ceil(bounds.height))}
            viewBox={`0 0 ${Math.max(1, Math.ceil(bounds.width))} ${Math.max(1, Math.ceil(bounds.height))}`}
          >
            <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />

            {/* 连线 */}
            {edges.map((edge, i) => (
              <path
                key={i}
                d={`M ${edge.x1 - ox} ${edge.y1 - oy} C ${(edge.x1 + edge.x2) / 2 - ox} ${edge.y1 - oy}, ${(edge.x1 + edge.x2) / 2 - ox} ${edge.y2 - oy}, ${edge.x2 - ox} ${edge.y2 - oy}`}
                fill="none"
                stroke={branchColor(edge.branch)}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
              />
            ))}

            {/* 节点 */}
            {nodes.map((n) => {
              const x = n.x - ox;
              const y = n.y - oy;
              const isRoot = n.depth === 0;
              const color = isRoot ? '#17181C' : branchColor(n.branch);
              const selected = selectedId === n.node.id;
              const hasChildren = n.node.children?.length > 0;
              return (
                <g
                  key={n.node.id}
                  className="mm-node"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={(e) => onNodeMouseDown(e, n.node.id)}
                  onDoubleClick={() => startEdit(n.node.id)}
                >
                  <rect
                    x={x - n.w / 2}
                    y={y - n.h / 2}
                    width={n.w}
                    height={n.h}
                    rx={n.h / 2}
                    fill={isRoot ? '#17181C' : n.depth === 1 ? color : '#ffffff'}
                    stroke={selected ? '#17181C' : isRoot ? '#17181C' : color}
                    strokeWidth={selected ? 2.5 : n.depth === 1 ? 0 : 1.5}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'PingFang SC','Microsoft YaHei',system-ui,sans-serif"
                    fontSize={n.fontSize}
                    fontWeight={n.fontWeight}
                    fill={isRoot || n.depth === 1 ? '#ffffff' : '#17181C'}
                  >
                    {n.node.text}
                  </text>
                  {hasChildren && (
                    <g
                      style={{ cursor: 'pointer' }}
                      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      onClick={() => onCommit(toggleCollapse(treeRef.current, n.node.id))}
                    >
                      <circle cx={x + n.w / 2 + 7} cy={y - n.h / 2 + 4} r="8" fill="#ffffff" stroke={color} strokeWidth="1.5" />
                      <text
                        x={x + n.w / 2 + 7}
                        y={y - n.h / 2 + 4}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="sans-serif"
                        fontSize="10"
                        fontWeight="700"
                        fill={color}
                      >
                        {n.node.collapsed ? n.node.children.length : '−'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* 行内编辑输入框（覆盖在节点上） */}
          {editingEntry && (
            <input
              autoFocus
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                if (e.key === 'Escape') setEditingId(null);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: editingEntry.x - ox - editingEntry.w / 2,
                top: editingEntry.y - oy - editingEntry.h / 2,
                width: Math.max(editingEntry.w, 90),
                height: editingEntry.h,
                fontSize: editingEntry.fontSize,
                fontWeight: editingEntry.fontWeight,
                textAlign: 'center',
                fontFamily: "'PingFang SC','Microsoft YaHei',system-ui,sans-serif",
                border: '2px solid #17181C',
                borderRadius: editingEntry.h / 2,
                outline: 'none',
                background: '#fff',
                color: '#17181C',
                boxSizing: 'border-box',
                padding: '0 8px',
              }}
            />
          )}
        </div>

        {/* 缩放控制 */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button onClick={() => zoomBy(1.2)} className="canvas-ctl" title="放大"><ZoomIn size={15} /></button>
          <button onClick={() => zoomBy(1 / 1.2)} className="canvas-ctl" title="缩小"><ZoomOut size={15} /></button>
          <button onClick={fitView} className="canvas-ctl" title="适应画布"><Maximize size={15} /></button>
        </div>

        {/* 选中节点操作 */}
        {selectedId && findNodeAndParent(tree, selectedId) && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
            <button onClick={() => onCommit(addChild(treeRef.current, selectedId))} className="canvas-chip">+ 子节点</button>
            <button onClick={() => onCommit(addSibling(treeRef.current, selectedId))} className="canvas-chip">兄弟节点</button>
            <button
              onClick={() => { onCommit(removeNode(treeRef.current, selectedId)); setSelectedId(null); }}
              className="canvas-chip !text-red-600"
            >
              删除
            </button>
          </div>
        )}

        {/* 快捷键提示 */}
        <div className="absolute bottom-3 right-3 z-10 text-[11px] text-gray-400 font-mono-x bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg pointer-events-none">
          Tab 子节点 · Enter 兄弟 · Delete 删除 · 双击重命名 · 拖动/滚轮
        </div>
      </div>
    </div>
  );
}
