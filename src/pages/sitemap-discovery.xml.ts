import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const categories = await getCollection('categories');
  const cities = await getCollection('cities');
  const subjects = await getCollection('subjects');
  const schools = await getCollection('schools');
  const listings = await getCollection('listings');

  // Derive lastmod from the most-recently-updated listing matching each landing
  const fallback = new Date().toISOString();
  function maxDate(filter: (l: any) => boolean): string {
    const matched = listings.filter(filter);
    if (matched.length === 0) return fallback;
    const latest = matched.reduce<Date>((acc, l) => {
      const d = (l.data.date_updated || l.data.date_listed) as Date;
      return d > acc ? d : acc;
    }, new Date(0));
    return latest.toISOString();
  }

  const urls: { loc: string; lastmod: string; priority: number }[] = [];
  categories.forEach(c => urls.push({
    loc: `${site}category/${c.data.id}/`,
    lastmod: maxDate(l => l.data.categories.includes(c.data.id)),
    priority: 0.8,
  }));
  cities.forEach(c => urls.push({
    loc: `${site}city/${c.data.id}/`,
    lastmod: maxDate(l => l.data.city === c.data.id),
    priority: 0.7,
  }));
  subjects.forEach(s => urls.push({
    loc: `${site}subject/${s.data.id}/`,
    lastmod: maxDate(l => l.data.subjects.includes(s.data.id)),
    priority: 0.7,
  }));
  schools.forEach(s => {
    const lm = maxDate(l => l.data.target_schools.includes(s.data.id));
    urls.push({ loc: `${site}for-school/${s.data.id}/`, lastmod: lm, priority: 0.8 });
    urls.push({ loc: `${site}best-school-tutor/${s.data.id}/`, lastmod: lm, priority: 0.7 });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
