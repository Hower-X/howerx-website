
// =========================
// 0) Header: transparent on hero, sticky after scroll
// =========================
const header = document.getElementById("siteHeader");
const stickyTrigger = document.getElementById("stickyTrigger");

if (header && stickyTrigger) {
  const stickyObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // When trigger is visible, we're still near top => not sticky
        if (entry.isIntersecting) header.classList.remove("is-sticky");
        else header.classList.add("is-sticky");
      });
    },
    { threshold: 0.01 }
  );
  stickyObs.observe(stickyTrigger);
}

// =========================
// 1) Mobile menu toggle
// =========================
const hamburger = document.getElementById("hamburger");
const drawer = document.getElementById("mobileDrawer");

function setDrawer(open){
  if (!drawer || !hamburger) return;
  drawer.style.display = open ? "block" : "none";
  hamburger.setAttribute("aria-expanded", open ? "true" : "false");
}

if (hamburger && drawer){
  hamburger.addEventListener("click", () => {
    const open = drawer.style.display === "block";
    setDrawer(!open);
  });

  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => setDrawer(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) setDrawer(false);
  });
}

// =========================
// 2) Active nav highlight on scroll
// =========================
const navLinks = [...document.querySelectorAll(".nav-pill .nav-link")];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove("is-active"));
      const active = navLinks.find(l => l.getAttribute("href") === `#${entry.target.id}`);
      if (active) active.classList.add("is-active");
    }
  });
}, { threshold: 0.55 });

sections.forEach(sec => sectionObserver.observe(sec));

// =========================
// 3) Contact form - AJAX submit (Formspree)
// =========================
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

// Replace with your Formspree endpoint, e.g. https://formspree.io/f/abcdwxyz
const FORMSPREE_ENDPOINT = "https://formspree.io/f/XXXXYYYY";

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!FORMSPREE_ENDPOINT.includes("formspree.io/f/") || FORMSPREE_ENDPOINT.includes("XXXX")) {
      statusEl.textContent = "⚠️ Please set your Formspree endpoint in main.js (FORMSPREE_ENDPOINT).";
      return;
    }

    statusEl.textContent = "Sending…";
    const formData = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "✅ Message sent! We’ll get back to you shortly.";
      } else {
        statusEl.textContent = "⚠️ Something went wrong. Please email us directly.";
      }
    } catch (err) {
      statusEl.textContent = "⚠️ Network error. Please try again or email us directly.";
    }
  });
}

// =========================
// 4) Footer year
// =========================
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// =========================
// 5) HERO CANVAS: Dotted Network (Blue theme)
// =========================
(function heroNetwork(){
  const canvas = document.getElementById("heroCanvas");
  const wrap = document.getElementById("heroWrap");
  if (!canvas || !wrap) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let rafId;
  const mouse = { x: null, y: null };

  const CONFIG = {
    density: 18000,
    maxSpeed: 0.38,
    linkDistance: 150,
    mouseLinkDistance: 200,
    rMin: 1.1,
    rMax: 2.6,
    lineAlpha: 0.18,
    dotAlpha: 0.92,
    glow: 16,
    hubChance: 0.12
  };

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.max(1, Math.floor(wrap.clientWidth));
    h = Math.max(1, Math.floor(wrap.clientHeight));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(45, Math.min(120, Math.floor((w*h) / CONFIG.density)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random()*2 - 1) * CONFIG.maxSpeed,
      vy: (Math.random()*2 - 1) * CONFIG.maxSpeed,
      r: CONFIG.rMin + Math.random() * (CONFIG.rMax - CONFIG.rMin),
      hub: Math.random() < CONFIG.hubChance
    }));
  }

  function drawWash(){
    const g = ctx.createRadialGradient(w*0.25, h*0.25, 80, w*0.55, h*0.55, Math.max(w,h));
    g.addColorStop(0, "rgba(27,140,255,0.22)");
    g.addColorStop(0.55, "rgba(102,227,255,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function step(){
    ctx.clearRect(0, 0, w, h);
    drawWash();

    for (const p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }

    // links
    for (let i=0; i<particles.length; i++){
      for (let j=i+1; j<particles.length; j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < CONFIG.linkDistance){
          const alpha = (1 - dist / CONFIG.linkDistance) * CONFIG.lineAlpha;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = (a.hub || b.hub) ? 1.35 : 1.0;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // mouse interactive rails
    if (mouse.x !== null && mouse.y !== null){
      for (const p of particles){
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONFIG.mouseLinkDistance){
          const alpha = (1 - dist / CONFIG.mouseLinkDistance) * 0.20;
          ctx.strokeStyle = `rgba(102,227,255,${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // dots with glow
    for (const p of particles){
      ctx.save();
      ctx.globalAlpha = CONFIG.dotAlpha;
      ctx.shadowBlur = p.hub ? CONFIG.glow * 1.25 : CONFIG.glow;
      ctx.shadowColor = p.hub ? "rgba(27,140,255,0.55)" : "rgba(102,227,255,0.40)";
      ctx.fillStyle = p.hub ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.86)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.hub ? p.r*1.6 : p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(step);
  }

  function onMouseMove(e){
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onMouseLeave(){ mouse.x = null; mouse.y = null; }

  function onVisibility(){
    if (document.hidden) cancelAnimationFrame(rafId);
    else step();
  }

  window.addEventListener("resize", resize, { passive:true });
  window.addEventListener("mousemove", onMouseMove, { passive:true });
  window.addEventListener("mouseleave", onMouseLeave, { passive:true });
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  step();
})();
