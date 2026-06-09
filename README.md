# CAES — Civic AI-Driven Engagement System

A modern, minimalist platform for civic complaint management powered by Next.js 15, Supabase, and AI sentiment analysis.

## 🚀 Setup Instructions for New Machines

Follow these steps to get the project running on a fresh environment.

### 1. Prerequisites
- **Node.js** (v18.17 or higher)
- **npm** or **pnpm**
- A **Supabase** project (free tier works)
- A **Hugging Face** API Token (for sentiment analysis)

### 2. Clone and Install
```bash
cd civic
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and fill in your credentials:

```env
# Database Connections (from Supabase > Connect > ORM)
DATABASE_URL="postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[REF]:[PW]@aws-0-[REGION].pooler.supabase.com:5432/postgres"


NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"

# Supabase Auth (from Supabase > Project Settings > API Keys > Legacy anon)
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# AI Analysis (from Hugging Face > Settings > Tokens)
HF_API_TOKEN="your-hf-token"
```

### 4. Database Initialization
Sync the Prisma schema with your Supabase PostgreSQL instance:

```bash
# Push the schema to the database
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

### 5. Start Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔑 Admin Access
By default, all new users are registered as `CITIZEN`. To promote yourself to an `ADMIN`:

1.  Log in to the app once via Magic Link.
2.  Open **Prisma Studio**: `npx prisma studio`.
3.  Find your user record in the `User` table.
4.  Change the `role` from `CITIZEN` to `ADMIN` and save.
5.  Refresh your browser.

---

## 🏗️ Architecture & Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase SSR (Magic Link)
- **Styling**: Tailwind CSS v4 (Neutral/Minimalist Design)
- **AI**: Hugging Face Inference API (`nlptown/bert-base-multilingual-uncased-sentiment`)

## 📁 Key Routes
- `/citizen`: Dashboard for submitting and tracking complaints.
- `/admin`: Analytics dashboard and complaint moderation (Admin only).
- `/api/complaints`: CRUD operations for reports.
- `/api/sentiment`: AI processing endpoint.
