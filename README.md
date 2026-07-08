# 🌱 TinySteps

**10 minutes a day of brain-building play — for newborns to 6-year-olds.**

TinySteps gives parents three simple, age-matched development activities every
day, each doable in about 10 minutes with things already at home. Parents mark
activities complete and watch their weekly tracker fill up.

## Features

- **Auth flow** — email/password signup and login (NextAuth, bcrypt-hashed
  passwords, JWT sessions), with protected routes via middleware.
- **Child profiles** — add a child with their birth date; every activity is
  matched to their exact age in months (7 age bands, newborn → 6 years).
- **Daily activities** — 3 deterministic daily picks that rotate each day,
  spanning 5 development categories: motor, language, sensory, cognitive,
  social-emotional. Each activity has step-by-step instructions, a materials
  list, and the developmental "why" behind it.
- **Subscription model** — free plan (featured daily activity + everyday
  library, 1 child) and Premium ($6.99/mo or $59/yr) via Stripe Checkout,
  webhook-synced status with success-page reconciliation, and the Stripe
  billing portal. An explicit **demo billing mode** (`ALLOW_DEMO_BILLING=true`)
  lets you test the whole subscription flow with no Stripe account.
- **Weekly tracking** — per-child week grid (Mon–Sun), day streak, active-day
  count, all-time total, skill-mix breakdown, and a completion log. Days are
  computed in the *user's* timezone (browser timezone synced via cookie).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
NextAuth v4 · Stripe

## Deploy

### Option A — Render (one click, includes the database)

1. Push this repo to GitHub (already done if you're reading this there).
2. In [Render](https://dashboard.render.com): **New → Blueprint**, connect the
   repo, pick the branch, **Apply**.
3. `render.yaml` provisions the web service + free Postgres, generates
   `NEXTAUTH_SECRET`, seeds the activity catalog, and enables demo billing so
   you can test Premium without Stripe.

Note: Render's free web service sleeps when idle — the first request after a
quiet period takes ~30–60s.

### Option B — Vercel + Neon

1. Create a free Postgres database at [neon.tech](https://neon.tech) and copy
   the connection string.
2. In [Vercel](https://vercel.com/new): import the GitHub repo. Before
   deploying, add environment variables:
   - `DATABASE_URL` — the Neon connection string
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `ALLOW_DEMO_BILLING` — `true` (to test subscriptions without Stripe)
3. Deploy. The `vercel-build` script pushes the schema and seeds activities
   automatically. (If `prisma db push` fails through Neon's pooled connection,
   use the **direct** connection string instead.)

### Real payments (either host)

Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`
(recurring prices from the [Stripe dashboard](https://dashboard.stripe.com/test/products)),
and `STRIPE_WEBHOOK_SECRET` for a webhook endpoint pointed at
`https://<your-app>/api/stripe/webhook` with events
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`. Then remove `ALLOW_DEMO_BILLING`.
When Stripe keys are absent AND demo billing isn't explicitly enabled,
billing endpoints fail closed (503) rather than giving Premium away.

## Local development

```bash
npm install
cp .env.example .env        # set DATABASE_URL (any Postgres) + NEXTAUTH_SECRET
npm run setup               # prisma generate + db push + seed activities
npm run dev                 # http://localhost:3000
```

## Project layout

```
render.yaml              # one-click Render blueprint (web service + Postgres)
prisma/
  schema.prisma          # User, Child, Activity, ActivityCompletion (Postgres)
  seed.ts                # 39 curated activities across 7 age bands (idempotent)
src/
  lib/                   # prisma client, auth, stripe helpers, age math,
                         # daily picks, timezone-aware day keys
  middleware.ts          # route protection
  app/
    page.tsx             # landing + pricing
    signup/ login/       # auth screens (server-gated, client forms)
    onboarding/          # add a child (free-plan limit surfaced up front)
    dashboard/           # today's 3 picks + week strip
    activities/          # filterable library + detail pages, child switcher
    progress/            # weekly tracker, streak, skill mix, log
    account/             # plan status, upgrade, cancel, checkout reconciliation
    api/
      auth/              # NextAuth + signup
      children/          # child profiles (free-plan limit enforced)
      completions/       # toggle today's completion (entitlement-checked)
      stripe/            # checkout, webhook, billing portal
```

## Known gaps (deliberate for this stage)

No password reset / email verification, no rate limiting on auth endpoints,
no transactional email, no Terms/Privacy pages, no admin UI for activities
(content lives in `prisma/seed.ts`), no automated tests. See the project
issue tracker / review notes before a real public launch.
