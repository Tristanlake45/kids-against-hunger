/* ==============================
   assets/js/main.js (FIXED)
============================== */

async function loadPartials() {
  const headerMount = document.querySelector("[data-include='header']");
  const footerMount = document.querySelector("[data-include='footer']");
  const tasks = [];

  const fetchText = async (rel) => {
    const url = new URL(rel, document.baseURI).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed ${rel}: ${res.status}`);
    return res.text();
  };

  if (headerMount) tasks.push(fetchText("partials/header.html").then(html => headerMount.innerHTML = html));
  if (footerMount) tasks.push(fetchText("partials/footer.html").then(html => footerMount.innerHTML = html));

  await Promise.all(tasks);
}

/* Reveal */
function initScrollReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!revealEls.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));
}

/* Count up */
function countUp(el, to, duration = 1200) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    el.textContent = to.toLocaleString();
    return;
  }

  const start = performance.now();
  const from = 0;

  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(from + (to - from) * eased);
    el.textContent = val.toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function initCountUps() {
  const statEls = document.querySelectorAll("[data-count]");
  if (!statEls.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const to = parseInt(entry.target.dataset.count, 10);
        if (!Number.isNaN(to)) countUp(entry.target, to);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach(el => io.observe(el));
}

function replayStats() {
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target)) return;
    el.textContent = "0";
    countUp(el, target, 1200);
  });
}

function initReplayOnImpactClick() {
  const impact = document.getElementById("impact-stats");
  if (!impact) return;

  impact.addEventListener("click", replayStats);
  impact.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      replayStats();
    }
  });
}

/* ✅ Lightbox (fixed) */
function initGalleryLightbox() {
  const gallery = document.querySelector('[data-gallery="kah"]');
  if (!gallery) return;

  const items = Array.from(gallery.querySelectorAll(".photo-card"));
  if (!items.length) return;

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbMeta = document.getElementById("lightboxMeta");
  if (!lb || !lbImg || !lbMeta) return;

  let index = 0;

  const setOpen = (open) => {
    if (open) {
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } else {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      lbImg.src = "";
      document.body.style.overflow = "";
    }
  };

  const show = (i) => {
    index = (i + items.length) % items.length;
    const btn = items[index];
    const full = btn.getAttribute("data-full");
    const alt = btn.querySelector("img")?.alt || "Photo";
    lbImg.src = full;
    lbImg.alt = alt;
    lbMeta.textContent = `${index + 1} / ${items.length}`;
    setOpen(true);
  };

  const next = () => show(index + 1);
  const prev = () => show(index - 1);

  // ✅ delegation ensures clicks always work
  gallery.addEventListener("click", (e) => {
    const btn = e.target.closest(".photo-card");
    if (!btn) return;
    const i = items.indexOf(btn);
    if (i >= 0) show(i);
  });

  // close buttons/backdrop
  lb.addEventListener("click", (e) => {
    if (e.target.closest("[data-lb-close]")) setOpen(false);
  });

  lb.querySelector("[data-lb-next]")?.addEventListener("click", next);
  lb.querySelector("[data-lb-prev]")?.addEventListener("click", prev);

  window.addEventListener("keydown", (e) => {
    if (lb.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  // toggle button
  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("nav-open");
    setOpen(!isOpen);
  });

  // close when clicking a link
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) setOpen(false);
  });

  // close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const clickedInside = e.target.closest(".site-header");
    if (!clickedInside) setOpen(false);
  });

  // if you rotate/resize to desktop, force close
  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) setOpen(false);
  });
}

function markLoadedForHero() {
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));
}

(async function main() {
  await loadPartials();
  initScrollReveal();
  initMobileNav();
  initCountUps();
  initReplayOnImpactClick();
  initGalleryLightbox();
  markLoadedForHero();
})();