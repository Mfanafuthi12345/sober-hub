# Sober Hub

Sober Hub uses Supabase Auth and Postgres for accounts, email confirmation, profiles, check-ins, community posts, support requests, mentor requests, and membership requests. The React/Vite frontend is configured for deployment to Vercel.

## Connect a Supabase project

1. Create a Supabase project.
2. In Supabase **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) to create the app tables, profile trigger, and row-level security policies.
3. In **Authentication → URL Configuration**, set the Site URL to your local or Vercel site and add these redirect URLs:
   - `http://localhost:5173/verify-email`
   - `https://YOUR-VERCEL-DOMAIN/verify-email`
4. In **Authentication → Providers → Email**, enable email confirmations.
5. Configure a custom SMTP provider under **Authentication → SMTP Settings**. Supabase's built-in email sender is limited and is not intended for production delivery. Verify your sender domain and configure the provider's SMTP host, port, username, password, and sender address in the Supabase dashboard.
6. Copy `frontend/.env.example` to `frontend/.env.local` and fill in the Supabase project's Project URL and publishable/anon key. Never put a Supabase `service_role` key in frontend or Vercel variables.

## Run the frontend locally

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Open <http://localhost:5173>.

## Deploy to Vercel

Import this repository in Vercel and set the project Root Directory to `frontend`. Vercel reads `frontend/vercel.json`; its build output is `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables for Preview and Production, then deploy. Add the deployed domain's `/verify-email` URL to Supabase Auth's redirect allow list.

Membership selection records a request; it does not process payment or activate membership. Online card payment requires a payment provider and a server-side integration. Never collect or store raw card details in this frontend.
