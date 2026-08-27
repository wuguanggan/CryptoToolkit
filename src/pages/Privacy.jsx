import useMeta from '../hooks/useMeta';
import { Link } from 'react-router-dom';
import { SITE, TOOL_LIST } from '../data/tools';

const Section = ({ title, children }) => (
  <section className="mb-8 last:mb-0">
    <h2 className="text-lg font-bold mb-3 text-gray-900">{title}</h2>
    <div className="text-sm leading-loose text-gray-600 space-y-3">{children}</div>
  </section>
);

export default function Privacy() {
  useMeta('隐私协议', `${SITE.name} 隐私协议：本站所有工具均在浏览器本地处理数据，不收集不上传任何用户信息。`);
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="card p-8 md:p-12 rise">
        <header className="mb-10">
          <h1 className="font-display font-extrabold text-4xl tracking-tight mb-3">隐私协议</h1>
          <p className="text-gray-400 text-sm">最后更新：2026 年 8 月 27 日 · 生效中</p>
        </header>

        <Section title="1. 数据处理原则">
          <p>
            {SITE.name}是纯前端架构的在线工具箱{TOOL_LIST.map((t) => t.name).join('、')}等全部功能均在您的浏览器内完成计算。
            您输入的文本、密钥、二维码内容等数据<b>不会发送到任何服务器</b>。您可以通过浏览器开发者工具（F12 → Network）
            自行验证：使用过程中不存在携带您数据的网络请求。
          </p>
        </Section>

        <Section title="2. 数据存储">
          <p>
            您在使用过程中产生的数据仅存在于当前标签页的内存中，关闭或刷新页面后立即销毁。
            本站默认不写入 Cookie、localStorage 或其他持久化存储，不启用跨站追踪。
          </p>
        </Section>

        <Section title="3. 第三方服务与静态资源">
          <p>
            页面可能从公共 CDN 加载字体等静态资源；这些请求仅包含资源路径，不包含您的业务数据。
            加密算法库（CryptoJS）与二维码生成库（qrcode）以依赖形式打包在本地执行，不会向第三方传输数据。
          </p>
          <p>本站展示的广告由 Google AdSense 提供。Google 及其合作伙伴可能依据 cookie 投放个性化广告，您可访问 Google 广告设置页面管理相关偏好。</p>
        </Section>

        <Section title="4. 免责声明">
          <p>
            本站工具按「现状」提供，仅供参考与辅助用途，不保证输出结果的绝对正确性与适用性。
            请勿将本站作为唯一手段保护高价值机密信息。对于因使用本站服务导致的任何直接或间接损失，本站不承担责任。
          </p>
        </Section>

        <Section title="5. 协议变更">
          <p>本站保留随时修订本协议的权利，更新后将在本页面公布并修改"最后更新"日期。继续使用即视为接受最新版本。</p>
        </Section>

        <footer className="mt-12 pt-6 border-t border-hairline">
          <Link to="/" className="btn-ghost">← 返回首页</Link>
        </footer>
      </div>
    </div>
  );
}
