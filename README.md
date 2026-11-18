# Sommaire — AI-Powered PDF Summarization SaaS

> Drop a PDF. Get a structured, emoji-annotated summary in seconds. No fluff, no walls of text.

Sommaire is a production-grade SaaS application that extracts, processes, and transforms PDF documents into structured, scannable summaries using **Google Gemini 2.5 Flash** as the primary inference engine, with a graceful fallback to **OpenAI GPT-3.5-Turbo**. Built on the **Next.js 15 App Router** with React Server Components throughout, the entire pipeline from file upload to summary delivery lives in a single edge-compatible deployment.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Key Implementation Details](#key-implementation-details)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Landing /   │    │  Upload Page │    │  Summary Viewer  │  │
│  │  Marketing   │    │  (drag+drop) │    │  (paginated)     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────────┘  │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 15 APP ROUTER                       │
│                                                                 │
│  ┌──────────────────────┐    ┌────────────────────────────────┐ │
│  │   Clerk Middleware   │    │    Route Group: (logged-in)    │ │
│  │   (auth + protect)   │    │    /dashboard /upload /summary │ │
│  └──────────────────────┘    └────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐    ┌────────────────────────────────┐ │
│  │  Server Actions       │    │  API Routes                    │ │
│  │  upload_action.ts     │    │  POST /api/payments (webhook)  │ │
│  │  summary-actions.ts   │    │  POST /api/uploadthing         │ │
│  └──────────────────────┘    └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                  │                    │
          ▼                  ▼                    ▼
   ┌────────────┐   ┌─────────────────┐   ┌────────────────┐
   │  UploadThing│   │  Gemini 2.5     │   │  Stripe        │
   │  (CDN +    │   │  Flash / OpenAI │   │  Webhooks      │
   │  file host)│   │  GPT-3.5-Turbo  │   │                │
   └────────────┘   └─────────────────┘   └────────────────┘
          │                  │
          └──────────┬───────┘
                     ▼
            ┌─────────────────┐
            │  Neon Postgres  │
            │  (serverless)   │
            └─────────────────┘
```

The application deliberately avoids a separate backend service. Everything runs inside Next.js — Server Actions handle mutation, RSCs handle data fetching, and API routes handle third-party webhooks. This keeps cold-start latency low and eliminates network hops between "frontend" and "backend".

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | RSC, Server Actions, edge-compatible routing |
| **Language** | TypeScript 5 | End-to-end type safety across the full stack |
| **Auth** | Clerk | Drop-in auth with JWTs, session management, and middleware integration |
| **AI — Primary** | Google Gemini 2.5 Flash (`@google/generative-ai`) | Fast, cost-efficient, 2048-token structured output |
| **AI — Fallback** | OpenAI GPT-3.5-Turbo | Rate-limit failover; same prompt interface |
| **PDF Parsing** | LangChain `PDFLoader` + `pdf-parse` | Streams remote URL → blob → text extraction across all pages |
| **File Storage** | UploadThing | Handles multipart upload, CDN hosting, and signed server callbacks |
| **Database** | Neon Postgres (serverless driver) | Serverless-friendly connection pooling, no persistent TCP |
| **Payments** | Stripe (Checkout + Webhooks) | Hosted checkout, idempotent webhook handling |
| **UI** | Tailwind CSS v4 + Radix UI + Framer Motion | Utility-first styles, accessible primitives, scroll-triggered animations |
| **Notifications** | Sonner | Non-blocking toast notifications throughout the upload pipeline |
| **Deployment** | Vercel | Zero-config Next.js hosting with edge functions |

---

## Data Flow

The entire summarization pipeline is orchestrated through a single Server Action (`generatePdfSummary`) triggered client-side after UploadThing confirms the file is stored.

```
User selects PDF
      │
      ▼
[Client] Zod validation (≤20MB, application/pdf MIME type)
      │
      ▼
[UploadThing] startUpload() → file uploaded to CDN, signed URL returned
      │
      ▼
[Server Action] generatePdfSummary(uploadResponse)
      │
      ├── fetchAndExtractPdfText(pdfUrl)
      │       └── fetch(url) → blob → arrayBuffer → LangChain PDFLoader
      │               └── doc.pageContent joined across all pages
      │
      ├── generateSummaryFromGemini(pdfText)
      │       └── gemini-2.5-flash with structured markdown prompt
      │               └── on RATE_LIMIT_EXCEEDED → retry Gemini (extensible to OpenAI)
      │
      └── returns { title, summary }

[Server Action] storePdfSummaryAction({ fileUrl, summary, title, fileName })
      │
      ├── auth() → Clerk userId
      └── INSERT INTO pdf_summaries → returns { id }

[Client] router.push(`/summaries/${id}`)
      │
      ▼
[RSC] SummaryViewer fetches by id, renders paginated sections
```

### Stripe Webhook Flow

```
User completes Stripe Checkout
      │
      ▼
Stripe POST /api/payments
      │
      ├── stripe.webhooks.constructEvent() — signature verified
      ├── checkout.session.completed
      │       ├── retrieve session with line_items expanded
      │       ├── createOrUpdateUser() — upsert into users table
      │       └── createPayment() — INSERT into payments table
      └── customer.subscription.deleted — subscription lifecycle hook
```

---

## Database Schema

Three tables, fully normalized with UUID primary keys and auto-updating `updated_at` triggers.

```sql
-- Users created/updated by Stripe webhook, not Clerk
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    full_name   VARCHAR(255),
    customer_id VARCHAR(255) UNIQUE,   -- Stripe customer ID
    price_id    VARCHAR(255),          -- Active Stripe price tier
    status      VARCHAR(50) DEFAULT 'inactive',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One row per processed PDF, scoped to Clerk userId
CREATE TABLE pdf_summaries (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           VARCHAR(255) NOT NULL,    -- Clerk userId
    original_file_url TEXT NOT NULL,            -- UploadThing CDN URL
    summary_text      TEXT NOT NULL,            -- Raw markdown from AI
    title             TEXT,
    file_name         TEXT,
    status            VARCHAR(50) DEFAULT 'completed',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Payment audit trail, FK on user email
CREATE TABLE payments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount            INTEGER NOT NULL,         -- In cents
    status            VARCHAR(50) NOT NULL,
    stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
    price_id          VARCHAR(255) NOT NULL,
    user_email        VARCHAR(255) NOT NULL REFERENCES users(email),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note on identity split:** Auth identity lives in Clerk (userId string). Billing identity lives in Postgres (email + Stripe customer_id). The `pdf_summaries` table uses `user_id` (Clerk) as a foreign key, while `payments` uses `user_email` (Stripe customer). This is an intentional design boundary — auth and billing are decoupled.

---

## Project Structure

```
sommaire/
├── app/
│   ├── (logged-in)/                  # Route group — all routes require Clerk session
│   │   ├── dashboard/                # RSC: fetches all summaries for current user
│   │   ├── summaries/[id]/           # RSC: fetches single summary by ID
│   │   └── upload/                   # Client page: drag+drop → Server Action pipeline
│   ├── api/
│   │   ├── payments/route.ts         # Stripe webhook handler
│   │   └── uploadthing/route.ts      # UploadThing file router
│   ├── sign-in/ sign-up/             # Clerk-hosted auth pages
│   ├── layout.tsx                    # Root layout: ClerkProvider + Header + Footer + Toaster
│   └── page.tsx                      # Public landing page
│
├── actions/
│   ├── upload_action.ts              # generatePdfSummary + storePdfSummaryAction
│   └── summary-actions.ts           # deleteSummaryAction
│
├── components/
│   ├── common/                       # Header, Footer, BgGradient, MotionWrapper
│   ├── home/                         # Hero, HowItWorks, Demo, Pricing, CTA sections
│   ├── summaries/                    # SummaryCard, SummaryViewer, ContentSection,
│   │                                 # NavigationControls, ProgressBar, DeleteButton
│   └── upload/                       # UploadForm, UploadFormInput, LoadingSkeleton
│
├── lib/
│   ├── db.ts                         # Neon serverless connection factory
│   ├── geminiai.ts                   # Gemini 2.5 Flash integration
│   ├── openai.ts                     # GPT-3.5-Turbo integration (fallback)
│   ├── langchain.ts                  # PDF fetch + text extraction via PDFLoader
│   ├── payments.ts                   # Stripe checkout session + payment persistence
│   ├── summaries.ts                  # getSummaries(), getSummaryById()
│   └── utils.ts                      # cn() helper (clsx + tailwind-merge)
│
├── utils/
│   ├── constants.ts                  # Framer Motion shared variants
│   ├── format-utils.ts               # formatFileNameAsTitle()
│   ├── prompt.ts                     # SUMMARY_SYSTEM_PROMPT (markdown template)
│   ├── summary-helper.ts             # parseSection(), parsePoint(), parseEmojiPoint()
│   └── uploadthing.ts                # useUploadThing hook export
│
├── middleware.ts                     # Clerk middleware: protects /dashboard, /summaries, /upload
├── schema.sql                        # Full Postgres DDL with triggers
└── vercel.json                       # Deployment config
```

---

## Key Implementation Details

### AI Prompt Engineering

The summary prompt in `utils/prompt.ts` is a structured template that instructs the model to act as a "social media content expert" — deliberately biased toward scannable, emoji-annotated output over dense prose. Every section (Document Details, Key Highlights, Why It Matters, Pro Tips, Key Terms, Bottom Line) is explicitly templated to ensure consistent markdown structure across all document types.

```
SUMMARY_SYSTEM_PROMPT → enforces:
  - Section headers with emojis
  - All points prefixed with "- <emoji>"
  - No numbered lists (prevents parser edge cases)
  - Consistent format across Gemini AND OpenAI responses
```

The parsed summary is then split by `parseSection()` into discrete sections, and each section's points are extracted and emoji-tokenized by `parseEmojiPoint()` for the paginated viewer UI.

### Rate-Limit Fallback

The primary AI call goes to Gemini. If `RATE_LIMIT_EXCEEDED` is thrown (mapped from OpenAI's HTTP 429), the action retries. The structure is designed to swap in OpenAI as a secondary provider without changing the caller — both `generateSummaryFromGemini` and `generateSummaryFromOpenAI` share an identical function signature and produce identical output format.

### Clerk + Next.js Middleware

Route protection is handled at the middleware layer, not per-page. `createRouteMatcher` locks `/dashboard`, `/summaries`, and `/upload` — unauthenticated requests are intercepted before RSC rendering begins, avoiding any server-side data fetches for unauthorized users.

### Serverless Database Connection

`lib/db.ts` uses `@neondatabase/serverless` which communicates over HTTP/WebSocket rather than a persistent TCP connection. This is essential for Vercel's serverless environment where connection pool exhaustion is a real failure mode with traditional Postgres drivers.

### UploadThing File Callback

After a file is uploaded, UploadThing calls back to the Next.js server with `{ userId, fileUrl, fileName }` via a signed request. The server action then uses this `fileUrl` to fetch the raw PDF bytes — the client never has to re-transmit the file or hold it in memory.

---

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Providers
GEMINI_API_KEY=
OPENAI_API_KEY=

# Database
DATABASE_URL=           # Neon connection string (pooled)

# File Uploads
UPLOADTHING_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=  # From `stripe listen --forward-to localhost:3000/api/payments`
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application
- A [Stripe](https://stripe.com) account with a product and two prices (Basic / Pro)
- An [UploadThing](https://uploadthing.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### Installation

```bash
git clone https://github.com/Deep6908/Sommaire-AI-PDF-Summarizer-SaaS-Application.git
cd Sommaire-AI-PDF-Summarizer-SaaS-Application
npm install
```

### Database Setup

Run the schema against your Neon database:

```bash
psql $DATABASE_URL -f schema.sql
```

### Local Development

```bash
# Start the dev server with Turbopack
npm run dev

# In a separate terminal, forward Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/payments
```

The app will be available at `http://localhost:3000`.

---

## Deployment

The project includes a `vercel.json` for zero-config deployment to Vercel.

```bash
vercel --prod
```

After deploying:
1. Update your Stripe webhook endpoint to `https://<your-domain>/api/payments`
2. Add `STRIPE_WEBHOOK_SECRET` from the new Stripe webhook dashboard entry to your Vercel environment variables
3. Add your production domain to Clerk's allowed redirect URLs

---

## Pricing

| Plan | Price | Summaries |
|---|---|---|
| Basic | $1 / month | 5 PDFs |
| Pro | $10 / month | Unlimited |

Plan enforcement is handled server-side based on the `price_id` stored in the `users` table after a successful Stripe checkout.

---

<div align="center">
  <sub>Built with Next.js 15, Gemini 2.5 Flash, and Neon Postgres.</sub>
</div>
