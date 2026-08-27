import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import ToolShell from '../../components/ToolShell';
import { InPanel, OutPanel } from '../../components/Panels';

/* ─────────────── Hash 摘要家族 ─────────────── */
const HASH_ALGOS = {
  md5:    { fn: (s) => CryptoJS.MD5(s),    bits: 128 },
  sha1:   { fn: (s) => CryptoJS.SHA1(s),   bits: 160 },
  sha256: { fn: (s) => CryptoJS.SHA256(s), bits: 256 },
  sha512: { fn: (s) => CryptoJS.SHA512(s), bits: 512 },
};

const HASH_GUIDES = {
  md5: {
    intro: ['MD5 由 Ron Rivest 于 1991 年设计，可将任意长度输入压缩为固定的 128 位（32 个十六进制字符）摘要。它至今仍广泛用于下载文件完整性校验、缓存键生成与旧系统兼容。',
      '需要注意的是 MD5 已被证实不具备抗碰撞性，绝不应用于密码存储或数字签名等安全场景。'],
    usage: ['粘贴任意文本内容', '点击「计算摘要」获得 32 位散列值', '对比已知 MD5 值即可校验内容是否被篡改'],
    faqs: [['MD5 还安全吗？', '作为校验工具仍然可用；但用于密码存储已不安全，请改用 bcrypt / scrypt / Argon2 等专用算法。']],
  },
  sha1: {
    intro: ['SHA-1 输出 160 位摘要，曾是 SSL 证书与 Git 版本控制的基石。Git 至今仍使用它标识提交对象。', '由于碰撞攻击已被公开演示，浏览器已不再信任 SHA-1 证书，新项目建议选择 SHA-256 及以上。'],
    usage: ['输入需要摘要的文本', '点击「计算摘要」获取 40 位十六进制结果'],
    faqs: [],
  },
  sha256: {
    intro: ['SHA-256 属于 SHA-2 家族，输出 256 位摘要，是当前信息安全领域的事实标准：TLS 证书、比特币挖矿、JWT HS256 签名、软件分发校验均基于它。', '本工具在浏览器内通过成熟算法库计算，输入不会离开您的设备——您可以放心用它处理敏感文本。'],
    usage: ['输入任意长度的文本', '点击「计算摘要」得到 64 位十六进制哈希', '相同输入永远得到相同输出，可反复校验'],
    faqs: [
      ['SHA-256 可以解密吗？', '不可以。哈希是单向函数，无法从摘要还原原文。"破解"实际是穷举碰撞，计算上不可行。'],
      ['为什么和某些网站结果不同？', '请确认没有混入不可见字符（如行尾空格、换行符），编码差异（UTF-8 与 GBK）也会导致结果不同。'],
    ],
  },
  sha512: {
    intro: ['SHA-512 同属 SHA-2 家族，输出 512 位（128 个十六进制字符）摘要。它在 64 位 CPU 上运算效率更高，常用于高安全需求场景与证书链签发。'],
    usage: ['输入待摘要的文本', '点击「计算摘要」生成结果并复制'],
    faqs: [],
  },
};

export function makeHashPage(algoId) {
  const algo = HASH_ALGOS[algoId];
  const idMap = { md5: 'md5', sha1: 'sha1', sha256: 'sha256', sha512: 'sha512' };
  const Page = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    return (
      <ToolShell toolId={idMap[algoId]} guide={HASH_GUIDES[algoId]}>
        <div className="card p-6 md:p-8 space-y-6">
          <InPanel label="输入文本" value={input} onChange={setInput} placeholder="输入需要计算摘要的内容…" />
          <button
            className="btn-ink"
            onClick={() => setResult(input.trim() ? algo.fn(input).toString() : '')}
          >
            计算摘要 Generate
          </button>
          <OutPanel value={result} emptyText="等待计算…" />
        </div>
      </ToolShell>
    );
  };
  Page.displayName = `HashPage(${algoId})`;
  return Page;
}

/* ─────────────── 对称加密家族 ─────────────── */
const CIPHERS = {
  aes:       { name: 'AES',     run: (msg, key) => CryptoJS.AES.encrypt(msg, key).toString(),
               undo: (msg, key) => CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8) },
  des:       { name: 'DES',     run: (msg, key) => CryptoJS.DES.encrypt(msg, key).toString(),
               undo: (msg, key) => CryptoJS.DES.decrypt(msg, key).toString(CryptoJS.enc.Utf8) },
  tripledes: { name: '3DES',    run: (msg, key) => CryptoJS.TripleDES.encrypt(msg, key).toString(),
               undo: (msg, key) => CryptoJS.TripleDES.decrypt(msg, key).toString(CryptoJS.enc.Utf8) },
};

const CIPHER_GUIDES = {
  aes: {
    intro: [
      'AES（高级加密标准）是目前全球应用最广泛的对称加密算法，Wi-Fi 加密、HTTPS、全盘加密背后都有它的身影。对称加密意味着加密与解密使用同一个密钥。',
      '本工具采用 OpenSSL 兼容的口令派生模式：您只需记住一个口令（密钥），算法会自动加盐生成真实密钥。加密结果为 Base64 密文，只有持有相同口令的人能够还原明文。',
    ],
    usage: ['在下方设置一个加密口令（务必牢记）', '输入需要保护的明文，点击「加密」', '解密时粘贴密文并输入相同口令'],
    faqs: [
      ['忘记口令怎么办？', '无法恢复。AES 的安全性正是建立在没有口令就无法解密之上，请妥善保管您的口令。'],
      ['能保证绝对安全吗？', '算法层面 AES 是可靠的，但短口令仍可能被暴力猜测，建议使用足够长的口令组合。'],
    ],
  },
  des: {
    intro: ['DES（数据加密标准）诞生于 1977 年，使用 56 位有效密钥。虽然已被更安全的 AES 取代，但大量遗留系统、工控设备与老接口仍在使用它。', '本工具用于联调兼容场景：与老系统对接时可直接还原其加解密逻辑，结果为 Base64 编码密文。'],
    usage: ['设定与对方系统一致的密钥', '粘贴明文进行加密或粘贴密文进行解密'],
    faqs: [['新项目可以用 DES 吗？', '不建议。56 位密钥已可被暴力破解，仅建议用于维护旧系统。']],
  },
  tripledes: {
    intro: ['3DES（Triple DES）对同一数据执行三次 DES 运算，将有效强度提升至 112 位左右，曾长期服务于金融行业（如银行卡网络）。', '当您面对银行、POS 或其他传统金融接口时，本工具可以快速验证 3DES 加解密结果是否一致。'],
    usage: ['输入密钥（推荐 16 或 24 字符）', '选择加密或解密方向，粘贴对应文本'],
    faqs: [['3DES 比 DES 安全多少？', '大约相当于 112 位密钥强度，显著高于 DES 的 56 位，但仍低于 AES-128。']],
  },
};

export function makeCipherPage(cipherId) {
  const c = CIPHERS[cipherId];
  const Page = () => {
    const [input, setInput] = useState('');
    const [key, setKey] = useState('');
    const [result, setResult] = useState('');
    const [err, setErr] = useState('');

    const run = (mode) => {
      setErr('');
      if (!input.trim()) return;
      if (!key.trim()) {
        setErr('请先设置密钥');
        return;
      }
      try {
        const out = mode === 'enc' ? c.run(input, key) : c.undo(input.trim(), key);
        if (!out && mode === 'dec') throw new Error('empty');
        setResult(out);
      } catch {
        setResult('');
        setErr('解密失败：请检查密文格式与密钥是否正确');
      }
    };

    return (
      <ToolShell toolId={cipherId} guide={CIPHER_GUIDES[cipherId]}>
        <div className="card p-6 md:p-8 space-y-6">
          <InPanel label="输入文本" value={input} onChange={(v) => { setInput(v); setErr(''); }} placeholder={`在此粘贴需要 ${c.name} 处理的文本…`} />
          <div>
            <label className="text-xs font-bold tracking-widest text-gray-400 uppercase block mb-2">密钥 Key</label>
            <input type="text" className="field !font-sans" value={key}
              onChange={(e) => { setKey(e.target.value); setErr(''); }} placeholder="设置一个加密口令…" autoComplete="off" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ink" onClick={() => run('enc')}><Lock size={15} strokeWidth={2.2} /> 加密 Encrypt</button>
            <button className="btn-ghost" onClick={() => run('dec')}><Unlock size={15} strokeWidth={2.2} /> 解密 Decrypt</button>
          </div>
          {err && <p className="text-sm font-semibold text-[#BE123C]">⚠ {err}</p>}
          <OutPanel value={result} emptyText="等待操作产生结果…" />
        </div>
      </ToolShell>
    );
  };
  Page.displayName = `CipherPage(${cipherId})`;
  return Page;
};
