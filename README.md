# fret.

A curated, guitar-only marketplace with AI-powered buyer matching.

Buyers complete a short profile onboarding (voice or text), then browse
inventory ranked by an AI-computed match score. Sellers pay a flat listing fee
and are required to upload a walkthrough video. When a new listing matches a
buyer's profile above a threshold, the buyer gets an SMS.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma |
| Auth | Clerk |
| Image storage | Cloudflare R2 (S3-compatible) |
| Video | Cloudflare Stream |
| AI | Anthropic API (`claude-sonnet-4-6`) |
| Search | Typesense |
| Payments | Stripe |
| Email | Resend |
| SMS | Twilio |
| Hosting | DigitalOcean App Platform |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values
npx prisma db push           # push schema to your Postgres
npm run dev
```

Open http://localhost:3000.

### Environment variables

See `.env.example` for the full list. The minimum to boot the app locally is
`DATABASE_URL` plus the Clerk keys. Each integration (Anthropic, Stripe,
Cloudflare, Twilio, Resend, Typesense) is lazily initialized — the app builds
and runs without them, and only the corresponding feature fails if a key is
missing.

> All secrets are read **server-side only**. The only client-exposed keys are
> the `NEXT_PUBLIC_*` ones (Clerk publishable key, Stripe publishable key,
> Cloudflare account id for the video player, app URL).

## Architecture notes

- **Prisma** is only imported in server components and API routes
  (`lib/prisma.ts` is a singleton). Never import it from a client component.
- **Match scoring** runs as a cron job hitting `POST /api/listings/score` with
  an `Authorization: Bearer $CRON_SECRET` header. It scores every
  (active listing from the last 24h × buyer profile) pair via the Anthropic API,
  **batched in groups of 10** with `Promise.all`, upserts a `MatchScore`, and
  fires an SMS via Twilio when a score ≥ 85 hits a buyer with a phone on file.
- **Webhooks**: `POST /api/webhooks/clerk` syncs users into Postgres on signup;
  `POST /api/webhooks/stripe` flips a listing to `ACTIVE` on
  `checkout.session.completed` and indexes it in Typesense.
- **Search**: `lib/typesense.ts` mirrors the searchable `Listing` fields and is
  synced on listing activation.

## Key flows

| Flow | Route(s) |
|---|---|
| Marketing landing | `/welcome` |
| Auth | `/sign-in`, `/sign-up` |
| Buyer onboarding (voice + AI extraction) | `/onboarding` → `POST /api/profile/extract` |
| Browse (match-ranked grid) | `/browse` |
| Listing detail (video + contact) | `/listing/[id]` |
| Seller listing flow (video → photos → details → Stripe) | `/sell` → `POST /api/listings` |
| Seller dashboard | `/dashboard` |
| Dealer dashboard | `/dealer/dashboard` |

## Deploying to DigitalOcean App Platform

`.do/app.yaml` defines the web service and a scheduled job that calls the match
scoring endpoint. Set every environment variable from `.env.example` as an app
secret. Point your Stripe and Clerk webhooks at
`https://<your-domain>/api/webhooks/stripe` and `.../api/webhooks/clerk`.

The scoring cron can also be driven by any external scheduler:

```bash
curl -X POST https://<your-domain>/api/listings/score \
  -H "Authorization: Bearer $CRON_SECRET"
```
