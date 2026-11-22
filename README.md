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
- **Live address**: https://app.joyfulpurposecoaching.com/ (custom domain set in repo Settings > Pages; DNS record `app` CNAME `jcisit.github.io` in Squarespace Domains).

## Still to do by hand

1. **Supabase sign-in links**: Authentication > URL Configuration. Set Site URL to the live address and add it under Redirect URLs.
2. **Admins**: after someone signs in once, run `update profiles set role = 'admin' where email = '...'` in the SQL Editor to give them the Studio tab.
3. **Google sign-in**: create an OAuth client in Google Cloud Console and paste its ID and secret into Supabase > Authentication > Providers > Google.

## Where things live

| Path | What |
|---|---|
| `src/sky.js` | Sun, moon, phase and gate calculations for today |
| `src/chart/` | Human Design chart from birth details (true node), with tests in `test/` |
| `src/weather.js` | Live weather, air quality, stargazing and place search from Open-Meteo |
| `src/insight.js` | The daily Human Design brief and plain-language wording for gates, lines, centers, types |
| `src/content.js` | All the wording: insights, prompts, check-in words. Astra's copy goes here for now |
| `src/store.js` | Logins and saving (Supabase, or browser storage in demo mode) |
| `src/screens/` | Login, Today, My Design, Sessions, Journal, Studio (admins only) |
| `src/styles.css` | Brand colors and layout |
| `supabase/schema.sql` | Database tables and privacy rules |

## Concepts (the tappable gates, lines, centers and lessons)

Every pill and tile in the Human Design card opens a slide-over drawer at its own link:

| Link | Shows |
|---|---|
| `#/concepts/gates/14` | A gate (1 to 64) |
| `#/concepts/lines/6` | A line (1 to 6) |
| `#/concepts/centers/solar-plexus` | One of the nine centers |
| `#/concepts/channels/2-14` | A channel |
| `#/concepts/centers` (or any lesson slug) | A lesson |

- `src/concepts/content.js`: all the writing (line invitations, center notes, the 14 lessons). Replace or extend this to plug in markdown or a CMS later.
- `src/concepts/resolve.js`: turns a link into what the drawer shows. The only place screens ask for concept content.
- `src/copy/transitCopy.js`: the daily briefing voice, built as text plus tappable pills.
- Astra can add a note for any day, and pick that day's lesson, from the Studio. It is stored in the `daily_notes` table.

## Not built yet

Named incarnation crosses (the app shows the angle and four gates), a content library Astra can edit herself, calendar sync, payments, App Store build.
