/* ============================================================
   Rashedul portfolio — script.js
   Vanilla JS. No frameworks.
============================================================ */
(() => {
  "use strict";

  /* ---------- Boot screen ---------- */
  const boot = document.getElementById("boot");
  window.addEventListener("load", () => {
    setTimeout(() => boot && boot.classList.add("is-done"), 1300);
    setTimeout(() => boot && boot.remove(), 1900);
  });

  /* ---------- Year ---------- */
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Typed hero role ---------- */
  const phrases = [
    "SQA Engineer · breaking systems to build better ones",
    "Selenium · Appium · automation pipelines",
    "Full‑stack: React, Node.js, FastAPI, Flutter",
    "Quality is a habit, not a phase.",
  ];
  const typedEl = document.getElementById("typed");
  if (typedEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let i = 0, j = 0, deleting = false;
    const tick = () => {
      const cur = phrases[i];
      typedEl.textContent = cur.slice(0, j);
      if (!deleting && j < cur.length) { j++; setTimeout(tick, 38 + Math.random() * 30); }
      else if (deleting && j > 0)      { j--; setTimeout(tick, 18); }
      else {
        if (!deleting) { deleting = true; setTimeout(tick, 1500); }
        else { deleting = false; i = (i + 1) % phrases.length; setTimeout(tick, 250); }
      }
    };
    tick();
  } else if (typedEl) {
    typedEl.textContent = phrases[0];
  }

  /* ---------- Theme toggle (retro / modern) ---------- */
  const html = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const stored = localStorage.getItem("rashedul.theme");
  if (stored) html.setAttribute("data-theme", stored);
  const updateThemeLabel = () => {
    if (!themeBtn) return;
    const t = html.getAttribute("data-theme") || "retro";
    const lbl = themeBtn.querySelector(".iconbtn__label");
    if (lbl) lbl.textContent = t.toUpperCase();
  };
  updateThemeLabel();
  themeBtn?.addEventListener("click", () => {
    const next = (html.getAttribute("data-theme") === "modern") ? "retro" : "modern";
    html.setAttribute("data-theme", next);
    localStorage.setItem("rashedul.theme", next);
    updateThemeLabel();
    beep(next === "modern" ? 880 : 440, 0.05);
  });

  /* ---------- Sound (subtle, muted by default) ---------- */
  let audioOn = false;
  let audioCtx = null;
  const soundBtn = document.getElementById("soundToggle");
  soundBtn?.addEventListener("click", () => {
    audioOn = !audioOn;
    soundBtn.setAttribute("aria-pressed", String(audioOn));
    soundBtn.style.color = audioOn ? "var(--neon-green)" : "";
    if (audioOn) beep(660, 0.06);
  });
  function beep(freq = 600, dur = 0.04) {
    if (!audioOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "square"; o.frequency.value = freq;
      g.gain.value = 0.03;
      o.connect(g).connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    } catch (_) { /* ignore */ }
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("a, .btn, .iconbtn, .ai__suggest button, .ai__form button")) beep(720, 0.025);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(
    ".section, .tl, .skillcard, .proj, .badge, .terminal, .hero__stats"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "-40px 0px", threshold: 0.05 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Contact form (client-side only, opens mail) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      status.textContent = "✗ all fields are required.";
      status.className = "form__status err"; return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "✗ invalid email.";
      status.className = "form__status err"; return;
    }
    const subject = encodeURIComponent(`portfolio.contact // ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.location.href = `mailto:thisisrashedul@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = "✓ launching your mail client…";
    status.className = "form__status ok";
  });

  /* ---------- AI assistant ---------- */
  const aiOpen = document.getElementById("aiOpen");
  const aiClose = document.getElementById("aiClose");
  const aiPanel = document.getElementById("aiPanel");
  const aiLog = document.getElementById("aiLog");
  const aiForm = document.getElementById("aiForm");
  const aiInput = document.getElementById("aiInput");
  const aiSuggest = document.getElementById("aiSuggest");

  const open = () => {
    aiPanel.hidden = false;
    aiOpen.setAttribute("aria-expanded", "true");
    setTimeout(() => aiInput.focus(), 50);
    if (!aiLog.dataset.greeted) {
      botSay(
        "hi — i'm rashedul's assistant. ask me about <b>skills</b>, <b>projects</b>, <b>experience</b>, <b>education</b>, or <b>contact</b>. try a quick chip below."
      );
      aiLog.dataset.greeted = "1";
    }
  };
  const close = () => {
    aiPanel.hidden = true;
    aiOpen.setAttribute("aria-expanded", "false");
  };
  aiOpen?.addEventListener("click", () => (aiPanel.hidden ? open() : close()));
  aiClose?.addEventListener("click", close);

  // Slash key opens assistant
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      e.preventDefault(); open();
    }
    if (e.key === "Escape" && !aiPanel.hidden) close();
  });

  aiSuggest?.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-q]");
    if (!b) return;
    handleQuery(b.dataset.q);
  });

  aiForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = aiInput.value.trim();
    if (!q) return;
    aiInput.value = "";
    handleQuery(q);
  });

  function youSay(html) {
    const m = document.createElement("div");
    m.className = "ai__msg ai__msg--you";
    m.innerHTML = escapeHTML(html);
    aiLog.appendChild(m);
    aiLog.scrollTop = aiLog.scrollHeight;
  }
  function botSay(html) {
    const m = document.createElement("div");
    m.className = "ai__msg ai__msg--bot";
    m.innerHTML = html;
    aiLog.appendChild(m);
    aiLog.scrollTop = aiLog.scrollHeight;
  }
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  function handleQuery(raw) {
    const q = raw.toLowerCase().trim();
    youSay(raw);
    setTimeout(() => botSay(answer(q)), 280);
  }

  function answer(q) {
    if (/(skill|stack|tech|tool)/.test(q)) {
      return `core stack:
        <ul>
          <li><b>QA &amp; automation</b> — Selenium, Appium, test design</li>
          <li><b>backend</b> — Node.js, Express, FastAPI</li>
          <li><b>frontend</b> — React, Flutter, Tailwind, HTML/CSS</li>
          <li><b>languages</b> — JavaScript, Python, Dart, Java</li>
          <li><b>data</b> — MongoDB, MySQL</li>
        </ul>`;
    }
    if (/(project|portfolio|work|build|app)/.test(q)) {
      return `three featured products:
        <ul>
          <li><b>TutorHub</b> — Flutter + Node + Mongo, geo‑proximity tutoring.</li>
          <li><b>Country Visitor</b> — React app to track travel history. <a href="https://my-traveling-countries.netlify.app/" target="_blank" rel="noopener">live</a></li>
          <li><b>English by Janala</b> — vocabulary lessons + audio playback.</li>
        </ul>
        scroll to <a href="#projects">build.archive</a> for full case studies.`;
    }
    if (/(experience|job|work|career|company|bitmorpher|nazihar|nazir)/.test(q)) {
      return `career.log:
        <ul>
          <li><b>SQA Engineer · Bitmorpher Limited</b> (2026 — present) — Selenium &amp; Appium automation, defect pipelines.</li>
          <li><b>SE Intern · Nazihar IT</b> (07/25–09/25) — Java / Spring Boot / MySQL on Temenos T24 core‑banking.</li>
        </ul>`;
    }
    if (/(edu|study|degree|university|school|cgpa)/.test(q)) {
      return `B.Sc. in Computing &amp; Information Systems — Daffodil International University (2020–2025). HSC (Science) — Mohammadpur Model School &amp; College.`;
    }
    if (/(cert|course|achiev|badge)/.test(q)) {
      return `notable certs: AI/ML Expert (Phitron), Complete Web Development (Programming‑Hero), Flutter &amp; Dart (Udemy), Data Science with Python, C for Everyone, Business English. see <a href="#certs">achievements.unlock</a>.`;
    }
    if (/(contact|email|reach|hire|phone|linkedin|github)/.test(q)) {
      return `open a channel:
        <ul>
          <li>email — <a href="mailto:thisisrashedul@gmail.com">thisisrashedul@gmail.com</a></li>
          <li>phone — <a href="tel:+8801794876373">+880 1794 876 373</a></li>
          <li>github — <a href="https://github.com/Rashedul98" target="_blank" rel="noopener">github.com/Rashedul98</a></li>
          <li>linkedin — <a href="https://www.linkedin.com/in/thisisrashedul1998" target="_blank" rel="noopener">/in/thisisrashedul1998</a></li>
        </ul>`;
    }
    if (/(location|where|city|country)/.test(q)) {
      return `📍 Dhaka, Bangladesh — Mirpur‑1, Technical Road.`;
    }
    if (/(name|who)/.test(q)) {
      return `Muhammad Rashedul Islam — SQA Engineer &amp; full‑stack builder.`;
    }
    if (/(fun|surprise|joke|easter)/.test(q)) {
      konami(); // trigger a small visual gift
      return `secret unlocked. try the <kbd>↑ ↑ ↓ ↓ ← → ← →</kbd> sequence anywhere on the page. also: hover the project cards 👀`;
    }
    if (/(theme|dark|light|mode)/.test(q)) {
      return `tap <b>RETRO/MODERN</b> in the top bar to switch palettes.`;
    }
    if (/(help|hi|hello|hey|what)/.test(q)) {
      return `try: <i>"what are his skills?"</i>, <i>"show projects"</i>, <i>"experience?"</i>, <i>"how to contact?"</i>.`;
    }
    return `i don't have that on file yet. try one of the chips above, or ask about <b>skills</b>, <b>projects</b>, <b>experience</b>, or <b>contact</b>.`;
  }

  /* ---------- Easter egg: Konami code ---------- */
  const konamiSeq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"];
  let kIdx = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === konamiSeq[kIdx]) {
      kIdx++;
      if (kIdx === konamiSeq.length) { kIdx = 0; konami(); }
    } else { kIdx = 0; }
  });
  function konami() {
    document.documentElement.animate(
      [
        { filter: "hue-rotate(0deg)" },
        { filter: "hue-rotate(360deg)" },
      ],
      { duration: 1600, iterations: 1 }
    );
    const t = document.createElement("div");
    t.textContent = "// cheat code accepted — quality++";
    Object.assign(t.style, {
      position: "fixed", left: "50%", top: "20%", transform: "translateX(-50%)",
      padding: "10px 14px", borderRadius: "10px", zIndex: 999,
      fontFamily: "var(--mono)", color: "#04121a",
      background: "linear-gradient(135deg, var(--neon-green), var(--neon-blue))",
      boxShadow: "0 20px 60px -10px rgba(0,255,163,.5)"
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
    beep(880, 0.08); setTimeout(() => beep(1320, 0.1), 120);
  }
})();
