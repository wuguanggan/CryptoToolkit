import { useMemo, useState } from 'react';
import ToolShell from '../../components/ToolShell';
import { InPanel, OutPanel } from '../../components/Panels';

const byteLen = (s) => new TextEncoder().encode(s).length;

export default function TextToolPage() {
  const [input, setInput] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');

  const stats = useMemo(() => ({
    chars: input.length,
    charsNoSpace: input.replace(/\s/g, '').length,
    lines: input ? input.split('\n').length : 0,
    words: (input.match(/[a-zA-Z0-9_]+|[\u4e00-\u9fff]/g) || []).length,
    bytes: byteLen(input),
  }), [input]);

  const transform = (fn) => setInput(fn(input));

  const actions = [
    ['转大写', (s) => s.toUpperCase()],
    ['转小写', (s) => s.toLowerCase()],
    ['去除首尾空白', (s) => s.split('\n').map((l) => l.trim()).join('\n')],
    ['合并多余空格', (s) => s.replace(/[ \t]+/g, ' ')],
    ['去除空行', (s) => s.split('\n').filter((l) => l.trim()).join('\n')],
    ['去除重复行', (s) => [...new Set(s.split('\n'))].join('\n')],
    ['行倒序排列', (s) => s.split('\n').reverse().join('\n')],
    ['中文冒号→英文', (s) => s.replace(/：/g, ':')],
  ];

  return (
    <ToolShell toolId="text" guide={{
      intro: [
        '文本统计与清洗工具面向写作、运营与数据处理场景：实时统计字符数、词数、行数与 UTF-8 字节数；一键完成大小写转换、去重复行、去空行、空格整理等高频操作，还支持整段文本的查找替换。',
        '字数统计对新媒体排版尤其有用——公众号文章、论文摘要通常有字数上限；字节统计则可估算数据库字段或短信的占用空间。',
      ],
      usage: ['粘贴或输入需要处理的文本', '查看顶部实时统计面板', '点击操作按钮立即生效，结果仍在同一编辑区内可继续加工'],
      faqs: [
        ['字数是怎么计算的？', '英文按连续字母数字为一个词，中文每个汉字计一个字，接近 Word 与主流编辑器的口径。'],
        ['所有处理都在本地吗？', '是。您粘贴的任何草稿、账号或隐私内容都不会上传服务器。'],
      ],
    }}>
      <div className="space-y-6">
        {/* 实时统计条 */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[['字符', stats.chars], ['去空格', stats.charsNoSpace], ['单词/汉字', stats.words], ['行数', stats.lines], ['UTF-8 字节', stats.bytes]].map(([k, v]) => (
            <div key={k} className="card px-4 py-3.5 text-center">
              <p className="font-mono-x font-bold text-xl">{v.toLocaleString()}</p>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{k}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 md:p-8 space-y-6">
          <InPanel label="编辑区" value={input} onChange={setInput} placeholder="在此粘贴需要处理的文本…" rows={10} />

          {/* 操作按钮 */}
          <div>
            <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-3">快捷操作</label>
            <div className="flex flex-wrap gap-2.5">
              {actions.map(([name, fn]) => (
                <button key={name} disabled={!input}
                  onClick={() => transform(fn)}
                  className="px-4 py-2 rounded-full bg-white border border-hairline text-sm font-semibold text-gray-700 hover:border-ink hover:text-ink transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                  {name}
                </button>
              ))}
              <button disabled={!input}
                onClick={() => setInput('')}
                className="px-4 py-2 rounded-full bg-red-50 border border-red-100 text-[#BE123C] text-sm font-semibold hover:bg-red-100 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                清空全部
              </button>
            </div>
          </div>

          {/* 查找替换 */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end p-4 rounded-xl bg-paper border border-hairline">
            <div>
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">查找</label>
              <input className="field !font-sans" value={find} onChange={(e) => setFind(e.target.value)} placeholder="要查找的内容" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">替换为</label>
              <input className="field !font-sans" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="替换后的内容" />
            </div>
            <button
              disabled={!find || !input}
              onClick={() => setInput(input.replaceAll(find, replace))}
              className="btn-ink h-[46px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              全部替换
            </button>
          </div>

          {/* 预览 */}
          <OutPanel label="当前文本预览（只读）" value={input.slice(0, 2000)} emptyText="在上方开始输入即可实时预览…" />
        </div>
      </div>
    </ToolShell>
  );
}
