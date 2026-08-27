import { useState } from 'react';
import ToolShell from '../../components/ToolShell';
import { InPanel, OutPanel } from '../../components/Panels';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [err, setErr] = useState('');
  const [indent, setIndent] = useState('2');

  const process = (mode) => {
    setErr('');
    setResult('');
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      setResult(mode === 'min' ? JSON.stringify(obj) : JSON.stringify(obj, null, indent === 'tab' ? '\t' : Number(indent)));
    } catch (e) {
      const m = /position (\d+)/.exec(e.message);
      let posInfo = '';
      if (m) {
        const pos = Number(m[1]);
        const line = input.slice(0, pos).split('\n').length;
        posInfo = `，疑似位于第 ${line} 行附近`;
      }
      setErr(`JSON 语法错误${posInfo}：${e.message}`);
    }
  };

  return (
    <ToolShell toolId="json" guide={{
      intro: [
        'JSON 是现代 Web 服务最流行的数据交换格式，但接口返回的数据通常是压缩后的单行文本，肉眼难以阅读。本工具可以一键把 JSON 数据格式化为带缩进的树状结构，也可反向压缩以减小体积。',
        '校验功能会在语法错误时精确提示出错的行号，帮您快速定位接口调试中的问题。全部解析均在浏览器完成，敏感接口数据不会外泄。',
      ],
      usage: ['粘贴 JSON 字符串（支持单行压缩或已格式化的数据）', '选择缩进风格后点击「格式化」或「压缩」', '发生错误时根据提示修正输入后重试'],
      faqs: [
        ['提示 Unexpected token 怎么办？', '常见原因：使用了单引号、对象属性名未加双引号、末尾多了逗号。JSON 的标准比 JavaScript 对象字面量更严格。'],
        ['支持多大的文件？', '受限于浏览器内存，建议在 5MB 以内使用。超大 JSON 请使用命令行工具处理。'],
      ],
    }}>
      <div className="card p-6 md:p-8 space-y-6">
        <InPanel label="JSON 输入" value={input} onChange={(v) => { setInput(v); setErr(''); }} placeholder='{"name":"ToolHub","tags":["json","format"]}' />
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-ink" onClick={() => process('fmt')}>{} 格式化</button>
          <button className="btn-ghost" onClick={() => process('min')}>⇲ 压缩</button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold text-gray-400 uppercase">缩进</span>
            <select value={indent} onChange={(e) => setIndent(e.target.value)}
              className="text-sm font-semibold bg-white border border-hairline rounded-lg px-2.5 py-2 outline-none cursor-pointer">
              <option value="2">2 空格</option>
              <option value="4">4 空格</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>
        {err && <p className="text-sm font-semibold text-[#BE123C] whitespace-pre-wrap">⚠ {err}</p>}
        <OutPanel value={result} emptyText="等待格式化…" />
      </div>
    </ToolShell>
  );
}
