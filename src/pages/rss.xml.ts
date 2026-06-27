import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const listings = await getCollection('listings');
  const pillars = await getCollection('pillars');

  const items = [
    ...listings.map(l => ({
      title: l.data.name_th,
      link: `${site}listing/${l.id}/`,
      description: l.data.description_th.slice(0, 280),
      pubDate: l.data.date_listed,
      category: 'Listing',
    })),
    ...pillars.map(p => ({
      title: p.data.title,
      link: `${site}pillars/${p.id}/`,
      description: p.data.description,
      pubDate: p.data.publishDate,
      category: 'Pillar',
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()).slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ติดฝัน (TidFun) — Directory ติวเตอร์-สถาบันกวดวิชา</title>
    <link>${site}</link>
    <atom:link href="${site}rss.xml" rel="self" type="application/rss+xml" />
    <description>สถาบันกวดวิชาและติวเตอร์ทั่วประเทศไทย เตรียมสอบเข้า ป.1 ม.1 ม.4 และมหาวิทยาลัย</description>
    <language>th-TH</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(i => `    <item>
      <title><![CDATA[${i.title}]]></title>
      <link>${i.link}</link>
      <description><![CDATA[${i.description}]]></description>
      <pubDate>${i.pubDate.toUTCString()}</pubDate>
      <category>${i.category}</category>
      <guid>${i.link}</guid>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
