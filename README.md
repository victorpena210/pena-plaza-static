# Pena Plaza Static Website

A static HTML/CSS/JavaScript marketing and leasing website for Pena Plaza, organized using the same production pattern as TexMediator: shared components, semantic HTML, build-time navbar/footer injection, SEO/AEO metadata, and a Netlify-ready build.

## Pages

- `index.html` — primary San Antonio commercial-space landing page
- `about.html` — property overview
- `available-spaces.html` — leasing/availability page without fabricated inventory
- `location.html` — San Antonio location page
- `leasing.html` — leasing process and FAQ
- `contact.html` — Netlify leasing inquiry form
- `privacy-policy.html`
- `website-disclaimer.html`

## Before launch

1. Replace every `https://example.com` canonical/structured-data/sitemap URL with the final production domain.
2. Update `robots.txt` with the final sitemap URL.
3. Add the exact street address, phone number, leasing email, verified amenities, suite sizes, rent, and availability once confirmed.
4. Replace or supplement the current hero rendering with verified property photography as construction progresses.
5. Connect the production domain, Google Analytics 4, and Google Search Console.
6. Submit `sitemap.xml` after the production URL is final.

## Build

```bash
npm run build
```

Netlify publishes the generated `dist/` directory.

The source HTML uses empty `#site-header` and `#site-footer` placeholders. The build injects the shared component markup directly into each deployed HTML response so navigation and footer links are crawlable without relying on JavaScript.

## Future tenant portal

Keep the Java/Spring project separately. When the payment/tenant system is ready, it can be deployed under a subdomain such as `portal.yourdomain.com` without replacing this public SEO site.

## Visual direction

Pena Plaza intentionally has its own visual system rather than reusing TexMediator's presentation. The current design uses a light architectural/editorial layout, limestone neutrals, deep green, and a clay accent, with split imagery and rounded commercial-property cards. TexMediator is only the reference for code organization and static-site architecture.
# pena-plaza-static
