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
- **Subscription model** — free plan (1 featured activity/day, 1 child) and
  Premium ($6.99/mo or $59/yr) via Stripe Checkout, webhook-synced status,
  and the Stripe billing portal for cancellation. Runs in **demo billing
  mode** when Stripe keys are absent (upgrades apply instantly — dev only).
- **Weekly tracking** — per-child week grid (Mon–Sun), day streak, active-day
  count, all-time total, skill-mix breakdown, and a completion log.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite ·
NextAuth v4 · Stripe

## Getting started

```bash
npm install
cp .env.example .env        # then set NEXTAUTH_SECRET (openssl rand -base64 32)
npm run setup               # prisma generate + db push + seed activities
npm run dev                 # http://localhost:3000
```

Sign up, add a child, and you'll land on today's activities.

### Stripe (optional for local dev)

Without Stripe keys the app runs in demo billing mode: the upgrade buttons
activate Premium instantly with no payment. For real payments:

1. Create two recurring prices in the [Stripe dashboard](https://dashboard.stripe.com/test/products)
   (monthly + yearly) and put their IDs in `STRIPE_PRICE_MONTHLY` /
   `STRIPE_PRICE_YEARLY`.
2. Set `STRIPE_SECRET_KEY`.
3. Forward webhooks locally and set `STRIPE_WEBHOOK_SECRET`:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Events handled: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.

### Production notes

- Swap SQLite for Postgres by changing `datasource db` in
  `prisma/schema.prisma` and `DATABASE_URL`.
- Set a strong `NEXTAUTH_SECRET` and the real `NEXTAUTH_URL`.

## Project layout

```
prisma/
  schema.prisma        # User, Child, Activity, ActivityCompletion
  seed.ts              # 39 curated activities across 7 age bands
src/
  lib/                 # prisma client, auth options, stripe, age math, daily picks
  middleware.ts        # route protection
  app/
    page.tsx           # landing + pricing
    signup/ login/     # auth screens
    onboarding/        # add a child
    dashboard/         # today's 3 picks + week strip
    activities/        # filterable library + detail pages
    progress/          # weekly tracker, streak, log
    account/           # plan status, upgrade, cancel, children
    api/
      auth/            # NextAuth + signup
      children/        # child profiles (free-plan limit enforced)
      completions/     # toggle today's completion
      stripe/          # checkout, webhook, billing portal
```
