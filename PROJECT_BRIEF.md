# fret. Boutique Guitar Marketplace

## Claude Code Project Brief

Keep this file in the repo root and treat it as the source of truth for scope and build order. Where this brief and older session notes disagree, this brief wins.

## 0. Role and working style

You are building a curated, guitar-only online marketplace. The product is owned and operated by a small team and used by three kinds of people: buyers looking for a guitar, sellers listing a guitar, and admins running the platform. Follow these working rules for the whole project:

1. Confirm the tech stack and the Prisma schema with me before writing feature code. Scaffold first, then build in the milestone order in Section 11.
2. Write plain, direct prose in all comments, docs, and UI copy. No em dashes. No filler.
3. Deploy a blank working scaffold to DigitalOcean before adding features, so the pipeline is proven early. Front-load all credentials and environment variables.
4. Ask when a requirement is ambiguous rather than guessing. A short list of open questions is at the end of this brief. Resolve those first.
5. Before writing new code in an existing repo, audit what already exists against the milestones and report the gap. Do not rebuild what is already working.

## 1. Mission and scope

### What this is

A curated marketplace for boutique, high-end, and vintage guitars that does three things Reverb does poorly:

1. Gets to know the buyer. It builds a real profile of what a player owns, plays, is chasing, and can spend, then ranks inventory for that person instead of showing everyone the same wall of listings.
2. Keeps listings honest. Sellers pay a small flat fee to list, lower than Reverb, and pricing is checked against fair market value so the site does not fill up with aspirational, overpriced instruments.
3. Surfaces the right guitar fast. When a listing that fits a buyer's profile appears, that buyer hears about it, and buyers see how well each listing matches them at a glance.

The heart of the product is fairness on price. The people listing here actually want to sell at a fair market price. A seller asking eight thousand for a guitar that should sell at six does not belong on this site. We use AI to help hold that line. See Section 2.

### What this is NOT

1. This is not Reverb with a new coat of paint. The buyer profile and the fair-price discipline are the product. Do not water them down into a generic listings grid.
2. This is not an escrow or payment-processing system for the guitar sale itself at MVP. Stripe is used only to collect the listing fee from sellers. Buyer and seller transact the actual instrument off-platform for now. Escrow and buyer payments are a later phase. Do not build them yet.
3. This is not a lesson, tab, or gear-review platform. Stay on marketplace.
4. This is not a price oracle that pretends to know the exact value of every vintage instrument. The AI price check produces a fair-market range and a soft cap, not a hard verdict. Boutique and vintage guitars have thin comps, so the design must allow human review and seller appeal. See Section 2.

Keep the boundary strict: fret. gets to know buyers, keeps sellers honest on price, and connects the two. It does not process the sale or grade the instrument's condition for you.

## 2. The fairness thesis: fair-market pricing

This is the differentiator, so build it deliberately and build it responsibly.

1. The goal is to drive prices toward fair market, which in a healthy resale market means down from wishful asking prices, not up. The platform should feel like the place where guitars are priced to actually sell.
2. When a seller sets a price, run an AI fair-market check. It returns a suggested fair-market range (low, typical, high) and a soft cap for the listing, given brand, model, year, finish, and condition.
3. The cap is a soft gate, not an automatic rejection. A price above the cap does not silently fail. It flags the listing for review and nudges the seller with the fair-market range and a short plain-language reason. An admin can approve an exception (rare finish, documented provenance, genuinely thin comps).
4. Never present the AI estimate as a guaranteed value. Label it as an estimate. Store the estimate, the range, the cap, and the model version on the listing so decisions are auditable and the model can be tuned later.
5. Optional trust signal: when a listing sits at or below the typical fair-market figure, it can carry a "priced to sell" style badge. Keep it subtle and honest.
6. Keep the API key server-side. The fair-market call happens in the Node backend, never in the browser. Make the model configurable by env var and default to a Sonnet-class model for cost.

Treat the fair-market range as guidance and reporting, not as a contractual valuation. The platform's opinion on price is a feature, not a legal appraisal.

## 3. The front door: user journeys

### The welcome page (the fork)

The entry point is a clean welcome page, not a raw listings grid. It offers two clear paths and nothing else competing for attention:

1. "Tell us about yourself." Sends the buyer into onboarding (Section 6.2) so we can learn their taste and budget and personalize everything after.
2. "Just start searching." Sends the buyer straight to the browse page, which loads as an unfiltered, everything-for-sale result so they can look around immediately with zero friction.

Both paths lead to the same browse experience. The difference is whether it is personalized. A buyer who skips onboarding can start it later at any time, and the browse page should gently prompt them to.

### After the fork

1. Browse is the core surface. For a profiled buyer it is match-ranked with match badges. For an anonymous or un-profiled visitor it is a clean, recent-first grid.
2. Returning, signed-in, already-profiled buyers can bypass the welcome fork and land directly on their personalized browse. Confirm this behavior in Open Questions.
3. Selling is always one click away from anywhere via a persistent "Sell a guitar" action.

## 4. Users and roles

Roles: BUYER, SELLER, DEALER, ADMIN. A single account can both buy and sell.

1. BUYER: builds a profile, browses match-ranked inventory, saves listings, receives match alerts, contacts sellers.
2. SELLER: lists guitars (video required), pays the listing fee, manages their own listings, sees the fair-market feedback on their pricing.
3. DEALER: a seller with multiple listings and a simple multi-listing dashboard. Same rules, more volume.
4. ADMIN: manages the platform, reviews price-cap exceptions and flagged listings, manages the fee, tunes the fair-market settings, and moderates.

Auth is Clerk. Enforce authorization on the backend, not just by hiding UI. A seller must not be able to edit another seller's listing, and price-cap overrides are admin only.

## 5. Data model

Use PostgreSQL via Prisma. This starts from the schema already drafted in earlier sessions. Confirm and refine it before building, then migrate with Prisma migrations. No hand-edited schema in production. Every model gets `id`, `createdAt`, `updatedAt`. Use soft deletes where history matters.

### Core models

1. `User`: clerkId, email, role (BUYER, SELLER, DEALER, ADMIN), createdAt. Relations to profile, listings, saved listings, alerts.
2. `BuyerProfile`: userId, onboardingText (raw), and the AI-extracted fields: genres[], brands[], currentGuitars, dreamGuitar, maxSpend (int, dollars), sophistication (1 to 5). Store both the raw onboarding text and the structured extraction so the profile can be re-derived if the extraction prompt improves.
3. `Listing`: sellerId, brand, model, year, finish, condition (enum), description, price (int, dollars), videoId (Cloudflare Stream), videoThumb, photos, status, city, state, createdAt.
4. Fair-market fields on `Listing` (new): fairMarketLow, fairMarketTypical, fairMarketHigh, priceCap, capStatus (WithinCap, OverCapFlagged, OverCapApproved), estimateModelVersion, estimatedAt. These record what the AI said and what an admin decided.
5. `MatchScore`: buyerId, listingId, score (0 to 100), alertSent boolean, scoredAt. One row per buyer and listing pair.
6. `SavedListing`: buyerId, listingId.
7. `Alert`: buyerId, listingId, channel (SMS, Email), sentAt.
8. `ListingFee`: listingId, amount, stripeSessionId, status (Pending, Paid), paidAt. Records the listing fee payment. This is the only money that moves through the platform at MVP.
9. `PriceReview`: listingId, action (Flagged, Approved, Rejected), adminUserId, note, createdAt. Audit trail for price-cap exceptions.
10. `settings`: admin-editable, single row or key-value. Holds at least: listing fee amount (and any premium tier), the default match-alert threshold (default 85), and the fair-market model name.
11. `audit_log`: actor, entity, entityId, action, before, after, timestamp. Log create, update, delete, status changes, and price-cap decisions on listings, profiles, fees, and settings.

### History requirement

History is not optional. Snapshot the fair-market estimate and the price on the listing at decision time so a later model change does not rewrite what happened. Keep a full `audit_log` so any change is attributable and recoverable.

## 6. Core features by module

### 6.1 Welcome and browse

1. Welcome page with the two-path fork from Section 3.
2. Browse page: match-ranked for profiled buyers, recent-first otherwise. Filter chips (All, brand names from active inventory, Vintage, Under a price threshold, With video). Listing cards show thumbnail, match badge when score is high enough, video badge, title, finish and condition and location, price, save heart.
3. The amber alert bar at the top of browse when a new high-match listing has appeared for this buyer in the last 24 hours. This is the engagement hook.

### 6.2 Buyer onboarding (the moat)

1. Single-page flow, one question at a time, smooth transitions, light canvas.
2. Questions in order: what you play, brands you gravitate toward, what you currently own, what you are chasing next, your dream guitar, the most you would spend if the right one appeared tomorrow.
3. Voice input via the browser Web Speech API with a text fallback. Confirm transcription before moving on.
4. On completion, POST the concatenated answers to the profile-extract endpoint, which calls the Anthropic API and returns structured JSON (genres, brands, currentGuitars, dreamGuitar, maxSpend, sophistication 1 to 5). Store both raw and structured.

### 6.3 Seller listing flow

1. Step 1, video required. Get a Cloudflare Stream direct upload URL, show progress, store videoId on completion. No video, no listing.
2. Step 2, photos to Cloudflare R2 via presigned URLs, up to ten.
3. Step 3, guitar details: brand, model, year, finish, condition, description, price.
4. Step 4, the fair-market check runs on the entered price (Section 2). Show the seller the range. If over cap, show the nudge and let them lower the price or submit for review.
5. Step 5, review and pay the listing fee via Stripe. On the Stripe webhook confirming payment, set the listing active (or pending-review if over cap).

### 6.4 Match scoring and alerts

1. A scoring endpoint called by a cron job, not on every request. It fetches recently active listings and all buyer profiles, scores each pair with the Anthropic API (0 to 100), and upserts `MatchScore`.
2. Price is a hard factor: if a listing price is above a buyer's max spend, the score is capped low.
3. Batch the AI calls (for example groups of ten with `Promise.all`), do not loop one at a time.
4. When a score crosses the alert threshold and no alert has been sent and the buyer has a phone or email on file, send the alert (Twilio SMS or Resend email) and mark it sent.

### 6.5 Listing detail

1. Video player full-width at top. Title, price, condition, location, description, photo grid, seller first name and member-since.
2. Match score shown prominently when the viewer has a profile.
3. Contact-seller action opens a simple message form. No on-platform payment at MVP.

### 6.6 Admin console

1. Price review queue: listings flagged over cap, with the AI range and reason, approve or reject with a note.
2. Settings: listing fee, alert threshold, fair-market model name.
3. Moderation and the audit log surfaced in the UI.

## 7. The AI layer

Three distinct AI jobs, all server-side, all with the key in an env var, all model-configurable and defaulting to a Sonnet-class model:

1. Profile extraction. Onboarding text in, structured buyer profile JSON out. Return JSON only.
2. Match scoring. Listing plus buyer profile in, a single integer 0 to 100 out. Price over max spend forces a low score.
3. Fair-market check. Guitar details in, a fair-market range and soft cap plus a one-line reason out. Never presented as a guaranteed value. Result stored on the listing with the model version.

Keep prompts in a single `lib/anthropic.ts` (or `lib/ai.ts`) module as named templates so they are easy to tune. Never call the Anthropic API from the browser.

## 8. Tech stack, auth, and deployment

Match the stack already established in earlier sessions:

1. Framework: Next.js 14, App Router. SSR for listing pages, client components for interactivity.
2. Database: PostgreSQL via Prisma. DigitalOcean Managed Postgres in production.
3. Auth: Clerk. Roles BUYER, SELLER, DEALER, ADMIN. Enforce authorization on the backend.
4. Image storage: Cloudflare R2. Video: Cloudflare Stream.
5. AI: Anthropic API, Sonnet-class default, configurable by env var.
6. Search: Typesense, self-hosted on a small DigitalOcean droplet.
7. Payments: Stripe, listing fee only.
8. Email: Resend. SMS: Twilio.
9. Hosting: DigitalOcean App Platform, deploy from GitHub, auto-deploy on push. App listens on the platform port.

### Deployment sequence

1. Set all credentials and env vars first: Clerk, database URL, Anthropic key, Cloudflare R2 and Stream, Stripe, Resend, Twilio, Typesense.
2. Deploy a blank scaffold that boots, connects to the database, enforces Clerk auth, and returns a health check.
3. Confirm the pipeline end to end.
4. Then build features in the milestone order below.

## 9. Design and brand standards

Reuse the established design system. Do not regenerate defaults.

1. Brand name: fret. (lowercase, the period is part of the logo).
2. Feel: high-end audio brand meets clean SaaS. Sleek, modern, light. Not a music store. Not Reverb.
3. Palette: canvas `#F8F7F5`, white `#FFFFFF` for cards and nav, near-black `#111110` for text and primary CTA, mid-gray `#6B6860` for secondary text, accent amber `#C17A2A` used sparingly for badges, alerts, the logo dot, and hover. Alert background `#FEF6EC`, border `#F0C88A`, text `#7A4F10`.
4. Type: DM Serif Display for listing titles and display headings, Inter for UI, body, and labels.
5. Components: cards 10px radius, 0.5px border `#e5e4e0`, white. Nav 52px, white, 0.5px bottom border. Filter chips 20px radius pills, active flips to near-black background with white text. Primary buttons near-black background, white text, 6px radius, 13px. No shadows except focus rings. Generous whitespace.
6. Signature elements: the match badge (amber pill, "XX% match", shown when score is high enough) and the amber alert bar at the top of browse.
7. Plain language throughout. No em dashes in UI copy.

## 10. Reporting and admin

1. Admin overview: active listings, listings flagged over cap, listing-fee revenue, buyer profile count, alert volume.
2. Per-listing history: the fair-market estimate at listing time, any price-review decisions, and status changes.
3. Keep exports simple (CSV of listings or fees) for the operator. No accounting integration.

## 11. Build milestones

1. Milestone 0. Repo, Next.js scaffold, database connection, Clerk auth with the four roles, role-based route protection, health check, env and credentials front-loaded, deployed pipeline on DigitalOcean. Prove deploy before features.
2. Milestone 1. Prisma schema as the source of truth. All core models from Section 5, including the fair-market fields on Listing. Run migrations. Seed reference data (condition enum, any brand seed list).
3. Milestone 2. Welcome page with the two-path fork, plus the browse page loading as an unfiltered, recent-first grid. This is the visible front door, stood up early. No personalization yet.
4. Milestone 3. Seller listing flow: video required to Cloudflare Stream, photos to R2, details, and the Stripe listing-fee payment that activates the listing. Fair-market check present as a basic price gate at this stage (store the estimate and cap; flag over-cap).
5. Milestone 4. Buyer onboarding: the one-question-at-a-time flow with voice and text, and the Anthropic profile-extraction endpoint writing a structured BuyerProfile.
6. Milestone 5. Match scoring and alerts: the cron scoring endpoint, match badges on cards, the amber alert bar, and Twilio or Resend alerts above threshold.
7. Milestone 6. Search and personalized browse: Typesense indexing, filter chips, match-ranked ordering for profiled buyers, and the listing detail page with video front and center.
8. Milestone 7. Fair-market engine, deepened: the range-plus-soft-cap logic as a first-class module, the seller nudge UX, the admin price-review queue, price-cap exceptions with an audit trail, and the optional "priced to sell" signal.
9. Milestone 8. Polish and operate: dealer multi-listing dashboard, saved listings, admin settings and overview, CSV exports, and the audit log surfaced in the UI.

## 12. Open questions to confirm before building

1. Returning buyers. Should a signed-in, already-profiled buyer skip the welcome fork and land directly on personalized browse. This brief assumes yes.
2. Listing fee. Confirm the flat fee amount, and whether there is a higher tier for higher-value guitars. Earlier notes floated a standard and a premium tier. Confirm the numbers.
3. Price cap strictness. Confirm the soft-gate behavior: over-cap listings are flagged for admin review rather than auto-rejected, and admins can approve exceptions. Confirm how far over the cap is allowed before a hard block, if any.
4. Fair-market inputs. At MVP the estimate uses brand, model, year, finish, and condition from the seller. Confirm whether that is enough, or whether we also feed recent comps from our own sold or delisted history once we have data.
5. Match alert threshold. Default is 85. Confirm.
6. Sophistication use. The profile stores a 1 to 5 sophistication signal. Confirm how much it should influence match scoring versus just personalizing copy.
7. Transaction handling. Confirm that the actual guitar sale stays off-platform at MVP and escrow is a later phase, so no buyer payment flow is built now.
