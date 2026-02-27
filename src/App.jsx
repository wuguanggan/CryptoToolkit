import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

/**
 * Crypto Toolkit - Pure React + Vite + Tailwind CSS
 * 所有加密逻辑均在客户端完成，确保数据安全
 */

// 隐私协议页面组件
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8">
            <span>🔒</span>
            <span>React Crypto Toolkit</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">隐私协议</h1>
          <p className="text-gray-500">最后更新：2026年1月21日</p>
        </header>

        {/* Content */}
        <main className="bg-white rounded-3xl shadow-lg p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">1. 数据处理原则</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              本站采用客户端加解密技术，您的所有数据处理均在本地浏览器中完成，不会将任何敏感信息发送至服务器。
            </p>
            <p className="text-gray-600 leading-relaxed">
              通过 F12 开发者工具，您可以确认没有任何网络请求会将您的原始数据、生成的密钥或偏移量发往后台。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">2. 数据存储</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              您在使用本站服务时输入的数据仅存在于浏览器内存中，当您关闭浏览器或刷新页面时，所有数据将被清除。
            </p>
            <p className="text-gray-600 leading-relaxed">
              本站不会在您的设备上存储任何数据，也不会使用 cookie 或其他追踪技术收集您的个人信息。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">3. 第三方服务</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              本站可能包含指向第三方网站的链接，这些网站的隐私政策可能与本站不同。我们建议您在访问这些网站时查看其隐私政策。
            </p>
            <p className="text-gray-600 leading-relaxed">
              本站使用的第三方库（如 CryptoJS）仅在本地运行，不会向第三方服务器发送数据。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">4. 免责声明</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              本站提供的工具仅供参考，不保证加密结果的绝对安全性。用户应自行承担使用本站服务的风险。
            </p>
            <p className="text-gray-600 leading-relaxed">
              对于因使用本站服务而导致的任何直接或间接损失，本站不承担任何责任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">5. 隐私政策的修改</h2>
            <p className="text-gray-600 leading-relaxed">
              本站保留随时修改本隐私政策的权利。修改后的隐私政策将在本站公布，不另行通知。
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center border-t border-gray-200 pt-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            返回首页
          </Link>
          <p className="text-gray-400 text-sm font-medium mt-4">
            &copy; 2026 Crypto Toolkit.
          </p>
        </footer>
      </div>
    </div>
  );
};

const App = () => {
  // 状态管理
  const [activeToolId, setActiveToolId] = useState('base64');
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [cryptoLoaded, setCryptoLoaded] = useState(false);
  const [config, setConfig] = useState({
    key: 'secret123',
    iv: '1234567812345678',
  });

  // 动态加载 CryptoJS 库 (在 React 项目中建议 npm install crypto-js)
  useEffect(() => {
    if (window.CryptoJS) {
      setCryptoLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js';
    script.async = true;
    script.onload = () => setCryptoLoaded(true);
    document.head.appendChild(script);
  }, []);

  const tools = [
    { id: 'base64', name: 'Base64', icon: '🔗', type: 'codec', desc: 'Base64 编码解码，常用于处理二进制文本化。' },
    { id: 'md5', name: 'MD5', icon: '🔒', type: 'hash', desc: 'MD5 消息摘要算法，生成固定的 32 位 16 进制字符串。' },
    { id: 'aes', name: 'AES', icon: '🛡️', type: 'encrypt', hasKey: true, hasIv: true, desc: '高级加密标准，当前最安全的对称加密算法之一。' },
    { id: 'sha256', name: 'SHA-256', icon: '⚡', type: 'hash', desc: 'SHA-2 家族的成员，广泛用于安全验证和数字签名。' },
    { id: 'des', name: 'DES', icon: '🔑', type: 'encrypt', hasKey: true, desc: '数据加密标准，较老的算法，但在特定旧系统中仍在使用。' }
  ];

  const currentTool = useMemo(() => tools.find(t => t.id === activeToolId), [activeToolId]);

  // 工具切换时清空结果
  useEffect(() => {
    setResult('');
  }, [activeToolId]);

  // 处理加密/解密/哈希动作
  const handleAction = (actionType) => {
    if (!cryptoLoaded) {
      setResult('加密引擎加载中...');
      return;
    }
    if (!inputData.trim()) {
      setResult('请输入需要处理的内容');
      return;
    }

    const CryptoJS = window.CryptoJS;
    try {
      const { key, iv } = config;
      const parsedIv = CryptoJS.enc.Utf8.parse(iv);

      switch (activeToolId) {
        case 'base64':
          if (actionType === 'encode') {
            setResult(window.btoa(unescape(encodeURIComponent(inputData))));
          } else {
            setResult(decodeURIComponent(escape(window.atob(inputData))));
          }
          break;
        case 'md5':
          setResult(CryptoJS.MD5(inputData).toString());
          break;
        case 'sha256':
          setResult(CryptoJS.SHA256(inputData).toString());
          break;
        case 'aes':
          if (actionType === 'encode') {
            setResult(CryptoJS.AES.encrypt(inputData, key, { iv: parsedIv }).toString());
          } else {
            const bytes = CryptoJS.AES.decrypt(inputData, key, { iv: parsedIv });
            setResult(bytes.toString(CryptoJS.enc.Utf8) || '解密失败：密文或密钥有误');
          }
          break;
        case 'des':
          if (actionType === 'encode') {
            setResult(CryptoJS.DES.encrypt(inputData, key).toString());
          } else {
            const bytes = CryptoJS.DES.decrypt(inputData, key);
            setResult(bytes.toString(CryptoJS.enc.Utf8) || '解密失败：密文或密钥有误');
          }
          break;
        default:
          break;
      }
    } catch (err) {
      setResult(`处理错误: ${err.message}`);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  return (
    <Routes>
      {/* 首页路由 */}
      <Route path="/" element={
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100">
          <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header Section */}
            <header className="text-center mb-12">
              <h1 className="text-5xl font-black text-indigo-700 tracking-tight mb-4">Crypto Toolkit</h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                全功能加密解密工具，所有操作在本地浏览器完成，绝不上传数据。
              </p>
              {!cryptoLoaded && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
                  <span className="w-2 h-2 bg-amber-600 rounded-full animate-ping"></span>
                  <span className="text-sm font-medium">加密引擎初始化中...</span>
                </div>
              )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Navigation Sidebar */}
              <aside className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-8">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">算法分类</h2>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setActiveToolId(tool.id)}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                          activeToolId === tool.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-2xl transition-transform duration-300 ${activeToolId === tool.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                          {tool.icon}
                        </span>
                        <span className="font-semibold text-sm">{tool.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sidebar Ad Unit */}
                 
                </div>
              </aside>

              {/* Main Workspace */}
              <main className="lg:col-span-9">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  <div className="p-8 md:p-10">
                    {/* Tool Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                          {currentTool.icon}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">{currentTool.name}</h2>
                          <p className="text-gray-500 text-sm mt-1">{currentTool.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Interaction Form */}
                    <div className="space-y-8">
                      {/* Input */}
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">
                          输入源文本 (Input Source)
                        </label>
                        <textarea
                          value={inputData}
                          onChange={(e) => setInputData(e.target.value)}
                          placeholder={`在此粘贴您需要进行 ${currentTool.name} 处理的内容...`}
                          className="w-full h-44 p-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl transition-all duration-300 outline-none resize-none font-mono text-gray-700"
                        />
                      </div>

                      {/* Settings */}
                      {currentTool.hasKey && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1 block">密钥 (Secret Key)</label>
                            <input
                              type="text"
                              value={config.key}
                              onChange={(e) => setConfig({ ...config, key: e.target.value })}
                              placeholder="输入密钥..."
                              className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </div>
                          {currentTool.hasIv && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1 block">偏移向量 (IV)</label>
                              <input
                                type="text"
                                value={config.iv}
                                onChange={(e) => setConfig({ ...config, iv: e.target.value })}
                                placeholder="输入 16 位 IV..."
                                className="w-full px-5 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4">
                        {currentTool.type === 'hash' ? (
                          <button
                            onClick={() => handleAction('hash')}
                            className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                          >
                            生成摘要 (Generate)
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction('encode')}
                              className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                              {currentTool.type === 'codec' ? '编码 (Encode)' : '加密 (Encrypt)'}
                            </button>
                            <button
                              onClick={() => handleAction('decode')}
                              className="flex-1 md:flex-none px-10 py-4 bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 font-bold rounded-2xl transition-all active:scale-95"
                            >
                              {currentTool.type === 'codec' ? '解码 (Decode)' : '解密 (Decrypt)'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setInputData(''); setResult(''); }}
                          className="px-6 py-4 text-gray-400 hover:text-gray-600 font-semibold transition-colors"
                        >
                          清空 (Clear)
                        </button>
                      </div>

                      {/* Output */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">处理结果 (Output Result)</label>
                          {result && (
                            <button
                              onClick={copyResult}
                              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
                            >
                              {copyStatus ? '✅ 已复制' : '📋 复制结果'}
                            </button>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="w-full min-h-[140px] p-6 bg-gray-50 rounded-3xl font-mono text-emerald-400 text-sm break-all leading-relaxed shadow-inner overflow-auto">
                            {result || <span className="text-gray-600 italic">等待操作产生结果...</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Horizontal Ad */}
                </div>

                {/* SEO Article Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span className="text-indigo-600">🛡️</span> 隐私至上原则
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      本站采用 <b>客户端加解密技术</b>。与传统在线工具不同，您的原始数据、生成的密钥、偏移量均仅在您的浏览器内存中存在。通过 F12 开发者工具，您可以确认没有任何网络请求会将您的敏感信息发往后台。
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span className="text-indigo-600">🚀</span> 极速开发者体验
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      基于 React 18 的响应式更新，配合 <b>Vite</b> 构建的极小资源占用。不论是处理几字节的密码还是大段的 Base64 文本，都能实现零延迟反馈。
                    </p>
                  </div>
                </div>
              </main>
            </div>

            <footer className="mt-20 text-center border-t border-gray-200 pt-10">
              <p className="text-gray-400 text-sm font-medium">
                &copy; 2026 Crypto Toolkit.
              </p>
              <div className="mt-4 flex justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Link to="/privacy" className="hover:text-indigo-600 transition-colors">隐私协议</Link>
                <a href="https://github.com/wuguanggan/CryptoToolkit" className="hover:text-indigo-600 transition-colors">GitHub 开源</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">算法文档</a>
              </div>
            </footer>
          </div>
        </div>
      } />
      
      {/* 隐私协议路由 */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
};

export default App;