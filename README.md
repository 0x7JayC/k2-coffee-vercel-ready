# K2 Coffee Ministry App

Premium Yunnan Arabica coffee e-commerce platform where every purchase supports a customer-chosen ministry partner.

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Express + tRPC (type-safe API)
- **Database:** PostgreSQL via Supabase + Drizzle ORM
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Payments:** Stripe Checkout
- **Image Storage:** Supabase Storage
- **Email:** Resend
- **Deployment:** Vercel

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd k2-coffee-ministry-app
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database → Connection string** and copy the URI → `DATABASE_URL`
4. Go to **Storage** and create a bucket called `images` (set it to **Public**)
5. (Optional) Go to **Auth → Providers** and enable Google OAuth

### 3. Set Up Stripe

1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your Secret Key → `STRIPE_SECRET_KEY`
3. (Optional for webhooks) Set up a webhook endpoint → `STRIPE_WEBHOOK_SECRET`

### 4. Set Up Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key → `RESEND_API_KEY`
3. For testing, use `EMAIL_FROM=K2 Coffee <onboarding@resend.dev>`
4. For production, verify your domain (k2coffee.xyz) in Resend

### 5. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values from steps 2-4
```

### 6. Set Up Database

```bash
# Push the schema to your Supabase database
npm run db:push

# Seed with demo products and ministries
npm run db:seed
```

### 7. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Admin Access

Set `ADMIN_EMAIL` in your `.env` to your email address. When you sign in with that email, you'll automatically get admin privileges, giving you access to `/admin` for managing products, ministries, and orders.

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub Integration

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Set **Build Command:** `npm run build`
5. Set **Output Directory:** `dist/public`
6. Deploy

### Post-Deploy

1. Update `VITE_FRONTEND_URL` to your Vercel URL (e.g., `https://k2coffee.vercel.app`)
2. Update Stripe webhook endpoint to `https://your-domain.vercel.app/api/stripe/webhook`
3. Update Supabase Auth redirect URLs in **Auth → URL Configuration**

---

## Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── _core/hooks/     # useAuth hook (Supabase)
│   │   ├── components/      # UI components + admin panel
│   │   ├── contexts/        # Theme context
│   │   ├── lib/             # trpc + supabase clients
│   │   └── pages/           # Route pages
│   └── public/              # Static assets
├── server/                  # Express + tRPC backend
│   ├── _core/               # Auth, email, checkout, Supabase
│   ├── routers/             # Checkout, images, notifications
│   ├── db.ts                # Database queries (Drizzle)
│   └── routers.ts           # Main tRPC router
├── drizzle/                 # Database schema + migrations
├── shared/                  # Shared types + constants
├── scripts/                 # Seed script
└── .env.example             # Environment template
```

---

## Key Differences from Manus Version

| Feature | Manus Version | This Version |
|---------|--------------|--------------|
| Auth | Manus OAuth SDK | Supabase Auth |
| Database | MySQL (mysql2) | PostgreSQL (Supabase) |
| File Storage | Manus Forge Proxy | Supabase Storage |
| Email | Manus Forge API | Resend |
| Notifications | Manus WebDev Service | Removed (use email) |
| AI/LLM | Manus Forge LLM | Removed |
| Vite Plugins | manus-runtime, jsx-loc, debug-collector | None (clean) |
| Login UI | ManusDialog ("Login with Manus") | Custom Auth page |

---

## License

MIT
