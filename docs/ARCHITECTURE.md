# Architecture

## Layers

```
src/
  app/                    Routing only – thin pages that call services/repositories
    (site)/               Public website (own root layout, site.css)
      page.tsx            /
      about/ contact/     /about, /contact
      products/[slug]/    /products/:slug  (SSG, revalidated on admin edits)
      [slug]/             /:slug – admin-created pages (sections); RESERVED_SLUGS in lib/validation.ts
    uploads/[name]/       Serves admin-uploaded images from UPLOAD_DIR (data/uploads)
    admin/                Admin panel (own root layout, admin.css, never indexed)
      login/              /admin/login
      (panel)/            Session-guarded area: dashboard, products, enquiries, seo, settings
    sitemap.ts robots.ts  Generated from DB + Global SEO settings
  components/
    site/                 Public UI (Nav, HeroSlider, ContactForm, effects…)
    admin/                Admin UI (ActionForm/Field, ProductForm, PageSeoForm…)
  server/                 Server-only code ("server-only" import guard)
    db/                   SQLite connection, append-only migrations, first-boot seed
    repositories/         All SQL lives here – one file per table/aggregate
    services/             auth (sessions), seo (metadata + audit), password, rate-limit
    actions/              Server Actions – validate (zod) → authorise → repository → revalidate
    defaults.ts           Default settings & list of static pages
  lib/                    Pure, framework-free helpers (unit tested)
    seo.ts                SEO resolution precedence + scoring (shared by site & admin preview)
    validation.ts         zod schemas for every form
    structured-data.ts    JSON-LD builders
  content/home.ts         Default Home/About copy (overridden by what admins save – settings keys "home"/"about")
  types/                  Domain types
  proxy.ts                Edge gate: no session cookie → /admin/login
tests/                    Vitest (pure libs + repositories against in-memory SQLite)
```

**Rule of dependency:** `app → components / server/actions → services → repositories → db`. `lib` and `types` are importable from anywhere (including client components) and must stay pure.

## Key decisions

| Decision | Why |
|---|---|
| Next.js App Router, SSR/SSG | Real URLs and server-rendered HTML are required for SEO; the old hash-router SPA exposed a single URL to Google. |
| SQLite via built-in `node:sqlite` | Zero-ops, no native build step, plenty for a single-site CMS. Swap repositories to Postgres if the site ever runs multi-instance. |
| Static pages + `revalidatePath` | Public pages are prebuilt (fast, cheap); any admin save refreshes them immediately. |
| Separate root layouts for site and admin | Site CSS (global `form`, `input`, `nav` rules) can't leak into the admin and vice versa. |
| DB-backed sessions, scrypt passwords | Revocable sessions (sign out other devices on password change); only a SHA-256 of the token is stored. |
| SEO precedence: override → content fallback → global defaults | Pages are good out of the box; admins override only what matters. `resolvePageSeo` is shared so the admin preview is exactly what Google sees. |
| Motion layer in `components/site/Motion.tsx` (+ `HeroSlider`, `SiteEffects`) | Preloader, Lenis smooth scroll (native scroll underneath, so SEO/keyboard/IntersectionObserver keep working), cursor ring, scroll bar, parallax (`data-speed`), fade page transitions. All of it switches off for touch pointers and `prefers-reduced-motion`; content is visible without JS. |
| Plain-text list editing (`Title | Detail`, one per line) | Non-technical staff can edit nested product content without a complex form builder. |
| `RepeaterField` (JSON hidden input) for lists with images | Slides, tiles and page sections need per-item images and reordering; the server validates the JSON with zod (`jsonList`). |
| Uploads stored in `data/uploads`, not `public/` | Next only serves `public/` files present at build time; keeping uploads beside the DB means one folder to back up. File type is detected from bytes, names are random. |

## Security

- Every server action calls `requireAdmin()`; proxy is only a convenience redirect.
- zod validation on all inputs; URL fields accept only `/path` or `http(s)://`.
- Login rate limit (8 / 15 min / IP) and constant-work password check; contact form honeypot + rate limit (5 / hour / IP).
- CSV export neutralises spreadsheet formula injection; JSON-LD output is `<`-escaped.
- Security headers in `next.config.ts`; `/admin` sends `X-Robots-Tag: noindex` and is disallowed in robots.txt.

## Adding things

- **New DB column/table:** append a migration string to `server/db/schema.ts` (never edit an old one).
- **New public page:** add the route under `app/(site)`, add it to `STATIC_PAGES` in `server/defaults.ts` and a fallback in `services/seo.ts#fallbackFor` – it then appears in the sitemap and Page SEO automatically.
