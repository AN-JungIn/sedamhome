document.addEventListener("DOMContentLoaded", () => {
    initializeSmoothScroll();
    initializeScrollFadeIn();
    initializeHeaderScroll();
    initializeSectionObserver();
    initializeImageBoxes();
    initializeFloatingContact();
    initializeHamburgerMenu();
    initializeReveal();
});

/* -----------------------------------------------------
   1. 부드러운 스크롤
----------------------------------------------------- */
function initializeSmoothScroll() {
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("scroll-link")) {
            event.preventDefault();
            const targetId = event.target.getAttribute("data-target");
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector("header").offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        }
    });
}

/* -----------------------------------------------------
   2. 페이드 인 애니메이션
----------------------------------------------------- */
function initializeScrollFadeIn() {
    const elements = document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right");

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    elements.forEach((el) => fadeInObserver.observe(el));
}

/* -----------------------------------------------------
   3. 스크롤 시 헤더 색상 변경
----------------------------------------------------- */
function initializeHeaderScroll() {
    const header = document.querySelector("header");
    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 50);
    });
}

/* -----------------------------------------------------
   4. 현재 섹션 감지 → 메뉴 활성화
----------------------------------------------------- */
function initializeSectionObserver() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll("nav a[data-target]");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => link.classList.remove("active"));
                const activeLink = document.querySelector(
                    `nav a[data-target="${entry.target.id}"]`
                );
                if (activeLink) activeLink.classList.add("active");
            }
        });
    }, { threshold: 0.6 });

    sections.forEach((section) => observer.observe(section));
}

/* -----------------------------------------------------
   5. 이미지 박스 확대 효과
----------------------------------------------------- */
function initializeImageBoxes() {
    const imageBoxes = document.querySelectorAll(".image-box");

    imageBoxes.forEach((box) => {
        const img = box.querySelector("img");

        img.addEventListener("mouseenter", () => {
            imageBoxes.forEach((otherBox) => {
                if (otherBox !== box) {
                    otherBox.classList.add("blur");
                    const otherImg = otherBox.querySelector("img");
                    if (otherImg) otherImg.style.transform = "scale(1)";
                }
            });

            img.style.transform = "scale(1.1)";
        });

        img.addEventListener("mouseleave", () => {
            imageBoxes.forEach((otherBox) => {
                otherBox.classList.remove("blur");
                const otherImg = otherBox.querySelector("img");
                if (otherImg) otherImg.style.transform = "scale(1)";
            });
        });
    });
}

/* -----------------------------------------------------
   6. 우측 하단 상담 버튼(상시 표시)
----------------------------------------------------- */
function initializeFloatingContact() {
    const contactBtn = document.getElementById("floating-contact");
    if (contactBtn) contactBtn.style.display = "flex";
}

/* -----------------------------------------------------
   7. 모바일 햄버거 메뉴
----------------------------------------------------- */
function initializeHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");

    if (hamburger && mobileNav) {
        hamburger.addEventListener("click", () => {
            mobileNav.classList.toggle("active");
        });

        mobileNav.addEventListener("click", (event) => {
            if (event.target.classList.contains("scroll-link")) {
                mobileNav.classList.remove("active");
            }
        });
    }
}

/* -----------------------------------------------------
   8. reveal 애니메이션
----------------------------------------------------- */
function initializeReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.4 });

    revealElements.forEach((el) => revealObserver.observe(el));
}
