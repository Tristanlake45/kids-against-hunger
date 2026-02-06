async function loadPartials() {
  const headerMount = document.querySelector("[data-include='header']");
  const footerMount = document.querySelector("[data-include='footer']");

  const tasks = [];

  if (headerMount) {
    tasks.push(
      fetch("/partials/header.html")
        .then(r => {
          if (!r.ok) throw new Error(`Header fetch failed: ${r.status}`);
          return r.text();
        })
        .then(html => headerMount.innerHTML = html)
    );
  }

  if (footerMount) {
    tasks.push(
      fetch("/partials/footer.html")
        .then(r => {
          if (!r.ok) throw new Error(`Footer fetch failed: ${r.status}`);
          return r.text();
        })
        .then(html => footerMount.innerHTML = html)
    );
  }

  await Promise.all(tasks);

  // highlight current page (optional polish)
  const path = location.pathname;
  document.querySelectorAll(".nav-link").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    // compare normalized paths (handles /about/ etc.)
    const normalizedHref = href.endsWith("/") ? href : href + "/";
    if (path === normalizedHref || path.startsWith(normalizedHref)) {
      a.style.color = "rgba(17,17,17,1)";
    }
  });
}
  
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
      // smoother finish
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
  
  function markLoadedForHero() {
    // triggers CSS stagger
    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
    });
  }
  
  (async function main() {
    await loadPartials();
    initScrollReveal();
    initCountUps();
    markLoadedForHero();
  })();