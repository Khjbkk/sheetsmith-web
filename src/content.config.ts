import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Listing — single tutor / cram-school entry (Bigfoot L1-L5 schema, anti-thin gated by Zod)
const listingCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/listings' }),
  schema: z.object({
    // L1 — BASE
    name_th: z.string().max(120),
    name_en: z.string().optional(),
    legal_name: z.string().optional(),
    address_th: z.string(),
    address_en: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    city: z.string(),
    district: z.string().optional(),
    phone: z.array(z.string()).default([]),
    website: z.string().optional(),
    email: z.string().optional(),
    line_id: z.string().optional(),
    facebook_url: z.string().optional(),
    founded_year: z.number().optional(),
    type: z.enum(['cram_school', 'franchise', 'private_tutor', 'online_only']),

    // L2 — ADMIN
    categories: z.array(z.enum(['por1', 'mor1', 'mor4', 'uni', 'all'])).min(1),
    subjects: z.array(z.enum([
      'math', 'science', 'physics', 'chemistry', 'biology',
      'english', 'thai', 'social', 'iq', 'readiness',
      'sat', 'ielts', 'toefl',
    ])).min(1),
    target_schools: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    claimed: z.boolean().default(false),
    date_listed: z.coerce.date(),
    date_updated: z.coerce.date().optional(),

    // L3 — ENRICHMENT (anti-thin — Zod min lengths enforce)
    description_th: z.string().min(200, 'Anti-thin: description_th must be at least 200 Thai characters'),
    speakable_th: z.array(z.string().min(50)).length(3, 'AEO requires exactly 3 speakable paragraphs'),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string().min(80, 'Anti-thin: FAQ answers must be at least 80 chars for AI citation'),
    })).min(5, 'Anti-thin: at least 5 FAQ items required'),
    quick_facts: z.object({
      price_range: z.string(),
      class_size: z.string(),
      format: z.array(z.enum(['in_person', 'online', 'hybrid'])).min(1),
      age_range: z.string(),
    }),
    pricing_tier: z.enum(['budget', 'mid', 'premium']),
    specialties: z.array(z.string()).default([]),
    methodology_th: z.string().optional(),

    // L4 — GOOGLE PLACES (optional until scraped)
    google_rating: z.number().min(0).max(5).optional(),
    google_review_count: z.number().int().min(0).optional(),

    // L5 — FRESHNESS
    data_freshness_date: z.coerce.date(),
    sources: z.array(z.string()).min(1),
  }),
});

// Category metadata (por1, mor1, mor4, uni)
const categoryCollection = defineCollection({
  loader: file('./src/data/categories.json'),
  schema: z.object({
    id: z.string(),
    name_th: z.string(),
    short_th: z.string(),
    description_th: z.string(),
    intro_th: z.string(),
    icon: z.string(),
    sort: z.number(),
  }),
});

// City metadata
const cityCollection = defineCollection({
  loader: file('./src/data/cities.json'),
  schema: z.object({
    id: z.string(),
    name_th: z.string(),
    name_en: z.string(),
    region_th: z.string(),
    description_th: z.string(),
    sort: z.number(),
  }),
});

// Subject metadata
const subjectCollection = defineCollection({
  loader: file('./src/data/subjects.json'),
  schema: z.object({
    id: z.string(),
    name_th: z.string(),
    description_th: z.string(),
    icon: z.string(),
    sort: z.number(),
  }),
});

// Target school metadata (for-school pages)
const schoolCollection = defineCollection({
  loader: file('./src/data/schools.json'),
  schema: z.object({
    id: z.string(),
    name_th: z.string(),
    short_th: z.string(),
    full_name_th: z.string(),
    level: z.enum(['por1', 'mor1', 'mor4']),
    city: z.string(),
    description_th: z.string(),
    sort: z.number(),
  }),
});

// Pillar articles (long-form SEO content)
const pillarCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pillars' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('ทีมงาน ติดฝัน'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  listings: listingCollection,
  categories: categoryCollection,
  cities: cityCollection,
  subjects: subjectCollection,
  schools: schoolCollection,
  pillars: pillarCollection,
};
