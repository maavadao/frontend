# maavaDao — frontend

The website for [maavaDao](https://maavadao.com): **a community-owned ecosystem of agentic AI and blockchain technologies for education.**

Developers build and list AI agents on the maava Marketplace, free. Educators, students and content creators use them to teach, learn, research and inform. There are no listing fees, no creation fees and no commissions; when a product earns money, 60% rewards the contributors who built it and 40% helps children in need (deserving children, orphans and street children, through maava's schools), through a decentralised autonomous organisation (DAO).

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4. The design follows Apple's principles of clarity, deference and depth: system typography, generous whitespace, neutral surfaces, a single accent, frosted navigation, scroll reveals, and automatic light and dark mode.

## Pages

| Route     | What it is |
| --------- | ---------- |
| `/`       | Landing: mission, how it works, key features, **project catalog**, governance, child safety, who it is for, roadmap, get involved |
| `/marketplace` | AI agents and tools listed by the community, merged from the registry's `tools/` and `agents/` into one catalog |
| `/login`  | Sign in with Google or GitHub |
| `/signup` | Create an account with Google or GitHub |
| `/onboarding` | First sign-in only: choose a username, country and role |

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Supabase URL and publishable key
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Editing content

- **Projects section:** `src/components/CommunityProjects.tsx` (maava Community Agents plus marketplace listings, read from the maava-Community-Agents and registry indexes)
- **Open-source AI repos, developers and maava Community Agents:** `src/app/{repos,developers,agents}/`, with data helpers in `src/lib/{repos,developers}.ts`
- **Marketplace:** `src/app/marketplace/page.tsx` + `src/components/MarketplaceCatalog.tsx`, reading the registry's public `index.json` via `src/lib/registry.ts` (revalidated hourly, no database)
- **Site name, links, contact email:** `src/lib/site.ts`
- **Sections, roadmap and copy:** `src/app/page.tsx`
- **Design tokens (colors, fonts, motion):** `src/app/globals.css`

## Auth

Accounts use [Supabase Auth](https://supabase.com/docs/guides/auth) with Google and GitHub sign-in only.

1. The sign-in buttons post to `/auth/signin`, which sends the browser to Google or GitHub. The provider returns to `/auth/callback`, which exchanges the code for a session cookie.
2. A member without a row in `profiles` goes to `/onboarding` to choose a username, country and role (student, developer, open-source contributor, educator, organisation or funder). They also agree to the code of conduct there.
3. `src/proxy.ts` refreshes the session on each request. Pages check the user on the server with `getClaims()`.

The database (the `profiles` table, its row-level security and the local Supabase stack) lives in [maavadao/supabase](https://github.com/maavadao/supabase). Its README covers local development and production setup.

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are read on the server at runtime, so one image works in any environment.

- **Locally:** run the Supabase stack, then put the values `npx supabase start` prints into `.env.local`.
- **On Cloud Run:** they come from the Secret Manager secrets `supabase-url` and `supabase-publishable-key`.

Sign-in starts on the server (`POST /auth/signin`), so the browser never needs these settings.

The contact form has no backend either. It opens the visitor's mail app with the message prefilled and addressed to `site.email`.

## Contributing

Pick something, open a pull request, and say hi on [GitHub](https://github.com/maavadao). Not every contribution is code: reviewing agents for safety, translating content and connecting schools all count.

## Licence

Open source under the [Apache 2.0 Licence](LICENSE).
