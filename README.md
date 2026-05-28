# UnivFind — College Discovery Platform

A full-stack college discovery and decision-making platform built with Next.js 14, PostgreSQL, Prisma ORM, and TailwindCSS.

## Features

- **College Listing + Search** — Searchable listings with filters by type (IIT/NIT/IIM/Private/Deemed), state, and sorting (ranking, rating, placement, fees). Server-side pagination.
- **College Detail Page** — Tabbed view with overview, courses, placement stats with visual bar charts, and student reviews with pros/cons.
- **Compare Colleges** — Side-by-side comparison of 2–3 colleges with color-coded best/worst in each metric. Persisted via localStorage.
- **Authentication + Saved Items** — JWT-based auth with HTTP-only cookies. Sign up, login, save/unsave colleges, write reviews.
- **Review System** — Authenticated users can submit star ratings, pros/cons, batch year. College rating auto-recalculates.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 App Router, React 18, TypeScript |
| Styling | TailwindCSS, Custom CSS animations |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs, HTTP-only cookies |
| Validation | Zod |
| Deploy | Vercel (frontend) + Neon/Railway (PostgreSQL) |

## Project Structure

```
univfind/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # 10 colleges with full data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── colleges/
│   │   │   │   ├── route.ts           # GET with filters/pagination
│   │   │   │   └── [id]/route.ts      # GET college detail
│   │   │   ├── saved/route.ts         # GET saved, POST toggle
│   │   │   ├── compare/route.ts       # GET compare by IDs
│   │   │   └── reviews/route.ts       # POST submit review
│   │   ├── colleges/
│   │   │   ├── page.tsx               # Listing page
│   │   │   └── [id]/page.tsx          # Detail page
│   │   ├── compare/page.tsx           # Compare page
│   │   ├── saved/page.tsx             # Saved colleges page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page
│   │   └── globals.css
│   ├── components/
│   │   ├── AuthProvider.tsx            # Auth context + compare state
│   │   ├── Navbar.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CollegeCard.tsx
│   │   ├── CompareBanner.tsx           # Floating compare bar
│   │   └── Toast.tsx
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma singleton
│   │   ├── auth.ts                     # JWT helpers
│   │   └── api.ts                      # Response helpers
│   └── types/index.ts
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local, Neon, Railway, or Supabase)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your-random-secret-at-least-32-chars"
```

### 3. Push schema to database
```bash
npm run db:push
```

### 4. Seed with sample data
```bash
npm run db:seed
```

This creates 10 colleges (IITs, NITs, IIMs, Private, Deemed) with courses, placement data, recruiters, and reviews.

**Demo login:** `demo@univfind.in` / `password123`

### 5. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel + Neon (Recommended)

1. **Create Neon database** at [neon.tech](https://neon.tech) (free tier works)
2. Copy the connection string

3. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — a strong random secret

5. **Run migrations on production:**
```bash
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npm run db:seed
```

### Alternative: Railway

1. Create a PostgreSQL service on [railway.app](https://railway.app)
2. Deploy app to Railway
3. Set environment variables
4. Run `npm run db:push && npm run db:seed` in Railway shell

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register `{ name, email, password }` |
| POST | `/api/auth/login` | Login `{ email, password }` |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get current user |

### Colleges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/colleges` | List with `?search=&type=&state=&sort=&page=&limit=` |
| GET | `/api/colleges/:id` | College detail with courses, reviews, placements |

### Saved
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saved` | Get saved colleges (auth required) |
| POST | `/api/saved` | Toggle save `{ collegeId }` (auth required) |

### Compare
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compare` | Compare `?ids=id1&ids=id2&ids=id3` |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit review `{ collegeId, rating, text, pros, cons, batch }` (auth required) |

## Database Schema

Key models:
- **College** — core data (name, type, fees, placement, ranking, etc.)
- **Course** — belongs to College
- **PlacementStat** — sector breakdown per college
- **Recruiter** — company list per college
- **Review** — belongs to User + College, updates college.rating
- **SavedCollege** — junction table User ↔ College (unique constraint)
- **User** — bcrypt-hashed passwords, JWT auth

## Architecture Decisions

1. **JWT in HTTP-only cookies** — No localStorage token storage, prevents XSS attacks
2. **Prisma singleton pattern** — Prevents connection pool exhaustion in dev hot-reload
3. **Server-side filtering** — All search/filter logic in PostgreSQL, not client-side
4. **Optimistic UI** — Save/compare state updates immediately before API confirmation
5. **Zod validation** — All API inputs validated with proper error messages
6. **Auto-recalculate rating** — College rating updates on each new review submission
7. **Compare list in localStorage** — Persists across page reloads without requiring auth

## Seeded Colleges

| College | Type | Ranking |
|---------|------|---------|
| IIT Bombay | IIT | #1 |
| IIT Delhi | IIT | #2 |
| IIT Madras | IIT | #3 |
| IIT Kanpur | IIT | #4 |
| BITS Pilani | Private | #8 |
| NIT Trichy | NIT | #10 |
| Jadavpur University | Deemed | #12 |
| IIM Ahmedabad | IIM | #1 (MBA) |
| Delhi University | Deemed | #15 |
| VIT Vellore | Private | #20 |
