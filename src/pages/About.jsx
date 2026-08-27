import useMeta from '../hooks/useMeta';
import { Link } from 'react-router-dom';
import { TOOL_LIST } from '../data/tools';

export default function About() {
  useMeta('关于本站', 'ToolHub 在线工具箱的介绍：定位、技术架构与工具列表。');
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="card p-8 md:p-12 rise">
        <h1 className="font-display font-extrabold text-4xl tracking-tight mb-3">关于 ToolHub</h1>
        <p className="text-gray-500 text-sm mb-10">让每个常用小工具都触手可及，且不需要付出隐私代价。</p>

        <div className="space-y-6 text-[15px] leading-loose text-gray-700">
          <p>
            <b>ToolHub（在线工具箱）</b>是一个免费开放的纯前端实用工具集合。我们的起步项目是一组加密解密工具
            （AES、DES、MD5、SHA 系列、Base64），随后逐步扩展到开发调试、文本处理与媒体生成等日常高频场景，
            现已收录 {TOOL_LIST.length} 款工具并持续增长。
          </p>
          <p>
            <b>我们坚持三个原则：</b>
            <br />一、所有计算在浏览器本地完成，任何输入都不会上传服务器——这既是隐私承诺，也带来了即开即用的速度；
            <br />二、界面克制干净，没有弹窗广告与强制注册，打开即用；
            <br />三、每个工具页都配有使用说明与常见问题解答，帮助初次接触的用户理解原理。
          </p>
          <div className="bg-paper border border-hairline rounded-2xl p-6 not-italic text-sm leading-relaxed text-gray-600">
            <b className="text-gray-800 block mb-2">开源与技术栈</b>
            本站基于 React 19 + Vite 构建，加密能力来自开源库 CryptoJS，二维码生成基于 node-qrcode。
            项目源码托管于{' '}
            <a href="https://github.com/wuguanggan/CryptoToolkit" target="_blank" rel="noreferrer"
              className="font-bold underline decoration-teal-500 decoration-2 underline-offset-2 hover:decoration-ink transition-colors">
              GitHub
            </a>，欢迎 star 与贡献。
          </div>
        </div>

        <h2 className="font-display font-bold text-xl mt-12 mb-5">全部工具一览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOOL_LIST.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.id} to={`/tools/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-paper border border-hairline hover:border-ink transition-colors group">
                <Icon size={16} strokeWidth={2.2} color="#57534e" />
                <span className="text-sm font-bold">{t.name}</span>
                <span className="ml-auto text-gray-300 group-hover:text-ink">→</span>
              </Link>
            );
          })}
        </div>

        <h2 className="font-display font-bold text-xl mt-12 mb-4">联系我们</h2>
        <p className="text-sm leading-relaxed text-gray-600">
          如果您发现了 Bug、希望新增某款工具，或有商务合作意向，欢迎通过 GitHub Issue 与我们交流。我们会认真对待每一条反馈。
        </p>

        <div className="mt-10 pt-6 border-t border-hairline flex gap-4">
          <Link to="/" className="btn-ink">← 返回首页</Link>
          <Link to="/privacy" className="btn-ghost">阅读隐私协议</Link>
        </div>
      </div>
    </div>
  );
}
