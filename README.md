# The Millionaire's Dollar

A cultural experiment: people pay from €5 to declare publicly that they exist,
receiving a permanent tile on a public Wall and a point on a world Map.

Built with **Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 ·
Motion · Supabase · Stripe · Resend · Mapbox GL**.

Aesthetic: *brutalismo editoriale* — dark-only, serif display type, hairline
borders, no gradients, no shadows, no emoji.

---

## 1. Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in the values (see §3)
npm run dev                        # http://localhost:3000
```

The site runs **without any configuration** using deterministic mock data
(14,847 mock tiles), so you can develop the UI before wiring up services.
As soon as Supabase env vars are present, it reads live data instead.

Useful scripts:

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint |

---

## 2. Architecture

```
app/
  (public)/            Public pages — share SiteNav layout
    page.tsx           Homepage (9 scroll sections)
    wall/              Full virtualized Wall
    map/               Full-screen Map
    tile/[id]/         Shareable single-tile page (+ dynamic OG)
    manifesto, press, privacy, terms, participate
    checkout/success, checkout/cancelled
  (admin)/             Admin area (magic-link auth)
    admin/             overview · participants · vetting · analytics · login
  api/                 checkout · stripe/webhook · tiles · newsletter ·
                       data-deletion · og/default · og/tile/[id]
  auth/callback/       Supabase OTP code exchange
components/            ui/ · home/ · wall/ · map/ · participate/ · admin/
lib/                   data, tiers, i18n, supabase/, stripe, resend, mapbox,
                       geocode, admin, utils, mock-data
hooks/                 use-realtime-counter
supabase/
  migrations/001_initial_schema.sql
  functions/           stripe-webhook · geocode-city · send-newsletter (Deno)
public/                mapbox-style.json, favicon, og assets
```

**Data flow.** Server Components fetch through `lib/data.ts`, which reads the
public-safe `public_tiles` view and the `counters` table, falling back to mock
data when Supabase is not configured. The hero counter updates live via Supabase
Realtime on the `counters` table. Payments create participants only through the
Stripe webhook (service-role), never from the browser.

---

## 3. Environment variables

See `.env.local.example`. Summary:

| Var | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `…_ANON_KEY` | client+server | Public reads (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Webhook / admin writes (bypasses RLS) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | Stripe.js (unused — hosted Checkout) |
| `STRIPE_SECRET_KEY` | server | Create Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | server | Verify webhook signatures |
| `RESEND_API_KEY` | server | Transactional email |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | client | Map rendering (falls back to a counter card if absent) |
| `NEXT_PUBLIC_URL` | both | Absolute URLs (OG, success/cancel) |
| `ADMIN_WHITELIST_EMAILS` | server | Comma-separated admin emails (DB `admin_whitelist` is source of truth) |

---

## 4. Database (Supabase)

Apply the schema:

```bash
# via Supabase CLI
supabase db push
# or paste supabase/migrations/001_initial_schema.sql into the SQL editor
```

**Security model (hardened vs. a naive public-read policy):**

- `participants` holds PII and is **locked to admins** (RLS via
  `admin_whitelist`). Anonymous users get nothing from it.
- A `public_tiles` **view** exposes only non-sensitive columns of public rows,
  granted to `anon`.
- A `counters` table holds the live total + revenue, readable by `anon` and
  published to Realtime — so the live counter never exposes participants.
- `public_stats` is a materialized view; refresh it on a schedule:
  ```sql
  select cron.schedule('refresh-stats','*/5 * * * *','select refresh_public_stats()');
  ```

Seed an admin:

```sql
insert into admin_whitelist(email) values ('you@example.com');
```

### Edge functions (optional)

The webhook, geocoder and newsletter sender are implemented as **Next.js API
routes** (the primary path on Vercel) and **also** provided as Supabase Edge
Functions in `supabase/functions/` for those who prefer to run them on Supabase.
Deploy with `supabase functions deploy <name>` and set secrets via
`supabase secrets set`.

---

## 5. Stripe

1. Create products implicitly via `price_data` (already in `/api/checkout`).
2. Add a webhook endpoint → `https://<domain>/api/stripe/webhook`, event
   `checkout.session.completed`, and copy the signing secret to
   `STRIPE_WEBHOOK_SECRET`.
3. Test locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```
   Use card `4242 4242 4242 4242` on the hosted Checkout page.

Tier prices live in `lib/tiers.ts` and unlock as cumulative revenue grows
(Founding > €5k, Permanent > €15k, Patron > €30k, Curators' Circle > €100k).

---

## 6. Mapbox

Set `NEXT_PUBLIC_MAPBOX_TOKEN`. The dark style is defined in code
(`lib/mapbox.ts`) and mirrored as a deliverable in `public/mapbox-style.json`
(black water, near-black land, hairline country borders, no cities/roads). The
SDK is lazy-loaded only when the map enters the viewport.

---

## 7. Email (Resend)

Verify your sending domain in Resend and set `RESEND_API_KEY`. Templates live in
`lib/resend.ts` (welcome + removal are plain text per the brief) and
`emails/newsletter.html` (HTML, brand-styled).

---

## 8. Deployment (Vercel)

1. Import the repo into Vercel; set all env vars.
2. Production branch `main`; preview deployments on PRs.
3. Point `themillionairesdollar.com` via Cloudflare (SSL Full Strict, Always Use
   HTTPS, Bot Fight Mode). Cache static assets aggressively; bypass `/api` and
   `/admin`.

---

## 9. Accessibility & performance

- WCAG AA: focus-visible rings, skip link, semantic headings, `aria-live` on the
  counter, full keyboard support, `prefers-reduced-motion` honoured everywhere.
- Dark-only, CLS-conscious layout; Mapbox and the Wall grid are lazy/virtualized.
- All copy is available in Italian and English (auto from `Accept-Language`,
  toggle in the menu/footer).

---

## 10. License

© The Curators. All rights reserved.
