# WC2026 Sweepstake

A World Cup 2026 sweepstake site for your team. Built for Netlify — no external database needed.

---

## Setup

### 1. Deploy to Netlify

**Option A — Netlify CLI (recommended)**
```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --prod
```

**Option B — Drag and drop**
- Zip the whole project folder
- Go to app.netlify.com → Add new site → Deploy manually
- Note: Functions won't work with drag-and-drop. Use the CLI or connect a Git repo.

**Option C — GitHub**
- Push this folder to a GitHub repo
- Connect it in Netlify → it deploys automatically on every push

---

### 2. Environment variables

In your Netlify site dashboard → **Site configuration → Environment variables**, add:

| Variable | Required | Description |
|---|---|---|
| `ADMIN_TOKEN` | Yes | A secret password you choose. Used to access the admin panel to mark teams as eliminated. Make it long and random. |
| `APIFOOTBALL_KEY` | Optional | Your API-Football key for live match data. Free tier (100 req/day) is plenty. |

---

### 3. API-Football (live results)

The live feed uses [API-Football](https://www.api-football.com/) to pull match results and automatically mark knockout losers as eliminated.

1. Sign up free at api-football.com
2. Copy your API key
3. Add it as `APIFOOTBALL_KEY` in Netlify env vars
4. Redeploy

Without the key the site works fine — matches tab will show a placeholder, and you can manually mark eliminations via the Admin tab.

---

## How it works

### For your team
1. Visit the site URL
2. Enter your name → click Draw
3. Get one random team from each tier
4. Come back anytime to check if your teams are still in

### For you (admin)
- Visit the **Admin** tab
- Enter your `ADMIN_TOKEN`
- During the group stage: tick off eliminated teams and save
- During knockouts: the API handles it automatically

### Tiers (based on FIFA April 2026 rankings)
| Tier | Teams |
|---|---|
| Top (⭐) rank 1–17 | France, Spain, Argentina, England, Portugal, Netherlands, Belgium, Brazil, Morocco, Germany, Croatia, Colombia, Senegal, Mexico, USA, Uruguay |
| Mid (●) rank 18–40 | Japan, Switzerland, South Korea, Turkey, Ecuador, Austria, Australia, Iran, Norway, Egypt, Algeria, Sweden, Paraguay, Ivory Coast, Canada |
| Lower (·) rank 41+ | Czechia, Scotland, Tunisia, New Zealand, Cape Verde, Saudi Arabia, Iraq, Jordan, DR Congo, Uzbekistan, Ghana, Panama, Qatar, South Africa, Bosnia-Herzegovina, Curacao, Haiti |

---

## Notes

- **Storage**: entries are stored in Netlify Blobs — no database needed, included free
- **Caching**: live data is cached for 5 minutes to stay within API rate limits
- **Max entries**: 16 (one person per team in each tier). Realistically fine for a small team
- **Group assignments**: based on current projected draw — update `TEAMS` in both `index.html` and `teams-data.js` once the official draw is confirmed

---

## Teams

All 48 teams and group assignments reflect the official draw held on 5 December 2025 in Washington, DC.
