# Peña Plaza — two-location commercial leasing site

This update distinguishes two separate buildings, uses the approved enhanced Building 2 image, and removes the previous single-address assumption. Both addresses are pending owner confirmation. The former street address and map are intentionally unpublished until their building association is confirmed.

## Build and preview

Requires Node.js 22 or later; the build uses Node's built-in modules and needs no npm dependencies.

```bash
npm run check
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Preview and deploy **dist/**: the build adds property details, shared navigation/footer, and structured data to the source pages. Netlify uses the included `netlify.toml` to run the build and publish `dist`.

## Pages

- `index.html`: overview of both buildings
- `location.html`: both locations (existing URL retained)
- `building-1.html`, `building-2.html`: separate property pages
- `available-spaces.html`: inquiries and any verified suite details
- `leasing.html`: process and practical leasing questions
- `contact.html`: English Netlify form with building and request selections
- `espanol.html`: Spanish overview and separate Spanish Netlify form
- `about.html`, `privacy-policy.html`, `website-disclaimer.html`
- `thank-you.html`, `gracias.html`, `404.html`: excluded from the sitemap and marked noindex

## Add the confirmed addresses

Edit **data/site.json**. Match each building to its picture before assigning an address. Replace the relevant `address: null` with a complete object using these keys:

```json
{
  "streetAddress": "CONFIRMED STREET ADDRESS",
  "addressLocality": "CONFIRMED CITY",
  "addressRegion": "TX",
  "postalCode": "CONFIRMED ZIP"
}
```

The uppercase values above are instructions, not publishable property information. Use the real values, then run `npm run build`. The address, directions link, and matching Place structured data will update together. Leave an address null if it is not confirmed. No map points to an assumed location.

## Add leasing contact information

In the same file, populate `contact.phone`, `contact.email`, and, only if approved, `contact.responseTime`. Null fields stay hidden. Phone and email links appear on the inquiry pages. Do not promise a response time until management has confirmed it.

## Add verified availability

Each building has a `suites` array. It is empty because no vacancies, dimensions, rates, or occupancy dates have been supplied. Each confirmed listing can use:

```json
{
  "name": "VERIFIED SUITE NAME",
  "sizeText": "VERIFIED SQUARE FOOTAGE",
  "rentText": "APPROVED RENT OR CONTACT FOR PRICING",
  "availabilityText": "CONFIRMED STATUS OR DATE"
}
```

Only insert approved values. When you publish suite listings, also update the introductory availability text and the English/Spanish FAQs that currently say sizes, prices, and dates are not published. This prevents outdated claims.

## Images

- Building 1 uses `images/pena-plaza-building-1.svg`, an edit of the original six-storefront building. Its low roofline, metal awning, stone piers, storefront layout, landscaping, and monument sign are preserved; the edit adds a daytime blue sky, updates Peña Plaza branding, and removes invented tenant signage. Building 2 is a separate property with a different design.
- Building 2 uses `images/pena-plaza-building-2.webp`, the enhanced photo edit with proposed signage and landscaping.
- Property-image captions and alt text are defined beside each building in `data/site.json`. Keep them accurate when current property photography becomes available.

## Form delivery after deployment

The forms use native HTML POST submission and browser validation; JavaScript only preselects supported building/request values. Netlify honeypots are hidden from keyboard and assistive technology navigation. English and Spanish form names are `leasing-inquiry` and `leasing-inquiry-es`.

After deploying, verify form detection is enabled in the Netlify site settings, confirm both forms appear, and configure the desired email notifications. Submit one English inquiry and one Spanish inquiry on the live site. Verify the form records, notification receipt, building selection, and thank-you redirect. Local checks can verify markup and submitted fields, but cannot prove live Netlify processing or email delivery.

Do not add an analytics identifier until the real account ID is supplied. No analytics or advertising scripts are included.

## SEO and accessibility

All canonical URLs, social URLs, and schema identities use `https://penaplaza.com`. The build generates `sitemap.xml`; `robots.txt` references it. Each building has its own Place identity without an invented address. The Spanish landing page and English homepage have reciprocal language alternate links.

Deployed HTML includes all navigation and property content without JavaScript. There are visible keyboard focus styles, skip links, correctly labeled fields, reduced-motion support, and an Escape-to-close mobile menu that restores focus only when open.

## What remains for the owner

1. Confirm the address associated with each building.
2. Supply any approved leasing phone, email, and response expectation.
3. Supply real suite availability, sizes, rates, terms, and amenities.
4. Verify live form delivery and notifications after deployment.
5. Add current photography when available; do not describe proposed signs or landscaping as installed.

No public deployment was performed as part of the ZIP update.

## Validation performed for this update

- Production build and static checks passed for all 14 pages: internal links and anchors, canonical URLs, valid structured data, Netlify form markup, and sitemap inclusion.
- Browser checks passed for all pages at desktop (1440px) and mobile (390px) widths, with extra 320px checks on the homepage and both inquiry pages. No horizontal overflow, missing images, or JavaScript errors were found.
- Verified building/tour preselection, invalid query-value handling, required form fields, keyboard skip navigation, mobile-menu Escape/focus behavior, and navigation/property content with JavaScript disabled.
- English and Spanish form POST payloads were intercepted locally and checked. No live inquiry was sent; Netlify processing and notification delivery remain to be verified after deployment.
