import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderContent, navigation, footer as renderFooter, site } from "./site-content.mjs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const COMPONENTS_DIR = path.join(ROOT, "components");
const PUBLIC_DIRECTORIES = new Set(["css", "images", "js"]);
const PUBLIC_EXTENSION_ALLOWLIST = new Set([".html", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".txt", ".webmanifest", ".webp", ".xml"]);
const PUBLIC_EXTENSIONLESS_FILES = new Set(["_redirects"]);
const HEADER_PLACEHOLDER = /<div\s+id=["']site-header["']\s*><\/div>/i;
const FOOTER_PLACEHOLDER = /<footer\s+id=["']site-footer["']\s*><\/footer>/i;

function indentBlock(text, spaces = 4) {
    const padding = " ".repeat(spaces);
    return text.split("\n").map((line) => line.length ? `${padding}${line}` : "").join("\n");
}

async function collectHtmlFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const htmlFiles = [];
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) htmlFiles.push(...await collectHtmlFiles(fullPath));
        else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
    }
    return htmlFiles;
}

async function copyPublicSite() {
    const entries = await readdir(ROOT, { withFileTypes: true });
    for (const entry of entries) {
        const isPublicDirectory = entry.isDirectory() && PUBLIC_DIRECTORIES.has(entry.name);
        const isPublicFile = entry.isFile() && (PUBLIC_EXTENSIONLESS_FILES.has(entry.name) || PUBLIC_EXTENSION_ALLOWLIST.has(path.extname(entry.name).toLowerCase()));
        if (!isPublicDirectory && !isPublicFile) continue;
        await cp(path.join(ROOT, entry.name), path.join(DIST, entry.name), { recursive: true, force: true });
    }
}

async function injectSharedComponents() {

    const htmlFiles = await collectHtmlFiles(DIST);
    let builtPageCount = 0;

    for (const filePath of htmlFiles) {
        let html = await readFile(filePath, "utf8");
        html = renderContent(html, path.basename(filePath));
        const es = /<html lang="es">/.test(html);
        const navbar = navigation(es);
        const footer = renderFooter(es);
        const hasHeader = HEADER_PLACEHOLDER.test(html);
        const hasFooter = FOOTER_PLACEHOLDER.test(html);
        if (!hasHeader && !hasFooter) continue;
        if (!hasHeader || !hasFooter) throw new Error(`${path.relative(ROOT, filePath)} must contain both shared layout placeholders.`);

        html = html.replace(HEADER_PLACEHOLDER, ['<div id="site-header">', '    <!-- Shared navbar injected at build time for SEO/AEO. -->', indentBlock(navbar), '</div>'].join("\n"));
        html = html.replace(FOOTER_PLACEHOLDER, ['<footer id="site-footer">', '    <!-- Shared footer injected at build time for SEO/AEO. -->', indentBlock(footer), '</footer>'].join("\n"));
        await writeFile(filePath, html, "utf8");
        builtPageCount += 1;
    }
    if (!builtPageCount) throw new Error("No pages with shared component placeholders were found.");
    return builtPageCount;
}

async function validateBuiltSite() {
    const htmlFiles = await collectHtmlFiles(DIST);
    const problems = [];
    for (const filePath of htmlFiles) {
        const html = await readFile(filePath, "utf8");
        const relative = path.relative(DIST, filePath);
        if (HEADER_PLACEHOLDER.test(html)) problems.push(`${relative}: empty site-header remains`);
        if (FOOTER_PLACEHOLDER.test(html)) problems.push(`${relative}: empty site-footer remains`);
        if (!/aria-label="(Main navigation|Navegación principal)"/.test(html)) problems.push(`${relative}: navbar was not injected`);
        if (!html.includes("Peña Plaza. All rights reserved.") && !html.includes("Peña Plaza. Todos los derechos reservados.")) problems.push(`${relative}: footer was not injected`);
    }
    if (problems.length) throw new Error(`Build validation failed:\n- ${problems.join("\n- ")}`);
}

async function build() {
    await rm(DIST, { recursive: true, force: true });
    await mkdir(DIST, { recursive: true });
    await copyPublicSite();
    const count = await injectSharedComponents();
    await validateBuiltSite();
    const pages = (await collectHtmlFiles(DIST)).sort();
    const entries = [];
    for (const file of pages) {
        const html = await readFile(file, 'utf8');
        if (/name="robots" content="noindex/.test(html)) continue;
        entries.push(`    <url><loc>${site.url}/${path.basename(file) === 'index.html' ? '' : path.basename(file)}</loc></url>`);
    }
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
    await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
    await writeFile(path.join(ROOT, 'sitemap.xml'), sitemap);
    // Keep the source-preview fallback components aligned with the deployed layout.
    await writeFile(path.join(COMPONENTS_DIR, 'navbar.html'), navigation());
    await writeFile(path.join(COMPONENTS_DIR, 'footer.html'), renderFooter());
    console.log(`Built ${count} HTML pages into dist/.`);
    console.log("Shared navigation/footer are present in deployed HTML for crawlers and answer engines.");
}

build().catch((error) => { console.error(error); process.exit(1); });
