# Cosmic Weather

Daily sky dashboard for Joyful Purpose Coaching clients: moon phase, Human Design gates, a journal prompt, to-dos and an evening check-in.

Built with Vite + React. Supabase handles logins and data. It is a static site, so it hosts on GitHub Pages.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

With no Supabase keys it runs in **demo mode**: any email signs in and everything saves in that browser only.

## How it is hosted

- **Code**: this repo. Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.
- **Database and logins**: Supabase project `cosmic-weather`. Its URL and publishable key are in `.env.production` (public by design; the database rules do the protecting).
- **Live address**: https://jcisit.github.io/cosmic-weather/ until the custom domain is set.

## Still to do by hand

1. **Supabase sign-in links**: Authentication > URL Configuration. Set Site URL to the live address and add it under Redirect URLs.
2. **Admins**: after someone signs in once, run `update profiles set role = 'admin' where email = '...'` in the SQL Editor to give them the Studio tab.
3. **Custom domain**: add a CNAME record `app` pointing to `jcisit.github.io` at the domain registrar, then set the custom domain in repo Settings > Pages and update the Supabase URLs to match.
4. **Google sign-in**: create an OAuth client in Google Cloud Console and paste its ID and secret into Supabase > Authentication > Providers > Google.

## Where things live

| Path | What |
|---|---|
| `src/sky.js` | Sun, moon, phase and gate calculations |
| `src/content.js` | All the wording: insights, prompts, check-in words. Astra's copy goes here for now |
| `src/store.js` | Logins and saving (Supabase, or browser storage in demo mode) |
| `src/screens/` | Login, Today, My Design, Sessions, Journal, Studio (admins only) |
| `src/styles.css` | Brand colors and layout |
| `supabase/schema.sql` | Database tables and privacy rules |

## Not built yet

Chart calculation from birth data, a content library Astra can edit herself, calendar and weather, payments, App Store build.
