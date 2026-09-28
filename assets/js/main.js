/* =========================================================
   Md. Habib Hasan Himel — Portfolio JS
   ========================================================= */

(function () {
  "use strict";

  const html = document.documentElement;
  const nav = document.getElementById("nav");
  const backTop = document.getElementById("back-top");
  const themeToggle = document.getElementById("theme-toggle");
  const mobileBtn = document.getElementById("mobile-btn");
  const menuWindow = document.getElementById("menu-window");
  const menuScrim = document.getElementById("menu-scrim");

  /* Shared helpers (other scripts use window.SiteUI) */
  const scrollLocks = new Set();
  window.SiteUI = {
    lock(key) { scrollLocks.add(key); document.body.style.overflow = "hidden"; },
    unlock(key) { scrollLocks.delete(key); if (!scrollLocks.size) document.body.style.overflow = ""; },
    // one floating panel (menu / notices) open at a time
    announce(name) { document.dispatchEvent(new CustomEvent("ui:popover", { detail: name })); }
  };
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function applyTheme(isDark, persist = true) {
    html.classList.toggle("dark", isDark);
    if (persist) localStorage.theme = isDark ? "dark" : "light";
    const sun = themeToggle?.querySelector(".icon-sun");
    const moon = themeToggle?.querySelector(".icon-moon");
    if (sun && moon) {
      sun.style.display = isDark ? "block" : "none";
      moon.style.display = isDark ? "none" : "block";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#07120c" : "#f4f9f6");
  }

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const stored = localStorage.theme;
  if (stored === "light") applyTheme(false);
  else if (stored === "dark") applyTheme(true);
  else applyTheme(systemDark.matches, false);

  /* As long as the visitor hasn't manually picked a theme here, keep
     following their device's light/dark setting live (e.g. if it
     switches at sunset). The toggle below sets an explicit preference
     that overrides this from then on. */
  systemDark.addEventListener("change", (e) => {
    if (!localStorage.theme) applyTheme(e.matches);
  });

  themeToggle?.addEventListener("click", () => {
    applyTheme(!html.classList.contains("dark"));
  });

  /* Compact menu window (phones / tablets) */
  let menuIsOpen = false;
  function openMenu() {
    if (!menuWindow || menuIsOpen) return;
    window.SiteUI.announce("menu");
    menuIsOpen = true;
    menuWindow.hidden = false;
    if (menuScrim) menuScrim.hidden = false;
    requestAnimationFrame(() => {
      menuWindow.classList.add("open");
      menuScrim?.classList.add("open");
    });
    mobileBtn?.setAttribute("aria-expanded", "true");
    mobileBtn?.classList.add("is-open");
  }
  function closeMenu() {
    if (!menuWindow || !menuIsOpen) return;
    menuIsOpen = false;
    menuWindow.classList.remove("open");
    menuScrim?.classList.remove("open");
    mobileBtn?.setAttribute("aria-expanded", "false");
    mobileBtn?.classList.remove("is-open");
    setTimeout(() => {
      if (!menuIsOpen) {
        menuWindow.hidden = true;
        if (menuScrim) menuScrim.hidden = true;
      }
    }, 260);
  }
  mobileBtn?.addEventListener("click", () => (menuIsOpen ? closeMenu() : openMenu()));
  menuScrim?.addEventListener("click", closeMenu);
  menuWindow?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("ui:popover", (e) => { if (e.detail !== "menu") closeMenu(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeLightbox();
    }
  });

  const sections = ["home", "about", "research", "skills", "publications", "blog", "contact"];
  const navLinks = document.querySelectorAll(".nav-links a, .menu-window a[data-section]");

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav?.classList.toggle("scrolled", y > 24);
    backTop?.classList.toggle("visible", y > 480);

    let current = "home";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    }
    navLinks.forEach((a) => {
      const sec = a.getAttribute("data-section") || (a.getAttribute("href") || "").slice(1);
      a.classList.toggle("active", sec === current);
    });
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => revealObserver.observe(el));
  const observeReveals = (root) => (root || document).querySelectorAll(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));

  /* Stats counter */
  const stats = document.querySelectorAll(".stat strong[data-count]");
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isFloat = target % 1 !== 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = isFloat ? val.toFixed(2) : Math.round(val);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  stats.forEach((s) => statsObserver.observe(s));

  /* Contact form → Web3Forms (inbox delivery) */
  const form = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  const contactSubmit = document.getElementById("contact-submit");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value?.trim() || "";
    const email = document.getElementById("email")?.value?.trim() || "";
    const msg = document.getElementById("msg")?.value?.trim() || "";
    if (!name || !email || !msg) {
      if (contactStatus) {
        contactStatus.hidden = false;
        contactStatus.textContent = "Please fill in name, email, and message.";
        contactStatus.className = "contact-status is-err";
      }
      return;
    }
    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.dataset.label = contactSubmit.innerHTML;
      contactSubmit.textContent = "Sending…";
    }
    if (contactStatus) {
      contactStatus.hidden = false;
      contactStatus.textContent = "Sending your message…";
      contactStatus.className = "contact-status";
    }
    try {
      const data = new FormData(form);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        form.reset();
        if (contactStatus) {
          contactStatus.textContent = "Message sent. I’ll get back to you soon.";
          contactStatus.className = "contact-status is-ok";
        }
      } else {
        throw new Error(json.message || "Send failed");
      }
    } catch (err) {
      if (contactStatus) {
        contactStatus.textContent = "Could not send right now. Email me at hh.himel.m@gmail.com instead.";
        contactStatus.className = "contact-status is-err";
      }
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.innerHTML = contactSubmit.dataset.label || "Send message";
      }
    }
  });

  function handleResize() {
    if (window.innerWidth >= 1080) {
      closeMenu();
      if (mobileBtn) mobileBtn.style.display = "none";
    } else if (mobileBtn) {
      mobileBtn.style.display = "inline-flex";
    }
  }
  handleResize();
  window.addEventListener("resize", handleResize, { passive: true });

  /* ---------- Hero intro video ----------
     Wait for the page's own load event before this 2MB+ file starts
     downloading/playing, so it doesn't compete with fonts/CSS/JS for
     bandwidth during first paint — that contention is a common cause
     of a page that "feels laggy" right after it appears. */
  const video = document.getElementById("hero-video");
  if (video) {
    let pageLoaded = false;
    let wantsToPlay = false;
    const tryPlay = () => { if (pageLoaded && wantsToPlay) video.play().catch(() => {}); };
    window.addEventListener("load", () => { pageLoaded = true; tryPlay(); }, { once: true });

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          wantsToPlay = entry.isIntersecting;
          if (wantsToPlay) tryPlay();
          else video.pause();
        });
      },
      { threshold: 0.35 }
    );
    videoObserver.observe(video);
  }


  /* =========================================================
     BLOG — posts come from data/posts.json
     ========================================================= */
  const fmtDate = (iso) => {
    try { return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return iso; }
  };
  const blogGrid = document.getElementById("blog-grid");
  const featSlot = document.getElementById("blog-featured-slot");
  const blogEmpty = document.getElementById("blog-empty");
  const blogReader = document.getElementById("blog-reader");
  const blogReaderClose = document.getElementById("blog-reader-close");
  const readerShareBtn = document.getElementById("reader-share");
  const readerShareToast = document.getElementById("reader-share-toast");
  const blogFilters = document.querySelectorAll(".blog-filter");
  let posts = [];
  let postsById = {};
  let activeFilter = "all";
  let activePost = null;
  let readerReturnFocus = null;
  let toastTimer = null;

  /* remember the default tab title / description so we can restore them on close */
  const DEFAULT_TITLE = document.title;
  const metaDescEl = document.querySelector('meta[name="description"]');
  const DEFAULT_DESC = metaDescEl ? metaDescEl.getAttribute("content") : "";

  function postUrl(id) {
    return window.location.origin + window.location.pathname + window.location.search + "#post=" + encodeURIComponent(id);
  }
  function showShareToast(msg) {
    if (!readerShareToast) return;
    readerShareToast.textContent = msg;
    readerShareToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { readerShareToast.hidden = true; }, 2200);
  }

  const arrowSvg = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>';

  function featuredHTML(p) {
    return '<article class="blog-featured reveal" data-category="' + esc(p.category) + '" data-post="' + esc(p.id) + '" tabindex="0" role="button" aria-label="Read: ' + esc(p.title) + '">' +
      '<div class="blog-featured-media"><img src="' + esc(p.cover) + '" alt="" loading="lazy" width="800" height="500" /><span class="blog-tag">' + esc(p.tag || p.category) + "</span></div>" +
      '<div class="blog-featured-body"><div class="blog-meta"><time datetime="' + esc(p.date) + '">' + fmtDate(p.date) + "</time><span>·</span><span>" + esc(p.minutes) + " min read</span></div>" +
      "<h3>" + esc(p.title) + "</h3><p>" + esc(p.summary) + '</p><span class="blog-read-btn">Read article ' + arrowSvg + "</span></div></article>";
  }
  function cardHTML(p, i) {
    return '<article class="blog-card reveal" data-category="' + esc(p.category) + '" data-post="' + esc(p.id) + '" tabindex="0" role="button" aria-label="Read: ' + esc(p.title) + '" style="transition-delay:' + (i * 0.06).toFixed(2) + 's">' +
      '<div class="blog-card-media"><img src="' + esc(p.cover) + '" alt="" loading="lazy" width="600" height="400" /><span class="blog-tag">' + esc(p.tag || p.category) + "</span></div>" +
      '<div class="blog-card-body"><div class="blog-meta"><time datetime="' + esc(p.date) + '">' + fmtDate(p.date) + "</time><span>·</span><span>" + esc(p.minutes) + " min</span></div>" +
      "<h3>" + esc(p.title) + "</h3><p>" + esc(p.summary) + '</p><span class="blog-read-btn">Read more →</span></div></article>';
  }

  function applyBlogFilter() {
    let visible = 0;
    document.querySelectorAll("#blog .blog-card, #blog .blog-featured").forEach((card) => {
      const show = activeFilter === "all" || card.dataset.category === activeFilter;
      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    if (blogEmpty) blogEmpty.hidden = visible > 0;
  }

  function renderBlog(list) {
    posts = list.filter((p) => p && p.id && p.title).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    postsById = {};
    posts.forEach((p) => { postsById[p.id] = p; });
    if (!blogGrid) return;
    if (!posts.length) {
      if (featSlot) featSlot.innerHTML = "";
      blogGrid.innerHTML = '<p class="blog-note">No posts yet — check back soon.</p>';
      return;
    }
    const featured = posts.find((p) => p.featured) || posts[0];
    const rest = posts.filter((p) => p !== featured);
    if (featSlot) featSlot.innerHTML = featuredHTML(featured);
    blogGrid.innerHTML = rest.map(cardHTML).join("");
    observeReveals(document.getElementById("blog"));
    applyBlogFilter();
  }

  blogFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter || "all";
      blogFilters.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      applyBlogFilter();
    });
  });

  /* open a post from any card / button inside #blog */
  const blogSection = document.getElementById("blog");
  blogSection?.addEventListener("click", (e) => {
    const t = e.target.closest("[data-post]");
    if (t) openPost(t.dataset.post);
  });
  blogSection?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest("[data-post]");
    if (t && t === e.target) { e.preventDefault(); openPost(t.dataset.post); }
  });

  function openPost(id, opts) {
    const push = !opts || opts.push !== false;
    const p = postsById[id];
    if (!p || !blogReader) return;
    readerReturnFocus = document.activeElement;
    document.getElementById("reader-meta").textContent = fmtDate(p.date) + " · " + p.minutes + " min read · " + (p.tag || p.category);
    document.getElementById("reader-title").textContent = p.title;
    const cover = document.getElementById("reader-cover");
    const wrap = document.getElementById("reader-cover-wrap");
    if (p.cover) { cover.src = p.cover; cover.alt = p.title; if (wrap) wrap.hidden = false; }
    else if (wrap) wrap.hidden = true;

    const videoWrap = document.getElementById("reader-video-wrap");
    const videoEl = document.getElementById("reader-video");
    if (videoWrap && videoEl) {
      if (p.video) {
        videoEl.src = p.video;
        videoEl.poster = p.cover || "";
        videoWrap.hidden = false;
      } else {
        videoEl.removeAttribute("src");
        videoWrap.hidden = true;
      }
    }

    document.getElementById("reader-body").innerHTML = p.body || "";

    const galleryEl = document.getElementById("reader-gallery");
    if (galleryEl) {
      galleryEl.innerHTML = Array.isArray(p.gallery) && p.gallery.length
        ? p.gallery.map((src) => '<a href="' + esc(src) + '" target="_blank" rel="noopener"><img src="' + esc(src) + '" alt="" loading="lazy" /></a>').join("")
        : "";
      galleryEl.hidden = !galleryEl.innerHTML;
    }

    /* previous / next, in the same order as the grid (newest first) */
    const pagerEl = document.getElementById("reader-pager");
    if (pagerEl) {
      const idx = posts.findIndex((post) => post.id === id);
      const prev = idx > 0 ? posts[idx - 1] : null; // newer
      const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null; // older
      const link = (post, dir) =>
        post
          ? '<a class="reader-pager-link reader-pager-' + dir + '" data-post="' + esc(post.id) + '">' +
            '<span class="reader-pager-dir">' + (dir === "prev" ? "&larr; Newer" : "Older &rarr;") + "</span>" +
            '<span class="reader-pager-title">' + esc(post.title) + "</span></a>"
          : '<span class="reader-pager-link reader-pager-' + dir + ' reader-pager-empty"></span>';
      pagerEl.innerHTML = prev || next ? link(prev, "prev") + link(next, "next") : "";
    }
    activePost = id;
    loadGiscusComments(id);
    blogReader.hidden = false;
    blogReader.scrollTop = 0;
    requestAnimationFrame(() => blogReader.classList.add("open"));
    window.SiteUI.lock("blog");
    blogReaderClose?.focus({ preventScroll: true });

    /* shareable deep link + tab title, so a post can be linked/bookmarked directly */
    document.title = p.title + " — Habib Hasan Himel";
    if (metaDescEl && p.summary) metaDescEl.setAttribute("content", p.summary);
    if (push) history.pushState({ postId: id }, "", "#post=" + encodeURIComponent(id));
  }
  function closePost(opts) {
    const push = !opts || opts.push !== false;
    if (!blogReader || !blogReader.classList.contains("open")) return;
    blogReader.classList.remove("open");
    window.SiteUI.unlock("blog");
    activePost = null;
    setTimeout(() => { if (!blogReader.classList.contains("open")) blogReader.hidden = true; }, 300);
    if (readerReturnFocus && readerReturnFocus.focus) readerReturnFocus.focus({ preventScroll: true });
    document.title = DEFAULT_TITLE;
    if (metaDescEl) metaDescEl.setAttribute("content", DEFAULT_DESC);
    if (push && /^#post=/.test(location.hash)) history.pushState(null, "", location.pathname + location.search);
  }
  document.getElementById("reader-pager")?.addEventListener("click", (e) => {
    const link = e.target.closest(".reader-pager-link[data-post]");
    if (link) openPost(link.dataset.post);
  });
  blogReaderClose?.addEventListener("click", () => closePost());
  blogReader?.addEventListener("click", (e) => { if (e.target === blogReader) closePost(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePost(); });

  /* back/forward button support for the deep-linked post */
  window.addEventListener("popstate", (e) => {
    const id = e.state && e.state.postId;
    if (id && postsById[id]) openPost(id, { push: false });
    else closePost({ push: false });
  });

  /* share the currently open post: native share sheet, or copy the link */
  readerShareBtn?.addEventListener("click", async () => {
    if (!activePost) return;
    const p = postsById[activePost];
    const url = postUrl(activePost);
    if (navigator.share) {
      try { await navigator.share({ title: p.title, text: p.summary, url }); }
      catch (e) { /* user cancelled the share sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showShareToast("Link copied");
    } catch (e) {
      showShareToast("Couldn't copy — copy the address bar link instead");
    }
  });

  /* ---- real comments, via Giscus (GitHub Discussions — free) ----
     Configured for hhhimel/portfolio (category "General"); edit the IDs below if you change repo (from https://giscus.app
     after enabling Discussions on your repo), or comments stay hidden. */
  const GISCUS = {
    repo: "hhhimel/portfolio",
    repoId: "R_kgDOUqoRpg",
    category: "General",
    categoryId: "DIC_kwDOUqoRps4DGj4b",
  };
  function loadGiscusComments(postId) {
    const box = document.getElementById("giscus-container");
    if (!box) return;
    if (GISCUS.repo.startsWith("YOUR_")) {
      box.innerHTML = '<p class="blog-note">Comments aren\'t set up yet — see the README for the two-minute Giscus setup.</p>';
      return;
    }
    box.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", GISCUS.repo);
    script.setAttribute("data-repo-id", GISCUS.repoId);
    script.setAttribute("data-category", GISCUS.category);
    script.setAttribute("data-category-id", GISCUS.categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", postId);
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", document.documentElement.classList.contains("dark") ? "dark_dimmed" : "light");
    script.setAttribute("data-lang", "en");
    box.appendChild(script);
  }
  /* keep an open Giscus thread's theme in sync with the site's own toggle */
  themeToggle?.addEventListener("click", () => {
    const frame = document.querySelector("#giscus-container iframe.giscus-frame");
    if (frame) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: document.documentElement.classList.contains("dark") ? "dark_dimmed" : "light" } } },
        "https://giscus.app"
      );
    }
  });

  /* ---- load posts ---- */
  fetch("data/posts.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .catch((err) => {
      if (Array.isArray(window.SITE_POSTS)) return window.SITE_POSTS;   // optional inline fallback
      throw err;
    })
    .then(renderBlog)
    .then(() => {
      /* opened directly via a shared #post=<id> link */
      const m = /^#post=(.+)$/.exec(location.hash);
      if (m) {
        const id = decodeURIComponent(m[1]);
        if (postsById[id]) openPost(id, { push: false });
      }
    })
    .catch((err) => {
      console.warn("posts.json load failed", err);
      if (blogGrid) blogGrid.innerHTML = '<p class="blog-note">Posts could not be loaded right now. Please refresh, or try again in a moment.</p>';
    });

  /* Photo lightbox — tap avatar for full / passport-size view */
  const photoLb = document.getElementById("photo-lb");
  const avatarOpen = document.getElementById("avatar-open");
  const photoLbClose = document.getElementById("photo-lb-close");
  function openPhotoLb() {
    if (!photoLb) return;
    photoLb.hidden = false;
    requestAnimationFrame(() => photoLb.classList.add("open"));
    window.SiteUI?.lock("photo");
  }
  function closePhotoLb() {
    if (!photoLb) return;
    photoLb.classList.remove("open");
    setTimeout(() => { photoLb.hidden = true; }, 220);
    window.SiteUI?.unlock("photo");
  }
  avatarOpen?.addEventListener("click", openPhotoLb);
  photoLbClose?.addEventListener("click", closePhotoLb);
  photoLb?.addEventListener("click", (e) => { if (e.target === photoLb) closePhotoLb(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && photoLb?.classList.contains("open")) closePhotoLb();
  });

})();
