# Mr Games

Mr Games is a Colombia-focused online storefront for digital video games and subscriptions. The site presents a browsable catalog and lets customers put together a game bundle and request a quote. It is built with Next.js and Supabase, and deployed on Cloudflare using OpenNext.

**Live site:** [mrgames.com.co](https://mrgames.com.co)

**En español:** [README.es.md](README.es.md)

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS 4
- Supabase for catalog and application data
- OpenNext and Cloudflare Workers for deployment
- Vitest for automated tests

## Run locally

Use a current Node.js release and npm. Install dependencies, configure the required environment variables in a local `.env.local` file using values from your own development setup, then start the development server:

```bash
npm install
npm run dev
```

The app reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Supabase access. Some administrative and catalog-management operations also require server-only credentials such as `SUPABASE_SECRET_KEY` and `STEAMGRIDDB_API_KEY`. Keep real credentials private and never commit them. The app is available at [http://localhost:3000](http://localhost:3000).

Run the test suite with:

```bash
npm test
```

For Cloudflare preview and deployment, the project provides `npm run preview` and `npm run deploy`.

## Project structure

- `app/` — storefront pages, product details, cart, checkout, privacy, and admin routes
- `components/` — shared storefront and administration UI
- `utils/` — Supabase clients and application helpers
- `context/` — shared cart state
- `supabase/` — database migrations and SQL tests
- `tests/` — Vitest tests
- `docs/` — technical and security reference documents

Product and design context is documented in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).
