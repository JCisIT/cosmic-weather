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

## Going live (JC's checklist)

1. **GitHub**: create an empty repo and push this folder to `main`.
2. **Supabase**: create a project. In SQL Editor, paste and run `supabase/schema.sql`.
3. **Supabase keys**: copy the Project URL and anon key from Project Settings > API. In the GitHub repo, add them under Settings > Secrets and variables > Actions > **Variables** as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **GitHub Pages**: repo Settings > Pages > Source: GitHub Actions. Each push to `main` then deploys.
5. **Domain**: in Pages settings set the custom domain to `app.joyfulpurposecoaching.com`, and at the domain registrar add a CNAME record `app` pointing to `<github-username>.github.io`.
6. **Supabase sign-in settings**: Authentication > URL Configuration, set Site URL to `https://app.joyfulpurposecoaching.com`.
7. **Google sign-in** (optional, can come later): create an OAuth client in Google Cloud Console, then paste its ID and secret into Supabase > Authentication > Providers > Google.

## Where things live

| Path | What |
|---|---|
| `src/sky.js` | Sun, moon, phase and gate calculations |
| `src/content.js` | All the wording: insights, prompts, check-in words. Astra's copy goes here for now |
| `src/store.js` | Logins and saving (Supabase, or browser storage in demo mode) |
| `src/screens/` | Login, Today, My Design, Sessions, Journal |
| `src/styles.css` | Brand colors and layout |
| `supabase/schema.sql` | Database tables and privacy rules |

## Not built yet

Chart calculation from birth data, Astra's studio (recaps, action steps, content library), calendar and weather, payments, App Store build.
