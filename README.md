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
The website uses screen-only `src/styles/cv.css`. Printing renders a separate
`src/components/CvDocument.astro` with its own `src/styles/cv-document.css`,
class names and colour tokens, so web layout changes cannot leak into the PDF.

The CV pairs employer details with outcome-led achievement bullets and selective
bold emphasis. Its focused skills, projects and speaking selection live in the
`cv` export in `src/data/site.ts`. The web header shares the homepage portrait and
marigold circle; the photo is excluded from the PDF. The document uses Public Sans,
a clear name and contact header, blue titles and links, dark-blue body text, and
small line icons for contacts and sections, all on plain white with no coloured
backgrounds or highlight fills. Secondary school and older practice projects
stay on the portfolio. JET claims follow the November 2026 verified evidence
report; internal reviews, ticket references and unverified impact estimates are
excluded.

For a one-page PDF generated from the actual CV page, run `npm run export:cv`.
This builds the site and writes `output/pdf/Sri-Harsh-Amur-CV.pdf` using local
Chrome or Chromium. Set `CHROME_PATH` if the executable is in a nonstandard
location. CSS, fonts and images are embedded for export; no development server is
needed. Generated exports are git-ignored. The A4 print layout leads with experience,
then projects, skills, speaking and education. Its concise summary, selected
achievement bullets and project descriptions live alongside the full web copy in
`src/data/site.ts` (`printSummary`, `printExperience` and `printDetail`). The website
keeps the longer evidence; the PDF is edited for scanning rather than squeezed to
fit with tiny type. Vishwa's, Journal, Long Exposure and Munch are selected from the shared
project data, including their actual app and public source links. The PDF
leaves out projects marked `print: false` (Munch) to stay on one page. Website logos,
screenshots, badges and animations are omitted from print; skills become concise
technology lists. Employers, education, contact details, projects, case studies,
public repositories and named technologies have clickable links. External
destinations are maintained in `src/data/cv-links.ts`. The PDF uses readable body
text, keeps entries together, and preserves selectable text. Print colours stay
consistent in light and dark mode.

The shared palette uses blue (`#1766c1`), marigold (`#ffba38`), porcelain
(`#f2f5f7`) and charcoal ink (`#18242c`). Dark mode uses neutral charcoal
(`#14191c`) with sky-blue (`#76baff`) and warm gold (`#ffc254`) accents. Anybody variable
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

The hero name keeps fixed letter slots while its visible glyphs stretch in and
change weight with pointer proximity. Hover takes over when the actual entrance
animations finish, avoiding competing updates. A decorative cursor dot becomes
a small character around featured projects and puts on glasses over portraits, yielding to
buttons, navigation, text selection and floating previews. The native cursor
remains visible. On touchscreens, a button beside the portrait gives a short
greeting, wink, glasses and letter wave without intercepting scrolling. A tappable
sunshine in the footer and brief tap celebrations add touch-only responses;
repeated taps replace existing particles rather than accumulating them. Reduced motion
disables the follower and moving responses; the greeting still works. The CV
does not include the character. Phone contact details are omitted site-wide.

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
