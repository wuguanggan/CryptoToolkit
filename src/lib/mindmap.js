/**
 * 思维导图核心工具库（纯函数，无 React 依赖）
 * 负责：节点数据模型、树操作、自动布局、文本测量、导出格式转换
 */

// ── 节点模型 ────────────────────────────────────────────────
export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'n' + Math.random().toString(36).slice(2) + Date.now().toString(36);

export const makeNode = (text = '新节点') => ({
  id: uid(),
  text,
  children: [],
  collapsed: false,
  _dx: 0,
  _dy: 0,
});

/** 默认示例导图 */
export function defaultTree() {
  const root = makeNode('中心主题');
  const b1 = makeNode('分支一');
  b1.children = [makeNode('子主题 A'), makeNode('子主题 B')];
  const b2 = makeNode('分支二');
  b2.children = [makeNode('子主题 C')];
  const b3 = makeNode('分支三');
  root.children = [b1, b2, b3];
  return root;
}

/** 深拷贝 + 规范化（用于导入 JSON） */
function normalize(n) {
  return {
    id: n.id || uid(),
    text: n.text || '未命名',
    collapsed: !!n.collapsed,
    _dx: 0,
    _dy: 0,
    children: (n.children || []).map(normalize),
  };
}

export function treeFromJSON(text) {
  const data = JSON.parse(text);
  const root = data.root || data;
  if (!root || typeof root !== 'object') throw new Error('bad format');
  return normalize(root);
}

// ── 树操作（不可变，返回新树） ────────────────────────────────
export function findNodeAndParent(root, id, parent = null, index = -1) {
  if (root.id === id) return { node: root, parent, index };
  if (!root.children) return null;
  for (let i = 0; i < root.children.length; i++) {
    const r = findNodeAndParent(root.children[i], id, root, i);
    if (r) return r;
  }
  return null;
}

function updateAt(node, id, updater) {
  if (node.id === id) return updater(node);
  if (!node.children) return node;
  let changed = false;
  const children = node.children.map((c) => {
    const nc = updateAt(c, id, updater);
    if (nc !== c) changed = true;
    return nc;
  });
  return changed ? { ...node, children } : node;
}

function mapAll(node, fn) {
  const cloned = fn(node);
  if (cloned.children) cloned.children = cloned.children.map((c) => mapAll(c, fn));
  return cloned;
}

export const setText = (tree, id, text) => updateAt(tree, id, (n) => ({ ...n, text }));

export const toggleCollapse = (tree, id) => updateAt(tree, id, (n) => ({ ...n, collapsed: !n.collapsed }));

export function addChild(tree, parentId) {
  return updateAt(tree, parentId, (n) => ({
    ...n,
    collapsed: false,
    children: [...(n.children || []), makeNode()],
  }));
}

export function addSibling(tree, id) {
  const found = findNodeAndParent(tree, id);
  if (!found || !found.parent) return addChild(tree, id);
  return updateAt(tree, found.parent.id, (p) => {
    const children = [...p.children];
    children.splice(found.index + 1, 0, makeNode());
    return { ...p, children };
  });
}

export function removeNode(tree, id) {
  const found = findNodeAndParent(tree, id);
  if (!found || !found.parent) return tree;
  return updateAt(tree, found.parent.id, (p) => ({
    ...p,
    children: p.children.filter((_, i) => i !== found.index),
  }));
}

/** 设置节点手动偏移（绝对坐标，供拖动使用） */
export const setOffset = (tree, id, dx, dy) =>
  updateAt(tree, id, (n) => ({ ...n, _dx: dx, _dy: dy }));

/** 增量移动（供方向键微调） */
export const moveBy = (tree, id, dx, dy) =>
  updateAt(tree, id, (n) => ({ ...n, _dx: (n._dx || 0) + dx, _dy: (n._dy || 0) + dy }));

/** 清除所有手动偏移，恢复自动布局 */
export const resetPosition = (tree) => mapAll(tree, (n) => ({ ...n, _dx: 0, _dy: 0 }));

// ── 布局 ────────────────────────────────────────────────────
export const BRANCH_COLORS = [
  '#0D7D71', '#B45309', '#BE123C', '#1D4ED8',
  '#6D28D9', '#0E7490', '#9D174D', '#166534',
];

export const branchColor = (branch) => BRANCH_COLORS[Math.abs(branch) % BRANCH_COLORS.length];

// ── 文本测量 ────────────────────────────────────────────────
let measureCtx;
function getMeasureCtx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  return measureCtx;
}

export function measureText(text, fontSize = 14, fontWeight = 600) {
  const c = getMeasureCtx();
  c.font = `${fontWeight} ${fontSize}px 'PingFang SC','Microsoft YaHei',system-ui,sans-serif`;
  return c.measureText(text || '').width;
}

export function nodeStyle(depth) {
  if (depth === 0) return { fontSize: 15, fontWeight: 700, h: 40, padX: 20 };
  if (depth === 1) return { fontSize: 14, fontWeight: 600, h: 34, padX: 16 };
  return { fontSize: 13, fontWeight: 500, h: 30, padX: 14 };
}

export function nodeSize(text, depth) {
  const s = nodeStyle(depth);
  const w = measureText(text, s.fontSize, s.fontWeight) + s.padX * 2;
  return { w: Math.max(w, s.h), h: s.h, ...s };
}

function computeLeafRange(node, counter) {
  const leaf = node.collapsed || !node.children || node.children.length === 0;
  if (leaf) {
    node.__left = counter.i;
    node.__right = counter.i;
    counter.i++;
    return;
  }
  let first = Infinity;
  let last = -Infinity;
  for (const c of node.children) {
    computeLeafRange(c, counter);
    if (c.__left < first) first = c.__left;
    if (c.__right > last) last = c.__right;
  }
  node.__left = first;
  node.__right = last;
}

/**
 * 水平自动布局：根节点居左，叶子纵向展开，内部节点取其子树居中。
 * 返回 { nodes: 布局节点数组, edges: 连线数组 }
 */
export function layoutTree(root, opts = {}) {
  const hGap = opts.hGap ?? 130;
  const vGap = opts.vGap ?? 46;
  const counter = { i: 0 };
  computeLeafRange(root, counter);

  const nodes = [];
  const edges = [];

  function walk(node, depth, accDx, accDy, branch, parentPos) {
    const leaf = node.collapsed || !node.children || node.children.length === 0;
    const y = ((node.__left + node.__right) / 2) * vGap;
    const x = depth * hGap;
    const nx = x + accDx + (node._dx || 0);
    const ny = y + accDy + (node._dy || 0);
    const size = nodeSize(node.text, depth);
    const entry = { node, x: nx, y: ny, depth, branch, leaf, ...size };
    nodes.push(entry);

    if (parentPos) {
      edges.push({
        x1: parentPos.x + parentPos.w / 2,
        y1: parentPos.y,
        x2: nx - size.w / 2,
        y2: ny,
        branch,
      });
    }

    if (!leaf) {
      const ndx = accDx + (node._dx || 0);
      const ndy = accDy + (node._dy || 0);
      for (let i = 0; i < node.children.length; i++) {
        walk(node.children[i], depth + 1, ndx, ndy, depth === 0 ? i : branch, {
          x: nx,
          y: ny,
          w: size.w,
        });
      }
    }
  }

  walk(root, 0, 0, 0, -1, null);
  return { nodes, edges };
}

/** 计算布局的整体包围盒 */
export function layoutBounds(nodes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.w / 2);
    maxX = Math.max(maxX, n.x + n.w / 2);
    minY = Math.min(minY, n.y - n.h / 2);
    maxY = Math.max(maxY, n.y + n.h / 2);
  }
  const pad = 70;
  return {
    minX: minX - pad,
    minY: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

// ── 导出格式转换 ─────────────────────────────────────────────
export function treeToMarkdown(node, depth = 0) {
  const pad = '  '.repeat(depth);
  const line = `${pad}- ${node.text}`;
  const kids = (node.children || []).map((c) => treeToMarkdown(c, depth + 1));
  return kids.length ? line + '\n' + kids.join('\n') : line;
}

export function treeToJSON(tree) {
  const strip = (n) => ({
    id: n.id,
    text: n.text,
    collapsed: !!n.collapsed,
    children: (n.children || []).map(strip),
  });
  return JSON.stringify({ version: 1, root: strip(tree) }, null, 2);
}
