import type { APIRoute } from 'astro';

// Master sitemap index — references all sub-sitemaps (Bigfoot §6 separation)
export const GET: APIRoute = async ({ site }) => {
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${site}sitemap-listings.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${site}sitemap-discovery.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${site}sitemap-content.xml</loc><lastmod>${now}</lastmod></sitemap>
</sitemapindex>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
