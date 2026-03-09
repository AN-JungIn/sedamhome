(() => {
  "use strict";

  // =========================
  // Global constants
  // =========================
  const KAKAO_URL = "https://pf.kakao.com/_qUgkn";

  // =========================
  // Helpers
  // =========================
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

  const isInteractive = (t) =>
    t?.closest?.("a,button,input,textarea,select,label");

  // =========================
  // Kakao link single-source
  // =========================
  try {
    document.querySelectorAll("[data-kakao-link]").forEach((a) => {
      a.setAttribute("href", KAKAO_URL);
    });
  } catch {}

  // =========================
  // Footer year
  // =========================
  try {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  } catch {}

  // =========================
  // Mobile nav toggle
  // =========================
  try {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      menu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          if (menu.classList.contains("is-open")) {
            menu.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
          }
        });
      });
    }
  } catch {}

  // =========================
  // Hero slider (dots + auto + drag/swipe)
  // =========================
  try {
    const heroRoot = document.querySelector("[data-hero-slider]");
    if (heroRoot) {
      const track = heroRoot.querySelector("[data-hero-track]");
      const slides = Array.from(heroRoot.querySelectorAll("[data-hero-slide]"));
      const dotsWrap = heroRoot.querySelector("[data-hero-dots]");

      if (track && slides.length) {
        let idx = 0;
        let timer = null;
        const intervalMs = 4500;

        const renderDots = () => {
          if (!dotsWrap) return;

          // create once
          if (dotsWrap.children.length !== slides.length) {
            dotsWrap.innerHTML = "";
            slides.forEach((_, i) => {
              const b = document.createElement("button");
              b.type = "button";
              b.className = "hero-dot";
              b.addEventListener("click", () => go(i, true));
              dotsWrap.appendChild(b);
            });
          }

          // update active
          Array.from(dotsWrap.children).forEach((b, i) => {
            b.classList.toggle("active", i === idx);
          });
        };

        const restartZoom = (slideEl) => {
          const bg = slideEl.querySelector(".hero-slide-bg");
          if (!bg) return;
          bg.style.animation = "none";
          void bg.offsetHeight;
          bg.style.animation = "";
        };

        const go = (i, userAction = false) => {
          idx = (i + slides.length) % slides.length;

          slides.forEach((s, si) => s.classList.toggle("is-active", si === idx));
          // ✅ 기존(정상 동작) 방식 유지
          track.style.transform = `translateX(${-idx * (100 / slides.length)}%)`;

          restartZoom(slides[idx]);
          renderDots();

          if (userAction) start();
        };

        const stop = () => {
          if (timer) clearInterval(timer);
          timer = null;
        };

        const start = () => {
          stop();
          timer = setInterval(() => go(idx + 1), intervalMs);
        };

        // hover pause (원치 않으면 삭제)
        heroRoot.addEventListener("mouseenter", stop);
        heroRoot.addEventListener("mouseleave", start);

        // Drag / Swipe (wide area: entire hero section)
        if (!prefersReduced) {
          const swipeArea =
            document.querySelector(".hero.hero-full") ||
            heroRoot.closest?.(".hero-full") ||
            heroRoot;

          const step = 100 / slides.length;

          let isDown = false;
          let moved = false;
          let startX = 0;
          let base = 0;
          let blockClick = false;

          swipeArea.addEventListener(
            "click",
            (e) => {
              if (blockClick) {
                e.preventDefault();
                e.stopPropagation();
                blockClick = false;
              }
            },
            true
          );

          const down = (clientX, target) => {
            if (isInteractive(target)) return;

            isDown = true;
            moved = false;
            startX = clientX;
            base = -idx * step;

            stop();
            track.style.transition = "none";
            track.classList.add("is-dragging");
          };

          const move = (clientX) => {
            if (!isDown) return;
            const dx = clientX - startX;
            if (Math.abs(dx) > 6) moved = true;

            const delta = (dx / swipeArea.clientWidth) * step;
            track.style.transform = `translateX(${base + delta}%)`;
          };

          const up = (clientX) => {
            if (!isDown) return;
            isDown = false;

            track.classList.remove("is-dragging");
            track.style.transition = "";

            const dx = clientX - startX;
            const threshold = Math.max(60, swipeArea.clientWidth * 0.12);

            if (moved && Math.abs(dx) > threshold) {
              blockClick = true;
              if (dx < 0) go(idx + 1);
              else go(idx - 1);
            } else {
              go(idx);
            }

            start();
          };

          // pointer
          swipeArea.addEventListener("pointerdown", (e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            down(e.clientX, e.target);
          });
          swipeArea.addEventListener("pointermove", (e) => move(e.clientX));
          swipeArea.addEventListener("pointerup", (e) => up(e.clientX));
          swipeArea.addEventListener("pointercancel", (e) => up(e.clientX));

          // touch fallback
          swipeArea.addEventListener(
            "touchstart",
            (e) => {
              const t = e.touches?.[0];
              if (!t) return;
              down(t.clientX, e.target);
            },
            { passive: true }
          );
          swipeArea.addEventListener(
            "touchmove",
            (e) => {
              const t = e.touches?.[0];
              if (!t) return;
              move(t.clientX);
            },
            { passive: true }
          );
          swipeArea.addEventListener(
            "touchend",
            (e) => {
              const t = e.changedTouches?.[0];
              up(t ? t.clientX : startX);
            },
            { passive: true }
          );
        }

        renderDots();
        go(0);
        start();
      }
    }
  } catch {}

  // =========================
  // Before/After slider
  // =========================
// BA2 slider (FINAL v2) - free prev/next (like hero/reviews)
(() => {
  const root = document.querySelector("[data-ba2]");
  if (!root) return;

  const track = root.querySelector("[data-ba2-track]");
  const slides = Array.from(root.querySelectorAll("[data-ba2-slide]"));
  const dotsWrap = root.querySelector("[data-ba2-dots]");
  const prev = root.querySelector("[data-ba2-prev]");
  const next = root.querySelector("[data-ba2-next]");
  const viewport = root.querySelector("[data-ba2-viewport]") || root;

  if (!track || slides.length === 0) return;

  let idx = 0;

  const renderDots = () => {
    if (!dotsWrap) return;

    // create once
    if (dotsWrap.children.length !== slides.length) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ba2-dot";
        b.setAttribute("aria-label", `${i + 1}번째 전후 슬라이드`);
        b.addEventListener("click", () => { go(i); restartAuto(); });
        dotsWrap.appendChild(b);
      });
    }
    Array.from(dotsWrap.children).forEach((b, i) => {
      b.classList.toggle("active", i === idx);
    });
  };

  // Auto slide (BA2)
let autoTimer = null;
const autoMs = 4000;

const startAuto = () => {
  stopAuto();
  autoTimer = setInterval(() => go(idx + 1), autoMs);
};

const stopAuto = () => {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
};

const restartAuto = () => startAuto();

// 마우스 올리면 멈춤(원치 않으면 삭제)
root.addEventListener("mouseenter", stopAuto);
root.addEventListener("mouseleave", startAuto);

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    renderDots();
  };

prev?.addEventListener("click", () => { go(idx - 1); restartAuto(); });
next?.addEventListener("click", () => { go(idx + 1); restartAuto(); });

  // 클릭(이미지 영역) -> 다음. 단, 드래그로 판정되면 클릭 막기
  let blockClick = false;
  root.querySelectorAll("[data-ba2-click-next]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (blockClick) {
        e.preventDefault();
        e.stopPropagation();
        blockClick = false;
        return;
      }
      go(idx + 1);
    });
  });

  // Drag/Swipe (prev/next 자유롭게)
  let isDown = false;
  let moved = false;
  let startX = 0;
  let base = 0;

  const down = (x, target) => {
    // 버튼/도트 클릭은 우선
    if (target?.closest?.("button")) return;

    isDown = true;
    moved = false;
    startX = x;
    base = -idx * 100;
    track.style.transition = "none";
    track.classList.add("is-dragging");
  };

  const move = (x) => {
    if (!isDown) return;

    const dx = x - startX;
    if (Math.abs(dx) > 6) moved = true;

    const delta = (dx / viewport.clientWidth) * 100;
    track.style.transform = `translateX(${base + delta}%)`;
  };

  const up = (x) => {
    if (!isDown) return;
    isDown = false;

    track.classList.remove("is-dragging");
    track.style.transition = "";

    const dx = x - startX;
    const threshold = Math.max(60, viewport.clientWidth * 0.12);

    if (moved && Math.abs(dx) > threshold) {
      blockClick = true;
      if (dx < 0) go(idx + 1);
      else go(idx - 1);
    } else {
      go(idx);
    }
restartAuto();
  };

  // Pointer events
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    down(e.clientX, e.target);
  }, { passive: true });

  viewport.addEventListener("pointermove", (e) => move(e.clientX), { passive: true });
  viewport.addEventListener("pointerup", (e) => up(e.clientX), { passive: true });
  viewport.addEventListener("pointercancel", (e) => up(e.clientX), { passive: true });

  // Touch fallback
  viewport.addEventListener("touchstart", (e) => {
    const t = e.touches?.[0];
    if (t) down(t.clientX, e.target);
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    const t = e.touches?.[0];
    if (t) move(t.clientX);
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    const t = e.changedTouches?.[0];
    up(t ? t.clientX : startX);
  }, { passive: true });

  renderDots();
  go(0);
  startAuto();
})();

  // =========================
  // Portfolio lightbox (data-src)
  // =========================
  try {
    const gallery = document.querySelector("[data-gallery]");
    const lightbox = document.querySelector("[data-lightbox]");
    if (gallery && lightbox) {
      const titleEl = lightbox.querySelector("[data-lightbox-title]");
      const imgEl = lightbox.querySelector("[data-lightbox-img]");
      const closeEls = lightbox.querySelectorAll("[data-lightbox-close]");

      const open = (title, src) => {
        if (titleEl) titleEl.textContent = title || "포트폴리오";
        if (imgEl) {
          if (src) imgEl.style.backgroundImage = `url('${src}')`;
          else imgEl.style.backgroundImage = "";
        }
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

        const title =
          btn.getAttribute("data-title") ||
          btn.getAttribute("data-img") ||
          "포트폴리오";
        const src = btn.getAttribute("data-src");
        open(title, src);
      });

      closeEls.forEach((el) => el.addEventListener("click", close));
      window.addEventListener("keydown", (e) => {
        if (!lightbox.hidden && e.key === "Escape") close();
      });
    }
  } catch {}

  // =========================
  // Reviews slider (one page per slide) + dots + auto + drag/swipe
  // =========================
  try {
    const slider = document.querySelector("[data-slider]");
    if (slider) {
      const track = slider.querySelector("[data-track]");
      const dotsWrap = slider.querySelector("[data-dots]");
      if (!track) return;

      const pages = Array.from(track.children); // .review-page 3개
      let idx = 0;

      const renderDots = () => {
        if (!dotsWrap) return;

        // create once
        if (dotsWrap.children.length !== pages.length) {
          dotsWrap.innerHTML = "";
          pages.forEach((_, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "dot";
            b.setAttribute("aria-label", `${i + 1}번째 후기 페이지`);
            b.addEventListener("click", () => go(i, true));
            dotsWrap.appendChild(b);
          });
        }

        // active only
        Array.from(dotsWrap.children).forEach((b, i) => {
          b.classList.toggle("active", i === idx);
        });
      };

      const go = (i, userAction = false) => {
        idx = (i + pages.length) % pages.length;
        track.style.transform = `translateX(${-idx * 100}%)`;
        renderDots();
        if (userAction) restartAuto();
      };

      // auto
      let autoTimer = null;
      const autoMs = 2000;
      const startAuto = () => {
        stopAuto();
        autoTimer = setInterval(() => go(idx + 1), autoMs);
      };
      const stopAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
      };
      const restartAuto = () => startAuto();

      // hover pause
      slider.addEventListener("mouseenter", stopAuto);
      slider.addEventListener("mouseleave", startAuto);

      // drag/swipe
      if (!prefersReduced) {
        let isDown = false;
        let moved = false;
        let startX = 0;
        let base = 0;
        let blockClick = false;

        slider.addEventListener(
          "click",
          (e) => {
            if (blockClick) {
              e.preventDefault();
              e.stopPropagation();
              blockClick = false;
            }
          },
          true
        );

        const down = (clientX, target) => {
          if (isInteractive(target)) return;
          isDown = true;
          moved = false;
          startX = clientX;
          base = -idx * 100;

          stopAuto();
          track.style.transition = "none";
          track.classList.add("is-dragging");
        };

        const move = (clientX) => {
          if (!isDown) return;
          const dx = clientX - startX;
          if (Math.abs(dx) > 6) moved = true;

          const delta = (dx / slider.clientWidth) * 100;
          track.style.transform = `translateX(${base + delta}%)`;
        };

        const up = (clientX) => {
          if (!isDown) return;
          isDown = false;

          track.classList.remove("is-dragging");
          track.style.transition = "";

          const dx = clientX - startX;
          const threshold = Math.max(60, slider.clientWidth * 0.12);

          if (moved && Math.abs(dx) > threshold) {
            blockClick = true;
            if (dx < 0) go(idx + 1, true);
            else go(idx - 1, true);
          } else {
            go(idx, true);
          }

          startAuto();
        };

        slider.addEventListener("pointerdown", (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          down(e.clientX, e.target);
        });
        slider.addEventListener("pointermove", (e) => move(e.clientX));
        slider.addEventListener("pointerup", (e) => up(e.clientX));
        slider.addEventListener("pointercancel", (e) => up(e.clientX));

        slider.addEventListener(
          "touchstart",
          (e) => {
            const t = e.touches?.[0];
            if (!t) return;
            down(t.clientX, e.target);
          },
          { passive: true }
        );
        slider.addEventListener(
          "touchmove",
          (e) => {
            const t = e.touches?.[0];
            if (!t) return;
            move(t.clientX);
          },
          { passive: true }
        );
        slider.addEventListener(
          "touchend",
          (e) => {
            const t = e.changedTouches?.[0];
            up(t ? t.clientX : startX);
          },
          { passive: true }
        );
      }

      window.addEventListener("resize", () => go(idx));

      renderDots();
      go(0);
      startAuto();
    }
  } catch {}

  // =========================
  // Scroll reveal (main + service pages)
  // =========================
  try {
    if (prefersReduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" }
    );

    const addReveal = (el, delayMs = 0) => {
      if (!el) return;
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${delayMs}ms`);
      io.observe(el);
    };

    const addGroup = (selector, stepMs = 70, capMs = 420) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      nodes.forEach((el, i) => addReveal(el, Math.min(i * stepMs, capMs)));
    };

    // Main page groups
    addGroup(".section-head", 0, 0);
    addGroup(".stats .stat", 90, 270);
    addGroup(".svc-grid .svc-tile, .card-grid .card", 80, 400);
    addGroup(".change .ba-wrap", 0, 0);
    addGroup(".ba2-shell", 0, 0);
    addGroup(".gallery .gallery-item", 80, 320);
    addGroup(".work-links .work-card", 0, 0);
    addGroup(".work-links .link-btn", 80, 240);
    addGroup(".process .step", 90, 360);
    addGroup(".reviews .review-card", 30, 240);
    addGroup(".site-footer .footer-inner", 0, 0);

    // Service pages groups
    addGroup(".service-hero-copy > *", 80, 320);
    addGroup(".service-section .section-head", 0, 0);
    addGroup(".service-section .service-lead", 0, 0);
    addGroup(".scope-grid .scope-card", 80, 320);
    addGroup(".feature-grid .feature-card", 80, 320);
    addGroup(".faq .faq-item", 60, 360);
  } catch {}

    // =========================
  // FAQ accordion (service pages)
  // =========================
  try {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-faq-q]");
      if (!btn) return;

      const item = btn.closest(".faq-item");
      if (!item) return;

      const panel = item.querySelector("[data-faq-a]");
      if (!panel) return;

      const isOpen = item.getAttribute("data-open") === "true";

      // 단일 오픈 유지(원치 않으면 이 블록 삭제)
      document.querySelectorAll(".faq-item[data-open='true']").forEach((x) => {
        if (x === item) return;
        x.setAttribute("data-open", "false");
        const p = x.querySelector("[data-faq-a]");
        if (p) p.setAttribute("hidden", "");
        const q = x.querySelector("[data-faq-q]");
        if (q) q.setAttribute("aria-expanded", "false");
      });

      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));

      if (isOpen) panel.setAttribute("hidden", "");
      else panel.removeAttribute("hidden");
    });
  } catch {}
  
  // =========================
  // Stats count-up (when visible)
  // =========================
  try {
    if (prefersReduced) return;

    const els = Array.from(document.querySelectorAll(".stat-num"));
    if (!els.length) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      if (el.dataset.counted === "1") return;

      const original = (el.textContent || "").trim();
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
        const num = val.toLocaleString("ko-KR");
        return `${prefix}${num}${suffix}`;
      };

      const tick = (now) => {
        const p = clamp((now - start) / duration, 0, 1);
        const eased = easeOutCubic(p);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
      };

      el.textContent = fmt(0);
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
  } catch {}
  
})();
