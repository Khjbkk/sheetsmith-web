import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const categories = await getCollection('categories');
  const cities = await getCollection('cities');
  const subjects = await getCollection('subjects');
  const schools = await getCollection('schools');

  const now = new Date().toISOString();
  const urls: string[] = [];

  categories.forEach(c => urls.push(`${site}category/${c.data.id}/`));
  cities.forEach(c => urls.push(`${site}city/${c.data.id}/`));
  subjects.forEach(s => urls.push(`${site}subject/${s.data.id}/`));
  schools.forEach(s => urls.push(`${site}for-school/${s.data.id}/`));
  schools.forEach(s => urls.push(`${site}best-school-tutor/${s.data.id}/`));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
