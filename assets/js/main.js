(() => {
  // ===== Kakao link single-source =====
  // 나중에 실제 카카오 채널로 바꿀 때 여기만 수정하면 전체 적용됩니다.
  const KAKAO_URL = "https://pf.kakao.com/_qUgkn";
  document.querySelectorAll("[data-kakao-link]").forEach(a => {
    a.setAttribute("href", KAKAO_URL);
  });

  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // close menu on link click (mobile)
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        if (menu.classList.contains("is-open")) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // Hero slider (6 slides) + zoom animation
  const hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    const track = hero.querySelector("[data-hero-track]");
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dotsWrap = hero.querySelector("[data-hero-dots]");
    const prevBtn = hero.querySelector("[data-hero-prev]");
    const nextBtn = hero.querySelector("[data-hero-next]");

    let idx = 0;
    let timer = null;
    const intervalMs = 4500;

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hero-dot" + (i === idx ? " active" : "");
        b.addEventListener("click", () => go(i));
        dotsWrap.appendChild(b);
      });
    };

    const restartZoom = (slideEl) => {
      const bg = slideEl.querySelector(".hero-slide-bg");
      if (!bg) return;
      bg.style.animation = "none";
      void bg.offsetHeight; // reflow
      bg.style.animation = "";
    };

    const go = (i) => {
      idx = (i + slides.length) % slides.length;

      slides.forEach((s, si) => s.classList.toggle("is-active", si === idx));
      if (track) track.style.transform = `translateX(${-idx * (100 / slides.length)}%)`;

      restartZoom(slides[idx]);
      renderDots();
    };

    const start = () => {
      stop();
      timer = setInterval(() => go(idx + 1), intervalMs);
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    prevBtn?.addEventListener("click", () => { go(idx - 1); start(); });
    nextBtn?.addEventListener("click", () => { go(idx + 1); start(); });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    renderDots();
    go(0);
    start();
  }

  // Before/After slider
  const ba = document.querySelector("[data-ba]");
  if (ba) {
    const range = ba.querySelector("[data-ba-range]");
    const mask = ba.querySelector("[data-ba-mask]");
    const handle = ba.querySelector("[data-ba-handle]");

    const set = (v) => {
      const pct = Math.max(0, Math.min(100, Number(v)));
      mask.style.width = pct + "%";
      handle.style.left = pct + "%";
    };

    if (range && mask && handle) {
      set(range.value);
      range.addEventListener("input", (e) => set(e.target.value));
    }
  }

  // Portfolio lightbox (dummy)
  const gallery = document.querySelector("[data-gallery]");
  const lightbox = document.querySelector("[data-lightbox]");
  if (gallery && lightbox) {
    const titleEl = lightbox.querySelector("[data-lightbox-title]");
    const imgEl = lightbox.querySelector("[data-lightbox-img]");
    const closeEls = lightbox.querySelectorAll("[data-lightbox-close]");

    const open = (title) => {
      titleEl.textContent = title;
      imgEl.style.background =
        "linear-gradient(135deg, rgba(17,58,46,.12), rgba(15,23,42,.08))";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    };

    gallery.addEventListener("click", (e) => {
      const btn = e.target.closest(".gallery-item");
      if (!btn) return;
      open(btn.getAttribute("data-img") || "포트폴리오");
    });

    closeEls.forEach(el => el.addEventListener("click", close));
    window.addEventListener("keydown", (e) => {
      if (!lightbox.hidden && e.key === "Escape") close();
    });
  }

// Reviews slider
const slider = document.querySelector("[data-slider]");
if (slider) {
  const track = slider.querySelector("[data-track]");
  const prev = slider.querySelector("[data-prev]");
  const next = slider.querySelector("[data-next]");
  const dotsWrap = slider.querySelector("[data-dots]");
  const pages = Array.from(track?.children || []);
  let idx = 0;
  const total = pages.length;

  const renderDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    pages.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === idx ? " active" : "");
      b.setAttribute("aria-label", `${i + 1}번째 후기`);
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });
  };

const go = (i) => {
  idx = (i + total) % total;
  track.style.transform = `translateX(${-idx * 100}%)`;
  
  renderDots();
};

// 초기 위치도 맞춰서 go(0) 호출 전 한 번 세팅

  prev?.addEventListener("click", () => go(idx - 1));
  next?.addEventListener("click", () => go(idx + 1));

  renderDots();
  go(0);
  window.addEventListener("resize", () => go(idx));

  let autoTimer = null;
  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => go(idx + 1), 2000);
  };
  const stopAuto = () => {
    clearInterval(autoTimer);
    autoTimer = null;
  };

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);
  startAuto();
}
    // Scroll reveal (slide up + fade, once per page load)
  (() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");
        // 한 번만: 다시 스크롤 올라갔다 내려와도 재실행 X
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      // 조금 일찍 트리거(자연스럽게)
      rootMargin: "0px 0px -10% 0px",
    });

    const addReveal = (el, delayMs = 0) => {
      if (!el || el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${delayMs}ms`);
      observer.observe(el);
    };

    const addGroup = (selector, stepMs = 70, capMs = 420) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      nodes.forEach((el, i) => addReveal(el, Math.min(i * stepMs, capMs)));
    };

    // === 단일/섹션 단위(타이틀/블록) ===
    addGroup(".section-head", 0, 0);
    addGroup(".feature-panels .panel", 80, 160);
    addGroup(".about .about-copy", 0, 0);
    addGroup(".change .ba-wrap", 0, 0);
    addGroup(".portfolio .gallery", 0, 0);
    addGroup(".reviews .review-slider", 0, 0);
    addGroup(".site-footer .footer-inner", 0, 0);

    // === 반복 카드/아이템(스태거) ===
    addGroup(".stats .stat", 90, 270);
    addGroup(".card-grid .card", 80, 400);
    addGroup(".gallery .gallery-item", 80, 320);
    addGroup(".steps .step", 90, 360);

    addGroup(".work-links .work-card", 0, 0);
    addGroup(".work-links .link-btn", 80, 240);
  })();
    // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector("[data-faq-q]");
    const a = item.querySelector("[data-faq-a]");
    if (!q || !a) return;

    q.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      // 단일 오픈(원하면 아래 3줄 제거하면 다중오픈 가능)
      document.querySelectorAll(".faq-item[data-open='true']").forEach((x) => {
        if (x !== item) { x.setAttribute("data-open", "false"); x.querySelector("[data-faq-a]")?.setAttribute("hidden", ""); }
      });

      item.setAttribute("data-open", String(!isOpen));
      if (isOpen) a.setAttribute("hidden", "");
      else a.removeAttribute("hidden");
    });
  });

    // Stats count-up (once per page load, when visible)
  (() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const els = Array.from(document.querySelectorAll(".stats .stat-num"));
    if (!els.length) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      if (el.dataset.counted === "1") return;
      const original = (el.textContent || "").trim();

      // 숫자(콤마 포함) 추출
      const m = original.match(/-?[\d,]+(\.\d+)?/);
      if (!m) return;

      const raw = m[0];
      const target = Number(raw.replace(/,/g, ""));
      if (!Number.isFinite(target)) return;

      const prefix = original.slice(0, m.index);
      const suffix = original.slice((m.index ?? 0) + raw.length);

      const isInt = Number.isInteger(target);
      const duration = 1200;
      const start = performance.now();
      el.dataset.counted = "1";

      const fmt = (v) => {
        const val = isInt ? Math.round(v) : Number(v.toFixed(1));
        const num = isInt ? val.toLocaleString("ko-KR") : val.toLocaleString("ko-KR");
        return `${prefix}${num}${suffix}`;
      };

      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(p);
        const cur = target * eased;
        el.textContent = fmt(cur);

        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target); // 마감 보정
      };

      // 시작값
      el.textContent = fmt(0);
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target); // 1회만
        }
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });

    els.forEach((el) => io.observe(el));
  })();
})();