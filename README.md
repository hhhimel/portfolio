# Himel portfolio — daily updates guide

Static site for Cloudflare Pages.

## How to publish a new post

### Easiest (recommended): form writer — no hand Markdown/JSON

1. Open **`admin/write.html`** in your browser.
2. Fill title, date, category, summary, body. Optional: cover, video, gallery, featured.
3. Click **Load posts.json → add → download** and choose your current `data/posts.json`.
4. Replace `data/posts.json` with the downloaded file.
5. Put any new photos under `assets/images/` (paths must match the form).
6. Upload / deploy the portfolio folder.

Also on that page: **Download .md** (for GitHub later) and **Copy JSON entry**.

You do **not** need to write `.md` or edit JSON structure by hand for normal posts.

### Optional long-term: Markdown + GitHub Action

If the repo Action is enabled: put a `.md` in `posts/` (or download one from the writer), push to `main`, and the Action rebuilds `data/posts.json` + `blog/`. Good for automation; not required if you use the form + folder upload.

### Testing locally
```
npm install
npm run build:posts
python -m http.server
```
Open `http://localhost:8000/admin/write.html`.

### Why there's now a real page per post
`blog/<id>/index.html` is a plain, crawlable page with correct title/description/
image tags — so a link you share on WhatsApp/Telegram/LinkedIn shows *that post's*
photo and text in the preview card, not the site's generic one. Visitors who open
it get a simple reading page with a link back into the full portfolio (which opens
straight to that same post, via the `#post=<id>` deep link).

**One-time setup (already done — live address is `https://hhhimel.pages.dev`):** the address is set in `scripts/build-posts.mjs`,
`robots.txt`, `sitemap.xml`, and the JSON-LD block in `index.html` with your actual
deployed domain.

## Edit the public notice (always visible)

In `index.html`, find:

```html
<p id="notice-text">...</p>
```

Change the text and redeploy. The bar cannot be dismissed by visitors.

## Change address / map

Search for `Sher-e-Bangla Nagar` in `index.html` (contact text + Google Maps embed `q=` parameter).

## Telegram / social icons

Contact icons are in the Contact section of `index.html`. Telegram defaults to `https://t.me/hh_himel`.

## What updates day by day

| Change | File |
|--------|------|
| New post | add a `.md` file under `posts/` (see above) |
| Photos / video | add under `assets/images/` or `assets/videos/`, reference the path in the post's frontmatter |
| CV file | replace `assets/docs/Himel_CV.pdf` (and the .docx copy) |

## Comments

Still browser-local (demo). For real public comments, use Giscus later.

## Deploy

Upload whole `himel-portfolio` folder to Cloudflare Pages (no build command).


---

## Updates (v3)

> The notices bell described below was removed in v8 — see the note at the bottom of this file.

### Updates (v4 — improvements)
- **Shareable post links.** Opening a post now updates the URL to `#post=<id>` and the browser tab title, and the back button closes it. Anyone who gets that link lands straight on that post.
- **Share button** in the article reader: uses the phone's native share sheet where available (WhatsApp/Telegram/etc.), otherwise copies the link with a small "Link copied" toast.
- **Basic SEO**: added `og:image`/Twitter card tags, a Person JSON-LD block, `robots.txt`, and `sitemap.xml`.

### Updates (v5 — Markdown posts + per-post share pages)
- Posts are now written as Markdown files in `posts/` instead of hand-edited JSON — see the "How to publish" section at the top of this file.
- A GitHub Action builds `data/posts.json` and a real, crawlable `blog/<id>/` page per post automatically on push, so individual post links now get correct social-share previews (image, title, description) — the v3/v4 limitation of generic previews is resolved.
- Supports optional `video` and `gallery` fields per post for multi-media write-ups (see `posts/2026-09-26-lab-to-field-demo.md`).
- The old `admin/post-template.html` tool is removed — no longer needed.

### Updates (v8 — simplified for portfolio focus)
Removed everything that wasn't your work: notices bell + popup, the auto-scrolling skill marquee, the hero clock/calendar/weather widget tiles, and the "Helplines & useful links" section. Deleted the now-unused `js/notices.js`, `js/calendar-modal.js`, `js/widget-modals.js`, and `data/notices.json`.
- **"Research & Experience" → "Experience"**: this section is a factual role/date timeline (thesis, RA position, consultant work, tutoring) — kept as-is, just relabeled so it reads distinctly from **Notes & Insights**, which is where your narrative write-ups belong. Two different jobs, one less point of overlap.
- **Nav label "Blog" → "Notes"**, matching the section's existing "Notes & Insights" label.
- **Prev / Next in the article reader**: every post now shows links to the previous/next post (by date) at the bottom, so a reader can move through your notes in sequence without going back to the grid each time.

### Updates (v9 — nav/chrome cleanup, notes-first)
- Removed the "Fieldwork & Lab" static photo gallery — Notes & Insights (with per-post `cover`/`video`/`gallery`) now covers this. Deleted the now-unused lightbox HTML/JS along with it.
- Nav simplified: top bar shows just "Himel"; "Work" renamed to "Tools & Work"; **Download CV** moved into the nav menu (both desktop and mobile) — it's no longer duplicated on the About section.
- Removed: WhatsApp button from About, scroll-progress bar, "Contact me" hero button, the icon+name block in the footer, and the redundant Email icon in Contact (the Send Message form already covers email).
- Added **Gagro** and **CampusAssist** as Personal Project cards in Publications — fill in CampusAssist's live link in `index.html` once it's deployed (marked with a `TODO` comment).
- Map now points at Sher-e-Bangla Agricultural University's actual coordinates (23.7714, 90.3754) instead of the broader Sher-e-Bangla Nagar area.
- Theme now also follows the OS light/dark setting live if you haven't manually toggled it yourself (it already respected the system on first visit — this makes it keep following if the system changes later).
- Education entries in About use a proper `.edu-item.plain` class instead of repeated inline styles.

### Updates (v10 — real comments, icons, structured data, latest-note teaser)

**Comments are now real** (Giscus, free, backed by GitHub Discussions — replaces the old browser-only local comments). Two-minute setup:
1. Make sure your portfolio's GitHub repo is **public**, then enable **Discussions** for it (repo → Settings → Features → Discussions).
2. Install the [giscus app](https://github.com/apps/giscus) on that repo.
3. Go to **https://giscus.app**, fill in your repo, pick a "specific discussion" mapping, pick a category (e.g. create one called "Comments"), and it'll show you your `data-repo-id` and `data-category-id`.
4. Open `assets/js/main.js`, find the `GISCUS` object near the bottom, and fill in `repo`, `repoId`, `categoryId` (and `category` if you named it something other than "Comments").

Until you do that, the comment area just shows a quiet placeholder — nothing breaks.

**Other additions:**
- Proper favicon set: `favicon.ico`, `apple-touch-icon.png`, `assets/icons/icon-192.png`/`icon-512.png`, and `site.webmanifest` — bookmarks and "Add to Home Screen" now get a real icon instead of relying only on the inline SVG.
- `ScholarlyArticle` structured data (JSON-LD) added for your Research Square preprint, alongside the existing Person schema.
- **Latest note teaser** in the hero: a small pill under your location/university line that always shows your most recent post and opens it directly — updates automatically as you publish.

### Updates (v11 — SEO ceiling, and what actually moves it)
Added a `<link rel="canonical">` and a `WebSite` JSON-LD block on the homepage. Combined with the sitemap/robots.txt/Person/ScholarlyArticle schema from earlier, the on-page technical SEO is essentially complete — this is the ceiling of what code alone can do.

**No amount of code makes a new personal site outrank university/journal/Wikipedia pages for broad terms** ("plant breeding", "blackgram research"). That's realistic for your own name and specific long-tail phrases tied to your actual work, not for competitive general terms.

The two things that actually move ranking from here, both outside what I can do for you:
1. **Submit to Google Search Console** (search.google.com/search-console) and Bing Webmaster Tools once your domain is live — add the property, verify ownership, submit `sitemap.xml`. Without this, Google may take weeks/months to even discover the site.
2. **Backlinks from higher-authority sites** — this is the single biggest ranking factor. Add your portfolio link to: LinkedIn profile ("Website" field), ResearchGate/ORCID/Google Scholar profile, GitHub profile bio, and your Research Square preprint's author info. Each one is a credibility signal search engines weigh heavily — and none of them can be faked from inside the code.

### Updates (v13.16 — comments live)
- Giscus is configured for `hhhimel/portfolio`, category **General**. Each note gets its own thread (mapping by post id, not page path, since notes open inside one page). Comment box sits at the bottom of the thread.

### Updates (v13.15 — light-mode borders)
- Light theme borders (`--border`, `--border-strong`, `--glass-border`) are darker/greener so cards, nav, menu and form fields have clear outlines. Dark theme untouched.
- Hero: **View experience** has no arrow; **Read notes** has a downward arrow.

### Updates (v13.14 — hero + form polish)
- Hero back to left-aligned. Order is now: headline → intro → one-line "Sher-e-Bangla Agricultural University · Dhaka, Bangladesh" → one row with **View experience** (colored) and **Read notes** (dimmer).
- Contact form is more compact (smaller padding, 3-row message box) and the map is shorter (16:10 instead of 4:3).
- Removed the `post/` redirect folder (it pointed to `/admin/`, which no longer exists). Post sources stay in `posts/`; the writing tool is `admin/write.html`.

### Updates (v13.13 — one live address)
- The portfolio is served by Cloudflare Pages (synced from this repo) at **https://hhhimel.pages.dev**, matching the link on the CV. The canonical link, social-preview images, structured data, sitemap, robots.txt, and every generated blog page now use that address. Links to your other projects stay on `hhhimel.github.io/...`.

### Updates (v13.12 — layout + folder cleanup)
- **Folder structure:** everything static now lives under `assets/` — `css/`, `js/`, `images/`, `videos/`, `docs/` (CV), `icons/`. Root keeps only what browsers/crawlers expect there (`index.html`, `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, `robots.txt`, `sitemap.xml`). New photos go in `assets/images/`, videos in `assets/videos/`, and post frontmatter paths start with `assets/…`.
- Hero: **View experience** and **Read notes** sit side by side; "Read notes" jumps to the Notes section. The hero intro (including Dhaka / university chips) is centered when the layout stacks on phones/tablets.
- Menu links slightly tighter; removed a duplicated hero badge dot and more dead CSS (unused info-widget styles).

### Updates (v13.11 — CV link simplified)
- **Download CV** now just opens `Himel_CV.pdf` in a new tab (browser preview with its own download/print buttons). The dialog from v13.10 was removed. `Himel_CV.docx` stays in the repo but is no longer linked; re-export the PDF whenever the CV changes.

### Updates (v13.10 — CV dialog, superseded)
- **Download CV** (nav + mobile menu) opens a small dialog: **Print…** (shown only on devices with a real print dialog — its window has "Save as PDF"), **Save as PDF**, **Save as Word (.docx)**. Phones/tablets just show the two save options. Browsers can't print a .docx, so Word is a save-only option.
- Hero teaser tag "Latest note" → **"Read notes"** (still opens the newest post).

### Updates (v13.9 — CV menu + polish)
- **Download CV** is now a dropdown: *View / Print / Save as PDF* (opens `Himel_CV.pdf` in the browser viewer, which has print + save built in) and *Download Word (.docx)*. Mobile menu lists both. **When you edit the CV, re-export both `Himel_CV.docx` and `Himel_CV.pdf`.**
- "Send message" now has an arrow like "View experience" (and keeps it after a send attempt).
- Contact icons centered; reply hint says "within 24 hours"; WhatsApp/phone removed.
- About: name and role centered under the photo when the layout stacks (phones/tablets).

### Updates (v13.5 — section IA pass)
- Nav/section label "Activities" → **"Notes"**: it labels your blog write-ups, and "Activities" read as unrelated extracurriculars. Matches what the section itself has always been called ("Notes & Insights").
- Contributions now visibly splits into **Publication** → **Personal Projects** → **Recognition**, instead of one flat list where a preprint and four side projects looked like the same kind of thing.
- Each project card's badge now shows its stack (e.g. "Laravel · MySQL · jQuery") instead of repeating "Personal Project" four times — more useful, and the "Personal Projects" heading already says what they are.
- Skills category "Additional · IT" → **"IT & Tools"**, a plainer, parallel name next to "Research & Technical" and "Agricultural Expertise".

### Updates (v13 — cleanup + new project links)
- Removed ~390 lines of dead CSS left over from the old notification bell, hero clock/calendar tiles, and the standalone clock/calendar/weather pop-up modals — none of it was referenced by any HTML or JS anymore.
- Removed the duplicate `admin/index.html` (byte-identical to `admin/write.html`); use `admin/write.html` as the README already describes.
- Filled in the live **CampusAssist** link and added an **AssignmentStudio** project card in Contributions.
- Added the institutional email next to the personal one in Contact.
- "Focus areas" in About now uses the same tag style as Skills, for consistency.

### Updates (v12 — menu redesign, app-style)
Restyled the mobile menu (☰) to feel more like a native app sheet: real outline icons per item instead of small dots, roomier tap targets, a flatter/more opaque dark background (less "frosted", more solid) with a quicker, subtler open animation, and a plain small caption-style header. Same glass/blur system as the rest of the site, just tuned — no new dependencies.

### Other changes
- Compact frosted menu window (replaces the side drawer); "Get in Touch" and CV buttons removed from the menu bar — the CV download now lives only in **About**.
- Live animated seedling logo in the header, menu and footer.
- Hero: reel with a vertical rail of live widgets (clock, calendar, weather). Tap each for the full analog/world clocks, the 2026 বর্ষপঞ্জি, or the forecast (location / any city).
- Blog: fixed cards that stayed invisible, oversized featured image, removed placeholder cards. Comments are saved in the visitor's own browser only.
- Preview locally with a server (e.g. `python -m http.server`) — the blog, notices and weather load files/APIs and won't work from a double-clicked file.
