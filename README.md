# H&M Design & Demand Intelligence: dashboard

The front end for [hm-design-intelligence](https://github.com/razanhijazii/hm-design-intelligence), a decision tool that tells fashion designers **what to design, why, and how many to make**.

**Live demo:** https://hm-design-intelligence-frontend.lovable.app

## What it shows

- **Overview:** rising trends, active briefs, recommended units and average confidence for the season.
- **Trend signals:** which colours, silhouettes, details and fabrics are rising, peaking or fading.
- **Design briefs:** 12 recommended pieces, each a simple base with one signature detail and the data-backed reasons behind it.
- **Multiway and sustainable:** convertible pieces with step-by-step conversions, and sustainable material choices.
- **Demand and stock:** a weekly forecast per brief and a newsvendor order quantity from simulated demand, with launch window, size split and stock risk.

## How the data gets here

The pages open instantly from a bundled snapshot of the engine's output (`src/data`). In the browser the app then fetches the same data from the live Python API at `https://hm-design-intelligence.onrender.com` and replaces the snapshot. The free server can take up to a minute to wake up, so a status line in the sidebar says which data is on screen. Components only read data through `src/services/api.ts`.

Set `VITE_API_URL` to point the dashboard at a different backend.

## Run locally

```sh
npm install
npm run dev
```

Built with TanStack Start, React, TypeScript, Tailwind and Recharts.

> Independent concept project, not affiliated with H&M. All data is synthetic.
