# ModernShowcase2 Local Setup (Neon)

## Prerequisites
- Node.js 20+
- Access to the Neon database URL (already placed in `.env`)

## Installation & Database
1. Install dependencies: `npm install`
2. Ensure environment variables are set. `.env` is prefilled with the provided Neon `DATABASE_URL`; adjust secrets like `JWT_SECRET`/`SESSION_SECRET` if you want your own values. Reference `.env.example` for all available keys.
3. Database is already synced to the provided Neon instance via `migrations/0001_init.sql`. If you need to reapply to a fresh database, run that SQL file or `npm run db:push` (choose “create table” for each prompt because the Neon instance also has legacy tables like `comments`/`users`).

## Running
- Development (Vite + API on port 5000): `npm run dev`
- Production build: `npm run build` then `npm start`

## Admin Access
- The default admin password hash corresponds to `Kopia15341534!`. Change `ADMIN_PASSWORD_HASH` in `.env` if you need a different password.
