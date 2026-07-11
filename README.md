# BasitBiOyun

Football data UI with **Smart Market Value** — React + Vite + Tailwind, EN/TR.

**Repo:** https://github.com/yunusemreyilmaz93-pixel/basitbioyun

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

1. Open [vercel.com/new](https://vercel.com/new)
2. Import `yunusemreyilmaz93-pixel/basitbioyun`
3. Framework: **Vite** (or leave auto) — `vercel.json` is already set
4. Deploy → every push to `main` redeploys

CLI (optional):

```bash
npx vercel login
npx vercel --yes
npx vercel --prod --yes
```

## Supabase (real data)

### 1. Create project

1. [supabase.com](https://supabase.com) → New project
2. **SQL** → paste & run `supabase/migrations/001_init.sql`
3. **Settings → API** copy URL + `anon` key (+ `service_role` for seeding only)

### 2. Env

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_MODE=supabase
```

For Vercel: Project → Settings → Environment Variables (same keys).

### 3. Seed from current mock datasets

```bash
npm run seed:export
# then with service role (never expose in frontend):
# PowerShell:
$env:SUPABASE_URL="https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
npm run seed:supabase
```

Seed JSON lives in `supabase/seed/` (generated; not required in git once uploaded).

### 4. Data modes

| `VITE_DATA_MODE` | Behavior |
|------------------|----------|
| `mock` (default) | In-repo mock modules (`src/*Data.js`) |
| `supabase` | Client reads tables when URL + anon key set |

UI still ships with mock fallback until Supabase is configured and seeded. Core loaders live in `src/lib/supabase.js` + `src/lib/supabaseData.js`.

## Stack

- React 19, Vite 6, Tailwind 4
- i18n EN/TR (`src/i18n`)
- Schema + normalizers (`src/schema.js`, `src/dataLayer.js`)
