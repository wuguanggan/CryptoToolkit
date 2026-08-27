import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ToolShell from '../../components/ToolShell';

const SAMPLE = `# 欢迎使用 Markdown 编辑器

在左侧书写，右侧**实时预览**。

## 支持的语法

- **加粗**、*斜体*、~~删除线~~
- 有序与无序列表
- [链接](https://example.com) 与图片
- 行内代码 \`const x = 1\`

> 引用块：好的工具让创作更专注

| 表格 | 也可以 |
| ---- | ------ |
| ✅   | 支持   |

\`\`\`js
// 代码块同样没问题
function hello() {
  return 'world';
}
\`\`\`
`;

export default function MarkdownPage() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState('preview');

  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);
  const stats = useMemo(() => ({
    words: (md.match(/[a-zA-Z0-9_]+|[\u4e00-\u9fff]/g) || []).length,
    lines: md.split('\n').length,
  }), [md]);

  const download = () => {
    const doc = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body{max-width:760px;margin:48px auto;padding:0 20px;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.8;color:#24292f}
h1,h2,h3{line-height:1.4;border-bottom:1px solid #eaecef;padding-bottom:.3em}
pre{background:#f6f8fa;padding:16px;border-radius:10px;overflow:auto}
code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;background:#f6f8fa;padding:2px 5px;border-radius:4px}
pre code{background:none;padding:0}
blockquote{margin:0;padding:0 1em;color:#57606a;border-left:.25em solid #d0d7de}
table{border-collapse:collapse}th,td{border:1px solid #d0d7de;padding:6px 13px}
img{max-width:100%}a{color:#0969da}
</style>
</head>
<body>
${html}
</body>
</html>`;
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolShell toolId="markdown" guide={{
      intro: [
        'Markdown 是轻量级标记语言的事实标准：GitHub README、掘金与知乎专栏、Notion 与语雀笔记都基于它。本编辑器提供左侧书写、右侧即时渲染的分屏体验，帮助你在发布前确认排版效果。',
        '导出功能会把当前文章连同阅读友好的中文样式打包为一个独立 HTML 文件，双击即可在任何浏览器打开，也适合粘贴进邮件或静态网站。所有解析都在本地完成，草稿内容不会上传。',
      ],
      usage: ['在左栏用 Markdown 语法书写，右栏实时预览渲染效果', '切换「HTML 源码」视图查看生成的标签', '点击「导出 HTML 文件」下载带样式的独立文档'],
      faqs: [
        ['支持哪些 Markdown 扩展语法？', '已覆盖 GFM 常用扩展：表格、删除线、任务列表与代码块围栏，足以满足绝大多数写作场景。'],
        ['导出的 HTML 可以自定义样式吗？', '可以先用默认样式导出，再用编辑器替换 <style> 部分的 CSS；HTML 结构是标准语义化标签，套主题很方便。'],
      ],
    }}>
      <div className="space-y-4">
        {/* 工具条 */}
        <div className="card px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs font-semibold text-gray-400 font-mono-x">
            {stats.words.toLocaleString()} 词 · {stats.lines} 行 · {((new TextEncoder().encode(md).length) / 1024).toFixed(1)} KB
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button onClick={download} className="btn-ink !py-2 !px-4 !text-xs"><Download size={13} strokeWidth={2.2} /> 导出 HTML 文件</button>
            <button onClick={() => navigator.clipboard.writeText(html)}
              className="btn-ghost !py-2 !px-4 !text-xs">⧉ 复制 HTML</button>
            <div className="flex rounded-xl border border-hairline overflow-hidden ml-1">
              {[['preview', '预览'], ['html', 'HTML 源码']].map(([k, label]) => (
                <button key={k} onClick={() => setView(k)}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${view === k ? 'bg-ink text-paper' : 'bg-white text-gray-500 hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 双栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            placeholder="# 在此输入 Markdown…"
            className="field h-[32rem] resize-none leading-relaxed rounded-2xl"
          />
          {view === 'preview' ? (
            <article
              className="card h-[32rem] overflow-auto p-8 md-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="card h-[32rem] overflow-auto p-6 font-mono-x text-xs leading-relaxed text-gray-600 whitespace-pre-wrap break-all bg-[#FBFAF7]">
              {html}
            </pre>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
