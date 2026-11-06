# ERA Interior Products – Website & Admin

Next.js 16 (App Router, TypeScript) site for ERA Interior Products, with a built-in admin panel for products, SEO and enquiries.

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_EMAIL / ADMIN_PASSWORD / SITE_URL
npm run dev                  # http://localhost:3000   admin: /admin
```

On first start the SQLite database (`data/era.db`) is created and seeded with all products, settings and the admin account from `.env.local`.

Requires **Node.js 22.13+** (uses the built-in `node:sqlite` – no native DB dependency).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run check` | Typecheck + lint + tests (run before every deploy) |
| `npm test` | Unit & repository tests (Vitest, in-memory DB) |
| `npm run admin:create -- email "password" ["Name"]` | Create an admin or reset a password |

## Admin panel (`/admin`)

- **Dashboard** – new enquiries, average SEO score, pages needing attention, launch checklist.
- **Pages** – edit all text & images on Home and About; add new pages (e.g. Projects, Services) at `/<address>` built from sections (heading, text, image left/right, button), optionally shown in the menu & footer. New pages get SEO, sitemap and breadcrumb data automatically.
- **Products** – add / edit / hide / delete products; every field on the product page is editable, with a media picker popup for every image – upload from your computer/phone (browse, drag & drop or paste; JPG/PNG/WebP/AVIF, max 8 MB) or reuse an image from the media library. Changes go live instantly.
- **Media library** – all images in one place: upload, search, filter (uploaded / built-in / not used), see size, dimensions and where each image is used, copy its link, delete unused uploads (images still in use can't be deleted).
- **Enquiries** – contact-form submissions (stored in DB, not lost in email), mark read, archive, delete, CSV export.
- **Page SEO** – per-page title, meta description, keywords, social image, canonical, noindex – with live Google & social previews and an SEO score.
- **Global SEO** – site URL, title template, default meta, Google/Bing verification, GA4 / GTM, indexing switch, robots.txt rules.
- **Business & account** – phone, email, address, maps, socials (also feeds Google local-business data) and password change.

## SEO built in

Server-rendered pages with real URLs (`/products/stone` instead of `#stone`), per-page `<title>`/description/canonical/Open Graph/Twitter tags, auto `sitemap.xml` (incl. images) and `robots.txt`, JSON-LD (LocalBusiness, WebSite, BreadcrumbList, Product, FAQPage), optimised AVIF/WebP images, self-hosted fonts, content visible without JavaScript.

## Deployment

Needs a **persistent Node.js host** (VPS, Railway, Render with a disk, etc.) because content lives in SQLite. Not suitable for serverless/read-only file systems without swapping the data layer.

```bash
npm ci && npm run check && npm run build
DATABASE_PATH=/var/lib/era/era.db SITE_URL=https://your-domain npm start   # behind nginx/Caddy for HTTPS
```

Back up the `data/` folder regularly – `era.db` holds products, SEO settings and enquiries, `uploads/` holds images uploaded in the admin (set `UPLOAD_DIR` next to `DATABASE_PATH` in production).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the code structure.
