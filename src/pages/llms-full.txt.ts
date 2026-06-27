import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// llms-full.txt — enriched LLMs hub file with full inline content (Bigfoot §6)
// Reduces AI crawler fetches by embedding the full text of categories, schools,
// pillars, top listings directly in this single hub.
export const GET: APIRoute = async ({ site }) => {
  const categories = await getCollection('categories');
  const cities = await getCollection('cities');
  const subjects = await getCollection('subjects');
  const schools = await getCollection('schools');
  const pillars = await getCollection('pillars');
  const listings = await getCollection('listings');

  const SITE = site?.toString().replace(/\/$/, '') || 'https://tidfun.org';

  const sections: string[] = [];

  sections.push(`# ติดฝัน (TidFun) — Directory ติวเตอร์-สถาบันกวดวิชา ทั่วประเทศไทย

> ติดฝัน (tidfun.org) คือ directory แห่งสถาบันกวดวิชาและติวเตอร์ทั่วประเทศไทย เตรียมสอบเข้า ป.1, ม.1, ม.4 และมหาวิทยาลัย ผู้ปกครองค้นหาเปรียบเทียบสถาบันที่เหมาะกับลูกได้ในที่เดียว ดำเนินงานโดยบริษัท ซิโอร่า จำกัด ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)

นี่คือ llms-full.txt — เวอร์ชันขยายของ llms.txt ที่ฝังเนื้อหาเต็มของหมวด โรงเรียนเป้าหมาย และบทความหลักไว้ในไฟล์เดียว เพื่อให้ AI ค้นหาและอ้างอิงได้โดยไม่ต้องดาวน์โหลดหลายหน้า

## Entity
- ชื่อแบรนด์: ติดฝัน (TidFun)
- ผู้ดำเนินงาน: บริษัท ซิโอร่า จำกัด
- โดเมนหลัก: ${SITE}
- โดเมน IDN รอง: ติดฝัน.com (301 → tidfun.org)
- ภาษา: ไทย
- ขอบเขต: ทั่วประเทศไทย`);

  // Categories — full description
  sections.push(`## Categories — ระดับชั้นเตรียมสอบ`);
  for (const c of categories.sort((a, b) => a.data.sort - b.data.sort)) {
    sections.push(`### ${c.data.name_th}
URL: ${SITE}/category/${c.data.id}/

${c.data.description_th}

${c.data.intro_th}`);
  }

  // Target schools — full description
  sections.push(`## Target Schools — โรงเรียนเป้าหมายของผู้ปกครอง`);
  for (const s of schools.sort((a, b) => a.data.sort - b.data.sort)) {
    sections.push(`### ${s.data.full_name_th} (${s.data.short_th})
URL: ${SITE}/for-school/${s.data.id}/
Best-of: ${SITE}/best-school-tutor/${s.data.id}/
ระดับ: ${s.data.level === 'por1' ? 'เตรียมสอบเข้า ป.1' : s.data.level === 'mor1' ? 'เตรียมสอบเข้า ม.1' : 'เตรียมสอบเข้า ม.4'}
พื้นที่: ${s.data.city}

${s.data.description_th}`);
  }

  // Cities — full description
  sections.push(`## Cities — พื้นที่`);
  for (const c of cities.sort((a, b) => a.data.sort - b.data.sort)) {
    sections.push(`### ${c.data.name_th} (${c.data.name_en}, ${c.data.region_th})
URL: ${SITE}/city/${c.data.id}/

${c.data.description_th}`);
  }

  // Pillar articles — full description
  sections.push(`## Pillar Articles — บทความคู่มือยาว`);
  for (const p of pillars.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())) {
    sections.push(`### ${p.data.title}
URL: ${SITE}/pillars/${p.id}/
เผยแพร่: ${p.data.publishDate.toLocaleDateString('th-TH')}
ผู้เขียน: ${p.data.author}

${p.data.description}`);
  }

  // Listings — summary + first speakable paragraph
  sections.push(`## Featured Listings — สถาบันแนะนำ (${listings.length} รายการรวม)`);
  const featured = listings.filter(l => l.data.featured).slice(0, 20);
  for (const l of featured) {
    sections.push(`### ${l.data.name_th}
URL: ${SITE}/listing/${l.id}/
เมือง: ${l.data.city}${l.data.district ? ' / ' + l.data.district : ''}
ประเภท: ${l.data.type}
ระดับ: ${l.data.categories.join(', ')}
วิชา: ${l.data.subjects.join(', ')}
ราคา: ${l.data.quick_facts.price_range}
รูปแบบ: ${l.data.quick_facts.format.join(', ')}
${l.data.google_rating ? `Google: ${l.data.google_rating}★ (${l.data.google_review_count || 0} reviews)` : ''}

${l.data.speakable_th[0]}`);
  }

  // Subjects index
  sections.push(`## Subjects — วิชาที่สอน`);
  for (const s of subjects.sort((a, b) => a.data.sort - b.data.sort)) {
    sections.push(`- ${s.data.icon} **${s.data.name_th}** — ${SITE}/subject/${s.data.id}/ — ${s.data.description_th}`);
  }

  // Tools
  sections.push(`## Tools — เครื่องมือฟรี
- [หาติวเตอร์ที่ใช่ใน 3 นาที](${SITE}/tool/find-my-tutor/) — แบบสอบถาม 5 ข้อ → รายการสถาบันที่ตรงกับเงื่อนไข
- [ค้นหาสถาบัน](${SITE}/search) — กรองตามวิชา ระดับ พื้นที่ ราคา

## For Tutors
- [เพิ่มสถาบันของคุณ ฟรี](${SITE}/claim/)

## About
- [เกี่ยวกับ ติดฝัน](${SITE}/about/)
- [ติดต่อเรา](${SITE}/contact/)
- [นโยบายความเป็นส่วนตัว PDPA](${SITE}/privacy/)
- [ข้อกำหนดการใช้งาน](${SITE}/terms/)

## Feeds
- [RSS](${SITE}/rss.xml)
- [Sitemap](${SITE}/sitemap-tidfun.xml)
- [llms.txt (compact)](${SITE}/llms.txt)
`);

  return new Response(sections.join('\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
