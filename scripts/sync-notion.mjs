import 'dotenv/config';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;
const POSTS_DIR = 'src/content/blog/notion';
const IMG_DIR = 'public/notion';

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.log('[notion] NOTION_TOKEN / NOTION_DATABASE_ID not set — skipping sync, using local posts only.');
  process.exit(0);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion, config: { parseChildPages: false } });

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const prop = (page, name, type) => {
  const p = page.properties[name];
  return p && (!type || p.type === type) ? p : undefined;
};

const plain = (rich = []) => rich.map((t) => t.plain_text).join('');

const HIGHLIGHTS = {
  yellow_background: 'yellow',
  brown_background: 'yellow',
  purple_background: 'purple',
  pink_background: 'peach',
  red_background: 'peach',
  orange_background: 'peach',
  blue_background: 'blue',
  green_background: 'green',
  gray_background: 'purple',
};

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const richToMd = (rich = []) =>
  rich
    .map(({ plain_text: t, annotations: a, href }) => {
      if (!t.trim()) return t;
      const hl = HIGHLIGHTS[a.color];
      if (hl) {
        let h = escapeHtml(t);
        if (a.bold) h = `<strong>${h}</strong>`;
        if (a.italic) h = `<em>${h}</em>`;
        if (href) h = `<a href="${href}">${h}</a>`;
        return `<span class="hl hl-${hl}">${h}</span>`;
      }
      const [, lead, core, trail] = t.match(/^(\s*)(.*?)(\s*)$/s);
      let s = core;
      if (a.code) s = `\`${s}\``;
      if (a.bold) s = `**${s}**`;
      if (a.italic) s = `*${s}*`;
      if (a.strikethrough) s = `~~${s}~~`;
      if (href) s = `[${s}](${href})`;
      return lead + s + trail;
    })
    .join('');

const statusOf = (page) => {
  const s = prop(page, 'Status');
  return (s?.status?.name ?? s?.select?.name ?? (s?.checkbox ? 'Published' : '')).toLowerCase();
};

// "Ready" articles sync locally as drafts for review; deploy builds skip them so their images never reach the public site.
const isDeploy = Boolean(process.env.RENDER || process.env.VERCEL || process.env.CI);
const isSynced = (page) => statusOf(page) === 'published' || (!isDeploy && statusOf(page) === 'ready');

// Notion file URLs are signed and expire after ~1h, so every image is downloaded into the build.
const download = async (url, pageId) => {
  const key = createHash('sha1').update(url.split('?')[0]).digest('hex').slice(0, 16);
  const res = await fetch(url, { headers: { 'User-Agent': 'yara-portfolio/1.0 (https://github.com/YaraDebian/yara-portfolio)' } });
  if (!res.ok) throw new Error(`[notion] image download failed (${res.status}): ${url.split('?')[0]}`);
  const type = res.headers.get('content-type') ?? '';
  const ext = (type.split('/')[1] ?? '').split(/[;+]/)[0].replace('jpeg', 'jpg') || path.extname(new URL(url).pathname).slice(1) || 'png';
  const dir = path.join(IMG_DIR, pageId);
  await mkdir(dir, { recursive: true });
  const file = `${key}.${ext}`;
  await writeFile(path.join(dir, file), Buffer.from(await res.arrayBuffer()));
  return `/notion/${pageId}/${file}`;
};

const fileUrl = (f) => (f?.type === 'external' ? f.external.url : f?.file?.url);

const queryAll = async () => {
  const pages = [];
  let cursor;
  do {
    const res = await notion.databases.query({ database_id: NOTION_DATABASE_ID, start_cursor: cursor });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
};

const yaml = (v) => JSON.stringify(v);

const run = async () => {
  await rm(POSTS_DIR, { recursive: true, force: true });
  await rm(IMG_DIR, { recursive: true, force: true });
  await mkdir(POSTS_DIR, { recursive: true });

  const pages = (await queryAll()).filter(isSynced);
  const seen = new Set();

  for (const page of pages) {
    const id = page.id.replace(/-/g, '');
    n2m.setCustomTransformer('image', async (block) => {
      const img = block.image;
      const caption = plain(img.caption);
      const src = await download(fileUrl(img), id);
      return `![${caption.replace(/[[\]]/g, '')}](${src})${caption ? `\n*${caption}*` : ''}`;
    });
    n2m.setCustomTransformer('paragraph', async (block) => richToMd(block.paragraph.rich_text));
    n2m.setCustomTransformer('quote', async (block) =>
      richToMd(block.quote.rich_text).split('\n').map((l) => `> ${l}`).join('\n>\n')
    );
    n2m.setCustomTransformer('callout', async (block) => {
      const c = block.callout;
      const icon = c.icon?.type === 'emoji' ? c.icon.emoji : '💡';
      return `<div class="callout"><span>${icon}</span><div>\n\n${richToMd(c.rich_text)}\n\n</div></div>`;
    });

    const titleProp = Object.values(page.properties).find((p) => p.type === 'title');
    const title = plain(titleProp?.title);
    if (!title) continue;

    let slug = slugify(plain(prop(page, 'Slug', 'rich_text')?.rich_text) || title);
    if (seen.has(slug)) slug = `${slug}-${id.slice(0, 6)}`;
    seen.add(slug);

    const date = prop(page, 'Date', 'date')?.date?.start ?? page.created_time;
    const description = plain(prop(page, 'Description', 'rich_text')?.rich_text);
    const notes = plain(prop(page, 'Margin notes', 'rich_text')?.rich_text).split('\n').map((n) => n.trim()).filter(Boolean);
    const tags = prop(page, 'Tags', 'multi_select')?.multi_select.map((t) => t.name) ?? [];
    const coverSrc = fileUrl(prop(page, 'Cover', 'files')?.files?.[0]) ?? fileUrl(page.cover);
    const cover = coverSrc ? await download(coverSrc, id) : undefined;

    const blocks = await n2m.pageToMarkdown(page.id);
    const body = n2m.toMarkdownString(blocks).parent ?? '';

    const front = [
      '---',
      `title: ${yaml(title)}`,
      `description: ${yaml(description)}`,
      `date: ${yaml(date)}`,
      `tags: ${yaml(tags)}`,
      notes.length && `notes: ${yaml(notes)}`,
      cover && `cover: ${yaml(cover)}`,
      statusOf(page) === 'ready' && 'draft: true',
      'source: notion',
      '---',
    ].filter(Boolean).join('\n');

    await writeFile(path.join(POSTS_DIR, `${slug}.md`), `${front}\n\n${body.trim()}\n`);
    console.log(`[notion] ✓ ${slug}`);
  }
  console.log(`[notion] synced ${seen.size} article(s).`);
};

// Failing loudly matters: a failed build keeps the previous deploy live instead of shipping a blog with missing posts.
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
