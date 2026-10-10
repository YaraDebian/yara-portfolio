import rss from '@astrojs/rss';
import { getPosts } from '../lib';
import { profile } from '../data/site';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: `${profile.name} · notes & essays`,
    description: profile.description,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
  });
}
