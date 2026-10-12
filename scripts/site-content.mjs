import { readFile } from 'node:fs/promises';

export const site = JSON.parse(await readFile(new URL('../data/site.json', import.meta.url), 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const textOnly = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
if (site.url !== 'https://penaplaza.com') throw new Error('Check the configured production URL.');
if (site.buildings.length !== 2 || new Set(site.buildings.map(b => b.id)).size !== 2) throw new Error('Two distinct buildings are required.');
for (const building of site.buildings) {
    if (!/^building-[12]$/.test(building.id)) throw new Error('Invalid building identifier.');
    if (building.address && !['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'].every(key => typeof building.address[key] === 'string' && building.address[key].trim())) throw new Error(`${building.id}: complete the address or leave it null.`);
}
const label = (building, es) => es ? `Peña Plaza · Edificio ${building.id.slice(-1)}` : building.name;
function address(building, es) {
    if (!building.address) return `<p class="address-status">${es ? 'Dirección pendiente de confirmación. Solicítela antes de visitar.' : 'Address pending confirmation. Request directions before visiting.'}</p>`;
    const a = building.address;
    const full = `${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion} ${a.postalCode}`;
    return `<address>${esc(a.streetAddress)}<br>${esc(a.addressLocality)}, ${esc(a.addressRegion)} ${esc(a.postalCode)}</address><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(full)}" target="_blank" rel="noopener noreferrer">${es ? 'Cómo llegar' : 'Get Directions'} ↗</a>`;
}
function figure(building, es, eager = false) {
    return `<figure class="property-figure"><img src="${esc(building.image)}" alt="${esc(es ? `Vista ilustrativa de Peña Plaza, Edificio ${building.id.slice(-1)}` : building.imageAlt)}" width="${building.imageWidth}" height="${building.imageHeight}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"><figcaption>${esc(es ? building.captionEs : building.caption)}</figcaption></figure>`;
}
function cards(es, availability = false, eager = false) {
    return `<div class="property-grid">${site.buildings.map(b => `<article class="property-card">
${figure(b, es, eager)}<div class="property-card-copy"><p class="eyebrow">${es ? 'Ubicación' : 'Location'} ${b.id.slice(-1)}</p><h2>${esc(label(b, es))}</h2>
${address(b, es)}<p>${es ? 'Consulte disponibilidad, tamaños y precios.' : 'Contact us for current availability, suite sizes, and pricing.'}</p>
<div class="property-actions"><a class="button button-primary" href="${es ? 'espanol.html' : 'contact.html'}?building=${b.id}${es ? '#consulta' : ''}">${es ? 'Consultar este edificio' : `Ask About Building ${b.id.slice(-1)}`}</a>
<a class="text-link" href="${b.id}.html"${es ? ' lang="en"' : ''}>${es ? 'Detalles (en inglés)' : 'View Building Details'} →</a></div>
${availability ? suites(b, es) : ''}</div></article>`).join('')}</div>`;
}
function suites(building, es = false) {
    if (!building.suites.length) return `<p class="inventory-note">${es ? 'No hay detalles de locales publicados actualmente. Consulte la disponibilidad.' : 'No suite details are currently published. Please inquire about availability.'}</p>`;
    return `<div class="suite-list">${building.suites.map(s => `<article class="suite-summary"><h3>${esc(s.name)}</h3><dl><div><dt>${es ? 'Tamaño' : 'Size'}</dt><dd>${esc(s.sizeText)}</dd></div><div><dt>${es ? 'Precio' : 'Rent'}</dt><dd>${esc(s.rentText)}</dd></div><div><dt>${es ? 'Disponibilidad' : 'Availability'}</dt><dd>${esc(s.availabilityText)}</dd></div></dl></article>`).join('')}</div>`;
}
function detail(id, es) {
    const b = site.buildings.find(b => b.id === id);
    if (!b) throw new Error(`Unknown building: ${id}`);
    return `${figure(b, es, true)}<div class="property-detail-grid"><div><p class="eyebrow">${es ? 'Ubicación' : 'Location'}</p><h2>${esc(label(b, es))}</h2>${address(b, es)}<p>${es ? 'Este edificio está en una ubicación diferente a la otra propiedad de Peña Plaza.' : 'This building is at a different location from the other Peña Plaza property.'}</p></div><div class="detail-panel"><h2 class="small-heading">${es ? 'Disponibilidad y visitas' : 'Availability & tours'}</h2>${suites(b, es)}<div class="property-actions"><a class="button button-primary" href="contact.html?building=${b.id}">Request Leasing Details</a><a class="button button-secondary" href="contact.html?building=${b.id}&amp;request=tour">Request a Tour</a></div></div></div>`;
}
function contact(es) {
    const c = site.contact;
    if (!c.phone && !c.email && !c.responseTime) return '';
    return `<div class="direct-contact"><h3>${es ? 'Contacto de arrendamiento' : 'Leasing contact'}</h3>${c.phone ? `<p><a href="tel:${esc(c.phone.replace(/[^+\d]/g,''))}">${esc(c.phone)}</a></p>` : ''}${c.email ? `<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ''}${c.responseTime ? `<p>${esc(c.responseTime)}</p>` : ''}</div>`;
}
function schema(html, file, es) {
    const url = `${site.url}/${file === 'index.html' ? '' : file}`;
    const title = textOnly(html.match(/<title>(.*?)<\/title>/s)?.[1] || site.name);
    const places = site.buildings.map(b => ({'@type':'Place','@id':`${site.url}/${b.id}.html#place`,name:b.name,url:`${site.url}/${b.id}.html`,...(b.address ? {address:{'@type':'PostalAddress',...b.address,addressCountry:'US'}} : {})}));
    const specific = site.buildings.find(b => file === `${b.id}.html`);
    const graph = [
        {'@type':'Organization','@id':`${site.url}/#organization`,name:site.name,url:site.url,logo:`${site.url}/images/pena-plaza-logo-horizontal.webp`,...(site.contact.phone ? {telephone:site.contact.phone} : {}),...(site.contact.email ? {email:site.contact.email} : {})},
        {'@type':'WebSite','@id':`${site.url}/#website`,name:site.name,url:site.url,publisher:{'@id':`${site.url}/#organization`},inLanguage:['en','es']},
        ...places,
        {'@type':file === 'contact.html' ? 'ContactPage' : file === 'about.html' ? 'AboutPage' : 'WebPage','@id':`${url}#webpage`,url,name:title,inLanguage:es?'es':'en',isPartOf:{'@id':`${site.url}/#website`},about:specific ? {'@id':`${site.url}/${specific.id}.html#place`} : places.map(p => ({'@id':p['@id']}))}
    ];
    const questions = [...html.matchAll(/<article class="faq-item"><h3>(.*?)<\/h3><p>(.*?)<\/p><\/article>/gs)].map(m => ({'@type':'Question',name:textOnly(m[1]),acceptedAnswer:{'@type':'Answer',text:textOnly(m[2])}}));
    if (questions.length) graph.push({'@type':'FAQPage','@id':`${url}#faq`,mainEntity:questions});
    return `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`;
}
export function renderContent(html, file) {
    const es = /<html lang="es">/.test(html);
    html = html.replace('<!-- BUILDING_CARDS -->', () => cards(es, false, file === 'index.html'))
        .replace('<!-- AVAILABILITY_CARDS -->', () => cards(es, true))
        .replace(/<!-- BUILDING_DETAIL:(building-[12]) -->/g, (_, id) => detail(id, es))
        .replace('<!-- CONTACT_DETAILS -->', () => contact(es))
        .replace('<!-- LOCATION_OPTIONS -->', () => `<option value="either">${es ? 'Cualquiera de los dos edificios' : 'Either building'}</option>` + site.buildings.map(b => `<option value="${b.id}">${esc(label(b, es))}</option>`).join(''));
    html = html.replace('<!-- SITE_SCHEMA -->', () => schema(html, file, es));
    if (file === '404.html') html = html.replace('<head>', '<head>\n<base href="/">');
    return html;
}
export function navigation(es = false) {
    const links = es ? [['espanol.html','Inicio'],['espanol.html#consulta','Consultar'],['index.html','English']] : [['index.html','Home'],['about.html','About'],['available-spaces.html','Availability'],['location.html','Locations'],['leasing.html','Leasing'],['espanol.html','Español']];
    return `<header class="site-header"><a class="site-brand" href="${es ? 'espanol.html' : 'index.html'}" aria-label="${es ? 'Peña Plaza, inicio' : 'Peña Plaza home'}"><img class="site-brand-logo" src="images/pena-plaza-logo-horizontal.webp" alt="Peña Plaza" width="900" height="300"></a><button class="navigation-toggle" type="button" aria-expanded="false" aria-controls="navigation-panel" aria-label="${es ? 'Abrir menú' : 'Open navigation'}"><span class="navigation-toggle-bar"></span><span class="navigation-toggle-bar"></span><span class="navigation-toggle-bar"></span></button><div class="navigation-panel" id="navigation-panel"><nav class="main-navigation" aria-label="${es ? 'Navegación principal' : 'Main navigation'}">${links.map(([href,title]) => `<a href="${href}"${title === 'Español' ? ' lang="es"' : title === 'English' ? ' lang="en"' : ''}>${title}</a>`).join('')}</nav><a class="leasing-button" href="${es ? 'espanol.html#consulta' : 'contact.html'}">${es ? 'Consultar' : 'Leasing Inquiry'}</a></div></header>`;
}
export function footer(es = false) {
    return `<div class="footer-main"><div class="container footer-grid"><div class="footer-brand-column"><a class="footer-brand" href="${es ? 'espanol.html' : 'index.html'}"><img class="footer-logo" src="images/pena-plaza-mark.webp" alt="" width="512" height="512"><span>Peña Plaza</span></a><p class="footer-description">${es ? 'Dos edificios comerciales en ubicaciones diferentes en el Valle del Río Grande. Consulte disponibilidad y detalles de arrendamiento.' : 'Two commercial buildings at separate locations in the Rio Grande Valley. Explore the properties and request leasing details.'}</p></div><div class="footer-column"><h2 class="footer-heading">${es ? 'Propiedades' : 'Properties'}</h2><nav class="footer-links" aria-label="${es ? 'Propiedades y consultas' : 'Property links'}"><a href="building-1.html">${es ? 'Edificio 1 (en inglés)' : 'Building 1'}</a><a href="building-2.html">${es ? 'Edificio 2 (en inglés)' : 'Building 2'}</a><a href="${es ? 'espanol.html#consulta' : 'contact.html'}">${es ? 'Consultar' : 'Leasing Inquiry'}</a><a href="${es ? 'index.html' : 'espanol.html'}" lang="${es ? 'en' : 'es'}">${es ? 'English' : 'Español'}</a></nav></div><div class="footer-column"><h2 class="footer-heading">${es ? 'Información' : 'Information'}</h2><nav class="footer-links" aria-label="${es ? 'Información legal en inglés' : 'Information links'}"><a href="leasing.html">${es ? 'Arrendamiento (en inglés)' : 'Leasing Information'}</a><a href="privacy-policy.html">${es ? 'Privacidad (en inglés)' : 'Privacy Policy'}</a><a href="website-disclaimer.html">${es ? 'Aviso legal (en inglés)' : 'Website Disclaimer'}</a></nav></div></div></div><div class="footer-bottom"><div class="container footer-bottom-inner"><p>© <span id="current-year">2026</span> Peña Plaza. ${es ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p><a class="footer-credit" href="https://renatus.technology" target="_blank" rel="noopener noreferrer"><span>${es ? 'Sitio por' : 'Website by'}</span><img class="footer-credit-logo" src="images/renatus-horizontal-transparent.png" alt="Renatus Technology" width="1804" height="346"></a></div></div>`;
}
