# Cuenta Clara - your books on WhatsApp

WhatsApp-native bookkeeping for LATAM micro-businesses, including barbershops, corner stores, and small shops. Send a voice note in Spanish describing sales and expenses, and Cuenta Clara extracts structured transactions, confirms them through interactive WhatsApp cards, and sends a daily P&L summary at 8 pm.

Built for the **Vercel Zero to Agent hackathon**, ChatSDK Agents track.

## How it works

1. **Voice or text** - the owner sends a WhatsApp message, such as _"I sold 3 haircuts at 200 each"_
2. **AI extraction** - Claude Sonnet 4.6 via AI Gateway parses the message into a structured transaction with type, items, total, and confidence
3. **Confirmation card** - Cuenta Clara replies with an interactive card showing the itemized transaction, with **Delete** and **View summary** buttons
4. **Daily close** - at 8 pm Tegucigalpa, a cron job sends each user a P&L summary card with sales, expenses, and margin

```
┌─────────────┐    ┌────────────┐    ┌──────────┐    ┌──────────────┐
│  WhatsApp   │───▶│   Kapso    │───▶│  Cuenta  │───▶│   Neon DB    │
│  voice/text │    │ transcribe │    │ extract  │    │  persist tx  │
└─────────────┘    └────────────┘    └──────────┘    └──────────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Confirmation │
                                   │    Card       │
                                   └──────────────┘
```

## Stack

| Layer     | Technology                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router) + TypeScript                                                                                                   |
| Chat      | [Chat SDK](https://chat-sdk.dev) + [@luicho/kapso-chat-sdk](https://www.npmjs.com/package/@luicho/kapso-chat-sdk) (WhatsApp via Kapso) |
| AI        | [AI SDK 6](https://ai-sdk.dev) + Vercel AI Gateway, Claude Sonnet 4.6                                                                  |
| Database  | Postgres (Supabase) via Drizzle ORM                                                                                                    |
| State     | Redis (Vercel KV / Upstash) via `@chat-adapter/state-redis`                                                                            |
| Cron      | Vercel Cron (`0 2 * * *` = 20:00 Tegucigalpa)                                                                                          |
| Linter    | Biome                                                                                                                                  |
| Deploy    | Vercel                                                                                                                                 |

## Project structure

```
app/
├── api/
│   ├── cron/daily-summary/route.ts   # 8pm P&L summary cron
│   └── webhooks/whatsapp/route.ts    # WhatsApp webhook endpoint
├── globals.css                        # Landing page styles
├── layout.tsx                         # Root layout (es-HN)
└── page.tsx                           # Landing page
lib/
├── db/
│   ├── index.ts                       # Supabase + Drizzle connection
│   └── schema.ts                      # users, transactions tables
├── accounting.ts                      # DB queries, P&L, formatting
├── env.ts                             # Zod env validation + type augmentation
├── extraction.ts                      # AI extraction (Zod + Claude)
└── cuenta-clara-bot.ts                # Chat SDK bot (Redis state), handlers, cards
drizzle/                               # Generated SQL migrations
scripts/
└── seed.ts                            # Seed demo user
```

## Message types

| Input                   | Handler                                             |
| ----------------------- | --------------------------------------------------- |
| Voice note              | Kapso transcribes → AI extracts → confirmation card |
| Text message            | AI extracts → confirmation card                     |
| `/resumen` or `resumen` | Returns today's P&L card                            |
| Button: Delete          | Soft-deletes the transaction                        |
| Button: View summary    | Returns today's P&L card                            |

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- A [Neon](https://neon.tech) Postgres database
- Redis (e.g. [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or [Upstash](https://upstash.com))
- A [Kapso](https://kapso.ai) account with a connected WhatsApp number
- A [Vercel](https://vercel.com) account (for AI Gateway + deploy)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, KV_URL, KAPSO_API_KEY, KAPSO_PHONE_NUMBER_ID, etc.

# Generate and run database migration
pnpm db:generate
pnpm db:migrate

# Seed demo user
pnpm db:seed

# Start dev server
pnpm dev
```

## Available scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start Next.js dev server     |
| `pnpm build`       | Production build             |
| `pnpm typecheck`   | Run TypeScript type checking |
| `pnpm lint`        | Run Biome linter             |
| `pnpm format`      | Auto-format with Biome       |
| `pnpm db:generate` | Generate Drizzle migrations  |
| `pnpm db:migrate`  | Run pending migrations       |
| `pnpm db:push`     | Push schema directly (dev)   |
| `pnpm db:studio`   | Open Drizzle Studio          |
| `pnpm db:seed`     | Seed demo user               |

## Key design decisions

1. **`generateText` + `Output.object()` with Zod** - voice transcripts are messy; Zod `.refine()` validates item totals match, and a 2-attempt retry loop handles transient failures
2. **Idempotency on `source_message_id`** - Kapso may redeliver; dedupe at both app-level (check before insert) and DB-level (`UNIQUE` + `onConflictDoNothing`)
3. **Confirmation card as the hero** - voice in, roughly 1.5s, clean interactive card. That's the demo moment

## License

MIT
