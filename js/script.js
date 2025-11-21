// ========================================
// 세담홈케어 JavaScript
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    initializeScrollToTop();
    initializeNavbarScroll();
    initializeSmoothScroll();
});

/* -----------------------------------------------------
   1. 맨 위로 버튼 기능
----------------------------------------------------- */
function initializeScrollToTop() {
    const scrollBtn = document.getElementById("scrollToTop");
    
    if (!scrollBtn) return;

    // 스크롤 위치에 따라 버튼 표시/숨김
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add("show");
        } else {
            scrollBtn.classList.remove("show");
        }
    });

    // 버튼 클릭 시 맨 위로 이동
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* -----------------------------------------------------
   2. 네비게이션 바 스크롤 효과
----------------------------------------------------- */
function initializeNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    });
}

/* -----------------------------------------------------
   3. 부드러운 스크롤 (앵커 링크)
----------------------------------------------------- */
function initializeSmoothScroll() {
    // 모든 앵커 링크에 부드러운 스크롤 적용
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            
            // #만 있는 경우 제외
            if (href === "#" || href === "") return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbar = document.querySelector(".navbar");
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });

                // 모바일에서 네비게이션 메뉴 닫기
                const navbarCollapse = document.getElementById("navbarNav");
                if (navbarCollapse && navbarCollapse.classList.contains("show")) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            }
        });
    });
}

/* -----------------------------------------------------
   4. 현재 섹션 감지 및 네비게이션 활성화
----------------------------------------------------- */
function initializeSectionObserver() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    
    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute("id");
                
                // 모든 nav-link에서 active 제거
                navLinks.forEach(link => {
                    link.classList.remove("active");
                });
                
                // 현재 섹션에 해당하는 nav-link에 active 추가
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add("active");
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// 섹션 감지 활성화 (선택적)
// initializeSectionObserver();

/* -----------------------------------------------------
   5. 이미지 Lazy Loading (선택적)
----------------------------------------------------- */
function initializeLazyLoading() {
    const images = document.querySelectorAll("img[data-src]");
    
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

/* -----------------------------------------------------
   6. 플로팅 버튼 애니메이션 (선택적)
----------------------------------------------------- */
function initializeFloatingButtons() {
    const floatingBtns = document.querySelectorAll(".floating-reservation-btn, .floating-phone-btn");
    
    floatingBtns.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            btn.style.transform = "translateY(-5px) scale(1.05)";
        });
        
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "translateY(0) scale(1)";
        });
    });
}

// 플로팅 버튼 애니메이션 활성화
initializeFloatingButtons();

/* -----------------------------------------------------
   7. 서비스 카드 호버 효과 (선택적)
----------------------------------------------------- */
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll(".service-card");
    
    serviceCards.forEach(card => {
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-10px)";
        });
        
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
        });
    });
}

// 서비스 카드 효과 활성화 (선택적)
// initializeServiceCards();

/* -----------------------------------------------------
   8. 폼 유효성 검사 (필요시 추가)
----------------------------------------------------- */
function initializeFormValidation() {
    const forms = document.querySelectorAll(".needs-validation");
    
    forms.forEach(form => {
        form.addEventListener("submit", event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add("was-validated");
        }, false);
    });
}

/* -----------------------------------------------------
   9. 카카오톡 상담 버튼 추적 (선택적)
----------------------------------------------------- */
function initializeKakaoTracking() {
    const kakaoBtn = document.querySelector('a[href*="kakao"]');
    
    if (kakaoBtn) {
        kakaoBtn.addEventListener("click", () => {
            console.log("카카오톡 상담 버튼 클릭");
            // 여기에 Google Analytics 등 추적 코드 추가 가능
        });
    }
}

/* -----------------------------------------------------
   10. 전화번호 클릭 추적 (선택적)
----------------------------------------------------- */
function initializePhoneTracking() {
    const phoneBtns = document.querySelectorAll('a[href^="tel:"]');
    
    phoneBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("전화 버튼 클릭:", btn.getAttribute("href"));
            // 여기에 Google Analytics 등 추적 코드 추가 가능
        });
    });
}
