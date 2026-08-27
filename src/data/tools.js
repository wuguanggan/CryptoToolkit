/**
 * 工具注册表 —— 全站唯一数据源
 * 新增工具：在此登记 + 在 pages/tools/resolver.js 中挂载组件即可
 */
import {
  KeyRound, Wrench, Type, Palette,
  Binary, Link2, Hash, Fingerprint, ShieldCheck, Mountain,
  KeySquare, Archive,
  Braces, Ticket, History, Pipette, FileText,
  QrCode, Minimize2, RefreshCw, Crop,
} from 'lucide-react';

export const SITE = {
  name: 'ToolHub',
  cnName: '在线工具箱',
  slogan: '打开即用的浏览器工具箱',
};

export const CATS = [
  {
    id: 'crypto',
    name: '编码与加密',
    desc: '数据编解码与经典加密算法，全部在浏览器本地完成',
    icon: KeyRound,
    color: '#0D7D71',
    tint: '#E7F4F1',
  },
  {
    id: 'dev',
    name: '开发辅助',
    desc: '格式化、调试与时间换算，开发者的日常桌面',
    icon: Wrench,
    color: '#B45309',
    tint: '#FBF0DD',
  },
  {
    id: 'text',
    name: '文本处理',
    desc: '统计、清洗、大小写与批量替换，一键搞定',
    icon: Type,
    color: '#BE123C',
    tint: '#FAE7EC',
  },
  {
    id: 'media',
    name: '图像与生成',
    desc: '二维码、图片处理与格式转换等媒体类实用工具',
    icon: Palette,
    color: '#1D4ED8',
    tint: '#E8EEFB',
  },
];

export const TOOL_LIST = [
  // ── 编码与加密 ──
  { id: 'base64', cat: 'crypto', icon: Binary, name: 'Base64 编解码', en: 'Base64 Encoder', popular: true,
    desc: 'Base64 与文本互转，支持中文，常用于图片内联与协议传输。' },
  { id: 'url-codec', cat: 'crypto', icon: Link2, name: 'URL 编码转换', en: 'URL Encode / Decode',
    desc: '对链接与查询参数进行百分号编码与解码，区分完整 URL 与组件模式。' },
  { id: 'md5', cat: 'crypto', icon: Hash, name: 'MD5 摘要', en: 'MD5 Hash',
    desc: '生成 32 位十六进制消息摘要，用于文件校验与旧系统兼容。' },
  { id: 'sha1', cat: 'crypto', icon: Fingerprint, name: 'SHA-1 摘要', en: 'SHA-1 Hash',
    desc: 'SHA-1 消息摘要算法，Git 版本管理与部分遗留系统仍在使用。' },
  { id: 'sha256', cat: 'crypto', icon: ShieldCheck, name: 'SHA-256 摘要', en: 'SHA-256 Hash', popular: true,
    desc: 'SHA-2 家族主力算法，广泛用于数字签名与区块链完整性验证。' },
  { id: 'sha512', cat: 'crypto', icon: Mountain, name: 'SHA-512 摘要', en: 'SHA-512 Hash',
    desc: '128 位摘要长度的 SHA-2 变体，安全冗余更高。' },
  { id: 'aes', cat: 'crypto', icon: KeyRound, name: 'AES 加解密', en: 'AES Cipher',
    desc: '当前最主流的对称加密标准，输入密钥即可加解密任意文本。' },
  { id: 'des', cat: 'crypto', icon: KeySquare, name: 'DES 加解密', en: 'DES Cipher',
    desc: '经典数据加密标准，兼容早期系统接口联调场景。' },
  { id: 'tripledes', cat: 'crypto', icon: Archive, name: '3DES 加解密', en: 'Triple DES Cipher',
    desc: '三重 DES 加密，为老金融与工控接口提供过渡兼容。' },

  // ── 开发辅助 ──
  { id: 'json', cat: 'dev', icon: Braces, name: 'JSON 格式化', en: 'JSON Formatter', popular: true,
    desc: '美化、压缩与校验 JSON 数据，语法错误精准定位。' },
  { id: 'jwt', cat: 'dev', icon: Ticket, name: 'JWT 解析器', en: 'JWT Decoder',
    desc: '无需密钥即可解码查看 JWT 的 Header 与 Payload 内容。' },
  { id: 'timestamp', cat: 'dev', icon: History, name: '时间戳转换', en: 'Unix Timestamp', popular: true,
    desc: 'Unix 时间戳与人类可读日期双向转换，支持秒与毫秒。' },
  { id: 'color', cat: 'dev', icon: Pipette, name: '颜色转换器', en: 'Color Converter',
    desc: '拾取颜色一键获取 HEX / RGB / HSL 值，前端写 CSS 的取色助手。' },
  { id: 'markdown', cat: 'dev', icon: FileText, name: 'Markdown 编辑器', en: 'Markdown to HTML', popular: true,
    desc: '左边书写右边实时预览，一键导出带样式的 HTML 文件。' },

  // ── 文本处理 ──
  { id: 'text', cat: 'text', icon: Type, name: '文本统计与清洗', en: 'Text Utilities',
    desc: '实时统计字数行数，去重去空行、大小写与查找替换一步完成。' },

  // ── 图像与生成 ──
  { id: 'qrcode', cat: 'media', icon: QrCode, name: '二维码生成器', en: 'QR Code Generator', popular: true,
    desc: '把文字或链接变成高清二维码，支持纠错等级设置与 PNG 下载。' },
  { id: 'image-compress', cat: 'media', icon: Minimize2, name: '图片压缩', en: 'Image Compressor', popular: true,
    desc: '浏览器本地压缩 JPG/WebP 图片，实时预览画质与体积对比，支持缩放尺寸。' },
  { id: 'image-convert', cat: 'media', icon: RefreshCw, name: '图片格式转换', en: 'Image Converter',
    desc: 'PNG / JPG / WebP 互转，输出格式自由指定，本地处理即刻下载。' },
  { id: 'image-crop', cat: 'media', icon: Crop, name: '图片裁剪', en: 'Image Cropper',
    desc: '拖动与缩放画面框选区域，按 1:1、16:9 等常用比例裁剪导出。' },
];

export const getCat = (catId) => CATS.find((c) => c.id === catId);
export const getTool = (id) => TOOL_LIST.find((t) => t.id === id);
