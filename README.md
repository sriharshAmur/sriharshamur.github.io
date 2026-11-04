# Sri Harsh Amur — personal website

Astro portfolio being revamped for `https://sriharsh.com/`, including a web CV,
selected work, and personal photos.

## Local development

```sh
npm ci
npm run dev
```

Use the URL printed by Astro. `npm run build` creates the static site in `dist/`.
`npm run check` validates the TypeScript used for content and browser interactions.
Contact uses direct email, with a copy-to-clipboard control and a mail link.

## Content and design

Edit `src/data/site.ts` for the profile, experience, education, skills and project
case studies. Home and `/cv` share this content. The personal introduction and
career milestones live in `src/components/About.astro` and `Path.astro`.
`/cv` includes a browser print / Save as PDF action with an A4 stylesheet.

The palette uses Delft blue (`#2849c9`), marigold (`#ffb020`), porcelain
(`#eceef2`), navy ink (`#161a33`) and a pale surface (`#f6f7fa`). Anybody variable
type carries the large, left-aligned name and controls; Newsreader carries prose.
The desktop hero balances a two-line name with a portrait, then the page moves
through featured work, an interactive stack, a career route and a personal note.
On phones these become a single column. Fonts are self-hosted under `public/fonts`
with their OFL licenses.

Motion uses CSS and small browser APIs, without an animation framework: variable
type, portrait depth, project hover previews, expandable stack layers, a drawn
career route, page transitions and a circular theme reveal. Reduced-motion
preferences remove movement and reveal content immediately. Content stays
readable when JavaScript is disabled. Non-screenshot project covers are labelled
as illustrations; Long Exposure screenshots use fictional demo data.

## Cloudflare hosting

The portfolio is deployed to the user's **personal** Cloudflare account as the
`sriharsh-portfolio` Worker with static assets. The shared hosting plan uses
Workers Paid and keeps each application in its own Worker.

| Address | Application |
| --- | --- |
| `sriharsh.com` | This static Astro portfolio |
| `www.sriharsh.com` | Permanent redirect to HTTPS on the apex, preserving path and query |
| `sriharsh.com/long-exposure` and its subpaths | Timeline app, served by its own Worker route |
| `sriharsh.com/munch` and its subpaths | Food history app, served by its own Worker route |
| Separate subdomain, to be confirmed | Finance app, protected by Cloudflare Access |

`wrangler.jsonc` binds the portfolio to `sriharsh.com/*` and
`www.sriharsh.com/*` using **routes, not custom domains**. The existing, more
specific `sriharsh.com/long-exposure*` route belongs to `long-exposure` and must
not be changed by portfolio deployments. The portfolio Worker also refuses to
serve assets under that path prefix if it receives such a request unexpectedly.

Keep the proxied placeholder DNS records at the apex and `www` (`A 192.0.2.1`
and `AAAA 100::`); Workers routes rely on proxied DNS records. Workers development
and version preview URLs are disabled. The Worker enforces HTTPS and adds HSTS,
content type protection, frame protection, and a referrer policy.

### Deploy

Use Node.js 24 LTS (minimum 22.23.4) and `npm ci`. Supply `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` using your environment or a local `.env` file. The account
must match the personal account pinned in `wrangler.jsonc`; do not deploy with
workplace credentials. `.env`, its variants, and Wrangler state are git-ignored.

With credentials already exported:

```sh
npm run deploy
```

With a local `.env`, load it without printing credentials:

```sh
node --env-file=.env --run deploy
```

This builds Astro into `dist/` and uploads only those assets and `worker/index.js`.
Credentials are used by the deployment CLI and are not Worker bindings. Never
prefix credentials with `PUBLIC_`, place them in `public/`, or commit them.

After deployment, verify the portfolio, the `www` redirect, and
`https://sriharsh.com/long-exposure/`. The previous GitHub Pages workflow and
`CNAME` file were retired after verifying the Cloudflare cutover. Deployments are
currently manual; pushing this repository does not deploy the site.
