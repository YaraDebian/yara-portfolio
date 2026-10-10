import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const lazyImages = () => (tree) => {
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};

const wrapCodeInPaper = () => (tree) => {
  const visit = (node) => {
    node.children?.forEach((child, i) => {
      if (child.type === 'element' && child.tagName === 'pre') {
        node.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-paper'] },
          children: [child],
        };
      } else visit(child);
    });
  };
  visit(tree);
};

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.yaradebian.com',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'min-light' },
    rehypePlugins: [wrapCodeInPaper, lazyImages],
  },
});
