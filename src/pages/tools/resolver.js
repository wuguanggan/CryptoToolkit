import { Base64Page, UrlCodecPage, JwtDecodePage } from './codecs';
import { makeHashPage, makeCipherPage } from './ciphers';
import JsonFormatterPage from './JsonFormatterPage';
import TextToolPage from './TextToolPage';
import TimestampPage from './TimestampPage';
import QrCodePage from './QrCodePage';
import ImageCompressPage from './ImageCompressPage';
import ImageConvertPage from './ImageConvertPage';
import ImageCropPage from './ImageCropPage';
import ColorConverterPage from './ColorConverterPage';
import MarkdownPage from './MarkdownPage';
import MindMapPage from './MindMapPage';

/** toolId → 页面组件 的路由解析表 */
export const TOOL_PAGES = {
  'base64': Base64Page,
  'url-codec': UrlCodecPage,
  jwt: JwtDecodePage,
  md5: makeHashPage('md5'),
  sha1: makeHashPage('sha1'),
  sha256: makeHashPage('sha256'),
  sha512: makeHashPage('sha512'),
  aes: makeCipherPage('aes'),
  des: makeCipherPage('des'),
  tripledes: makeCipherPage('tripledes'),
  json: JsonFormatterPage,
  text: TextToolPage,
  timestamp: TimestampPage,
  qrcode: QrCodePage,
  'image-compress': ImageCompressPage,
  'image-convert': ImageConvertPage,
  'image-crop': ImageCropPage,
  color: ColorConverterPage,
  markdown: MarkdownPage,
  mindmap: MindMapPage,
};
