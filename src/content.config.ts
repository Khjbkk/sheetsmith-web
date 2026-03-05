import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('SheetSmith Team'),
    category: z.enum(['por1', 'mor1', 'mor4', 'general', 'tips']),
    tags: z.array(z.string()),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const examCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/exams' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    level: z.enum(['por1', 'mor1', 'mor4']),
    subject: z.string(),
    school: z.string().optional(),
    year: z.number().optional(),
    questionCount: z.number(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    isFree: z.boolean().default(true),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});

const guideCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    level: z.enum(['por1', 'mor1', 'mor4', 'all']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    tableOfContents: z.boolean().default(true),
  }),
});

export const collections = {
  blog: blogCollection,
  exams: examCollection,
  guides: guideCollection,
};
