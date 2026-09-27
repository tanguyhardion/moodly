# Moodly

A daily mood tracking journal with configurable metrics, visualizations and insights.

## Features

- Build your own daily check-in from metric types: sliders, checkboxes, numbers, times, locations (with weather), text notes, and calculated metrics (e.g. sleep hours from bedtime and wake-up)
- Drafts are autosaved locally until you save the entry
- History, per-metric statistics, and insights (trends, correlations, habit effects, predictions)
- Letters to your future self, email alerts, daily reminders and weekly/monthly reports
- Export your data to JSON
- Dark mode support
- Password-protected: the master password is exchanged for a 7-day session token

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server (expects the backend on http://localhost:3001)
npm run dev

# Build for production
npm run build
```

## Configuration

The backend URL is `runtimeConfig.public.apiBase` in `nuxt.config.ts`; the `$development` override points it at a local `vercel dev`.

## Project Layout

- `app/types/shared.ts` - Domain types, kept identical to `moodly-backend/types/shared.ts`
- `app/utils/moodly-backend.ts` - API client (configured by `app/plugins/api.client.ts`)
- `app/utils/statsMath.ts`, `metricStats.ts`, `insights.ts` - Pure calculations behind the stats and insights pages

## Tech Stack

Built with Nuxt 4, Vue 3, and TypeScript, backed by the `moodly-backend` Vercel API and Supabase.
