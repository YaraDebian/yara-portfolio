import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/^notion\//, '').replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    notes: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    source: z.enum(['notion', 'local']).default('local'),
  }),
});

export const collections = { writing };
