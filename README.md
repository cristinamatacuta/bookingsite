# Booking with Cristina

A little application flow: congrats screen → name → pick a day & time →
details (plan, pickup, flowers, phone, email) → confirmation. Bookings and
applications are stored in Vercel KV so slots can't be double-booked once
this is live.

## Deploy it (takes about 5 minutes)

1. **Push this folder to a GitHub repo** (or use the Vercel CLI — see below).
2. Go to https://vercel.com/new and import that repo. Framework preset:
   "Other" (it'll auto-detect the `/api` folder as serverless functions).
3. Before your first real visitor, add storage:
   - In your new Vercel project → **Storage** tab → **Create Database** →
     choose **KV**. Vercel will automatically add the connection
     environment variables to your project — you don't need to copy
     anything by hand.
4. Add one more environment variable yourself, under **Settings → Environment
   Variables**: `ADMIN_KEY` = any password you make up. This protects the
   `/admin.html` page where you'll see who applied.
5. Redeploy (Vercel does this automatically after you add env vars, or click
   **Redeploy** in the Deployments tab).

Your site is now live at the URL Vercel gives you, e.g.
`your-project.vercel.app`. Visit `/admin.html` and enter your `ADMIN_KEY` to
see applications as they come in.

## Or deploy from your terminal instead of GitHub

```bash
npm install -g vercel
cd booking-site
vercel
```
Follow the prompts, then do step 3–4 above from the Vercel dashboard.

## Editing availability

Open `public/index.html` and find the `AVAILABILITY` block near the top of
the `<script>` — edit `WEEKDAY_TIMES`, `WEEKEND_TIMES`, `DAY_OVERRIDES`, or
`BLACKOUT_DAYS` to change what's bookable. Push/redeploy after editing.
