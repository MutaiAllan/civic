# CAES — Civic AI Engagement System

A production-ready full-stack Next.js application for AI-driven citizen complaint management.

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18        |
| Styling     | Tailwind CSS (flat / neutral palette)    |
| Database    | Supabase PostgreSQL + Prisma ORM         |
| Auth        | Supabase Magic Link (passwordless)       |
| NLP         | Mock API (plug-in ready for Python/NLP)  |

---

## Project Structure

```
caes/
├── prisma/
│   ├── schema.prisma          # DB schema (User, Complaint enums)
│   ├── migration.sql          # RLS policies — run in Supabase SQL editor
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── middleware.ts           # Auth guard for all routes
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root redirect (→ /citizen or /admin)
│   │   ├── login/page.tsx      # Magic-link login
│   │   ├── api/
│   │   │   ├── complaints/
│   │   │   │   ├── route.ts          # GET (list) · POST (create)
│   │   │   │   └── [id]/route.ts     # PATCH (status) · DELETE
│   │   │   ├── analytics/route.ts   # GET aggregated stats (admin)
│   │   │   └── auth/callback/route.ts
│   │   ├── citizen/
│   │   │   ├── layout.tsx            # Auth-protected layout + sidebar
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── new/page.tsx          # Multi-step complaint form
│   │   │   └── complaints/page.tsx   # My Complaints + timeline tracker
│   │   └── admin/
│   │       ├── layout.tsx            # Admin-only layout
│   │       ├── page.tsx              # Overview (stats + charts)
│   │       ├── complaints/page.tsx   # Searchable table + status editor
│   │       └── analytics/page.tsx   # Full analytics + NLP schema
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Sidebar.tsx           # Role-aware navigation
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SentimentBadge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Toast.tsx + useToast()
│   │   │   └── PageHeader.tsx
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.tsx  # Stats + recent + resolution bar
│   │   │   ├── ComplaintForm.tsx     # 3-step form + toast + spinner
│   │   │   └── Chatbot.tsx           # Fixed bottom-right guidance bot
│   │   └── admin/
│   │       └── AdminDashboard.tsx    # Tabbed: Overview | Complaints | Analytics
│   └── lib/
│       ├── prisma.ts                 # Prisma singleton
│       ├── supabase.ts              # Browser + server clients
│       ├── department-map.ts        # Category → Department routing
│       ├── mock-sentiment.ts        # NLP stub (swap for real endpoint)
│       ├── utils.ts                 # cn(), formatDate(), truncate()
│       └── hooks/
│           ├── useComplaints.ts      # CRUD hook for complaints
│           └── useAnalytics.ts      # Analytics fetch hook
```

---

## Quick Start

### 1. Clone & install
```bash
git clone <repo-url> caes
cd caes
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Fill in your Supabase project URL, anon key, and database URLs:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL="postgresql://postgres.xxxx:password@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:password@pooler.supabase.com:5432/postgres"
NLP_API_URL=http://localhost:8000/analyze
```

### 3. Push schema
```bash
npm run db:generate
npm run db:push
```

### 4. Apply RLS policies
Copy `prisma/migration.sql` and run it in your **Supabase SQL Editor**.

### 5. Seed demo data (optional)
```bash
npm run db:seed
```

### 6. Start development
```bash
npm run dev
# → http://localhost:3000
```

---

## Plugging in the Python NLP API

Edit `src/lib/mock-sentiment.ts`. Replace the mock block:

```ts
// ─── swap this ───
const res = await fetch(process.env.NLP_API_URL!, {
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify({ id: complaintId, text }),
});
return res.json();
```

Your Python endpoint must return:
```json
{
  "complaint_id":    "uuid",
  "sentiment_label": "NEGATIVE",
  "sentiment_score": 0.84,
  "category":        "Infrastructure",
  "department":      "Roads & Transport",
  "keywords":        ["pothole", "road", "accident"]
}
```

Sentiment is applied **asynchronously** (fire-and-forget) so complaints are created immediately and updated once NLP responds.

---

## Granting Admin Access

Run this in the Supabase SQL editor (or Table Editor):
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
```

---

## API Reference

| Method | Path                      | Auth         | Description                       |
|--------|---------------------------|--------------|-----------------------------------|
| GET    | `/api/complaints`         | Any user     | List complaints (scoped by role)  |
| POST   | `/api/complaints`         | Citizen      | Create complaint + trigger NLP    |
| PATCH  | `/api/complaints/:id`     | Admin only   | Update status                     |
| DELETE | `/api/complaints/:id`     | Admin only   | Delete complaint                  |
| GET    | `/api/analytics`          | Admin only   | Aggregated stats by status/sentiment/category |
| GET    | `/api/auth/callback`      | Public       | Supabase OAuth callback           |

---

## Key Design Decisions

- **Flat, neutral UI** — `#FFFFFF` base, `slate-*` palette throughout, no gradients
- **Async NLP** — complaints are stored immediately; sentiment is patched asynchronously so the UI never blocks
- **RLS on Supabase** — citizens can only see their own rows at the database level
- **Middleware auth guard** — all routes except `/login` and `/api/auth/*` require a valid session
- **Server Components by default** — data fetching happens on the server; Client Components only where interactivity is needed
