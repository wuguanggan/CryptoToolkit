import { useEffect } from 'react';
import { SITE } from '../data/tools';

/** 每个页面独立设置 document.title 与 meta description（SEO 基础） */
export default function useMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title ? `${title} - ${SITE.cnName} | ${SITE.name}` : `${SITE.name} ${SITE.cnName}`;
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', 'description');
        document.head.appendChild(el);
      }
      el.setAttribute('content', description);
    }
  }, [title, description]);
}
