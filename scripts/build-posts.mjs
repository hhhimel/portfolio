/**
 * Builds data/posts.json and a static, shareable page per post (blog/<id>/index.html)
 * from the Markdown files in /posts. Run automatically by the GitHub Action, or
 * locally with: npm run build:posts
 *
 * A post is just a file: posts/whatever-name.md
 * The filename (without .md) becomes the post's id/slug — so it must be unique
 * and URL-safe (letters, numbers, hyphens).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const OUT_JSON = path.join(ROOT, "data", "posts.json");
const OUT_BLOG_DIR = path.join(ROOT, "blog");
const SITE_NAME = "Md. Habib Hasan Himel";
// TODO: replace with your real deployed domain (see README).
const SITE_URL = "https://hhhimel.github.io";

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const id = filename.replace(/\.md$/, "");
      if (!/^[a-z0-9-]+$/.test(id)) {
        throw new Error(
          `Post filename "${filename}" must be lowercase letters, numbers, and hyphens only (it becomes the URL).`
        );
      }
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data: fm, content } = matter(raw);
      if (!fm.title) throw new Error(`Post "${filename}" is missing a title in its frontmatter.`);
      if (!fm.date) throw new Error(`Post "${filename}" is missing a date in its frontmatter.`);
      const words = content.trim().split(/\s+/).filter(Boolean).length;
      const minutes = fm.minutes || Math.max(1, Math.round(words / 200));
      return {
        id,
        featured: !!fm.featured,
        category: fm.category || "field",
        tag: fm.tag || (fm.category ? fm.category[0].toUpperCase() + fm.category.slice(1) : "Post"),
        date: String(fm.date),
        minutes,
        title: fm.title,
        summary: fm.summary || "",
        cover: fm.cover || "",
        video: fm.video || null,
        gallery: Array.isArray(fm.gallery) ? fm.gallery : null,
        body: marked.parse(content),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** A real, crawlable page per post — gives correct link-preview cards on
 *  WhatsApp/Telegram/Facebook/LinkedIn (they don't run JavaScript, so the
 *  main single-page site can't do this on its own). Humans get a styled
 *  reading page with a link back into the full portfolio. */
function postPageHTML(p) {
  const url = `${SITE_URL}/blog/${p.id}/`;
  const image = p.cover ? `${SITE_URL}/${p.cover}` : `${SITE_URL}/images/profile.jpg`;
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(p.title)} — ${SITE_NAME}</title>
<meta name="description" content="${esc(p.summary)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.summary)}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(p.title)}" />
<meta name="twitter:description" content="${esc(p.summary)}" />
<meta name="twitter:image" content="${image}" />
<link rel="icon" href="../../favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="../../apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="../../css/style.css" />
<style>
  body{max-width:720px;margin:0 auto;padding:2.5rem 1.25rem 4rem}
  .post-cover img{width:100%;border-radius:14px;margin:1.25rem 0}
  .post-video{width:100%;border-radius:14px;margin:1.25rem 0}
  .post-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.6rem;margin:1.5rem 0}
  .post-gallery img{width:100%;border-radius:10px}
  .back-link{display:inline-block;margin-bottom:1.5rem;font-size:0.9rem}
</style>
</head>
<body>
  <a class="back-link" href="../../#post=${encodeURIComponent(p.id)}">← Back to the full portfolio</a>
  <div class="blog-meta">${esc(new Date(p.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))} · ${p.minutes} min read · ${esc(p.tag)}</div>
  <h1>${esc(p.title)}</h1>
  ${p.cover ? `<div class="post-cover"><img src="../../${p.cover}" alt="${esc(p.title)}" /></div>` : ""}
  ${p.video ? `<video class="post-video" src="../../${p.video}" controls playsinline poster="${p.cover ? "../../" + esc(p.cover) : ""}"></video>` : ""}
  <div class="reader-body">${p.body}</div>
  ${
    p.gallery
      ? `<div class="post-gallery">${p.gallery.map((g) => `<a href="../../${g}" target="_blank" rel="noopener"><img src="../../${g}" alt="" loading="lazy" /></a>`).join("")}</div>`
      : ""
  }
  <p style="margin-top:2.5rem"><a class="back-link" href="../../#post=${encodeURIComponent(p.id)}">← Back to the full portfolio</a></p>
</body>
</html>
`;
}

function main() {
  const posts = readPosts();

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(posts, null, 2) + "\n");

  // Clean and regenerate the static per-post pages.
  fs.rmSync(OUT_BLOG_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_BLOG_DIR, { recursive: true });
  for (const p of posts) {
    const dir = path.join(OUT_BLOG_DIR, p.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), postPageHTML(p));
  }

  console.log(`Built ${posts.length} post(s) → data/posts.json + blog/<id>/index.html`);
}

main();
