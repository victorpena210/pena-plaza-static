import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const pages = (await readdir(root)).filter(file => file.endsWith('.html'));
const errors = [];
const decode = text => text.replace(/&amp;/g, '&');
const htmlByName = new Map(await Promise.all(pages.map(async file => [file, await readFile(path.join(root, file), 'utf8')])));
for (const [file, html] of htmlByName) {
    if (html.includes('example.com') || /<!-- (?:SITE_SCHEMA|BUILDING_|AVAILABILITY_|LOCATION_OPTIONS|CONTACT_DETAILS)/.test(html)) errors.push(`${file}: unfinished content`);
    if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${file}: expected one h1`);
    if (!html.includes('id="main-content"') || !html.includes('href="#main-content"')) errors.push(`${file}: missing skip target`);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (!canonical?.startsWith('https://penaplaza.com/')) errors.push(`${file}: incorrect canonical URL`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        try { JSON.parse(match[1]); } catch { errors.push(`${file}: invalid structured data`); }
    }
    for (const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
        const url = new URL(decode(match[1]), `https://penaplaza.com/${file}`);
        if (url.origin !== 'https://penaplaza.com') continue;
        const targetName = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
        try { await access(path.join(root, targetName)); } catch { errors.push(`${file}: missing local target ${targetName}`); continue; }
        if (url.hash && htmlByName.has(targetName) && !htmlByName.get(targetName).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) errors.push(`${file}: missing anchor ${match[1]}`);
    }
}
for (const [file, name] of [['contact.html','leasing-inquiry'], ['espanol.html','leasing-inquiry-es']]) {
    const html = htmlByName.get(file);
    if (!html.includes(`name="${name}" method="POST"`) || !html.includes('data-netlify="true"') || !html.includes(`name="form-name" value="${name}"`) || !html.includes('netlify-honeypot="bot-field"')) errors.push(`${file}: form detection attributes missing`);
    for (const value of ['building-1', 'building-2', 'either']) if (!html.includes(`option value="${value}"`)) errors.push(`${file}: missing building option ${value}`);
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const [file, html] of htmlByName) {
    const url = `https://penaplaza.com/${file === 'index.html' ? '' : file}`;
    const listed = sitemap.includes(`<loc>${url}</loc>`);
    if (listed === /name="robots" content="noindex/.test(html)) errors.push(`${file}: sitemap indexing mismatch`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Checked ${pages.length} pages: local links, anchors, metadata, structured data, forms, and sitemap pass.`);
