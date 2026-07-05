# Stencil

Stencil is a Next.js App Router + Supabase personal prompt-management library, ported from the two prototype files in `../stencil_prototype`.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` if you want the delete-account flow to remove the Supabase Auth user.
4. Add `OPENAI_API_KEY` and `OPENAI_MODEL` for AI improvements. Without them, the AI panel shows a configuration error.
5. Apply the migration in `supabase/migrations/20260703000000_stencil_schema.sql` to the confirmed Stencil Supabase project.
6. Install and run:

```bash
pnpm install
pnpm dev
```

## Supabase

The schema uses related tables:

- `profiles`
- `prompts`
- `prompt_variables`

All tables have RLS enabled. Prompt variables are protected through their owning prompt. New profiles start with an empty library; prompts are loaded only from saved database rows.

Google sign-in uses Google Identity Services in the browser, then exchanges the Google ID token with Supabase. Create a Google OAuth Web client, add its client ID to `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and add your app origins such as `http://localhost:3000` and `https://stencilprompt.com` to the Google client's Authorized JavaScript origins. The same Google provider should still be enabled in Supabase Authentication > Providers so Supabase can verify the token.

Apple OAuth is configured in the Supabase dashboard under Authentication > Providers.

App redirects are configured in Authentication > URL Configuration. Add this local Redirect URL:

```text
http://localhost:3000/auth/callback
```

For production, add the production Redirect URL as well:

```text
https://stencilprompt.com/auth/callback
```

The Site URL can stay set to the production domain. Local OAuth still works as long as the local callback URL is in the Redirect URLs list.
