/* ==========================================================================
   Portfolio — main.js
   Plain vanilla JS — no dependencies.
   ========================================================================== */
(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       1) Mobile menu toggle
       ---------------------------------------------------------------------- */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconClose = document.getElementById('icon-close');

    function setMenu(open) {
        if (!mobileMenu || !menuToggle) return;
        mobileMenu.classList.toggle('hidden', !open);
        iconMenu?.classList.toggle('hidden', open);
        iconClose?.classList.toggle('hidden', !open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    menuToggle?.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        setMenu(!isOpen);
    });

    // Close menu when a link is tapped
    mobileMenu?.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => setMenu(false));
    });

    // Close menu on resize to desktop.
    // 1280px is Tailwind's `xl` breakpoint — the exact width where #mobile-menu
    // becomes `xl:hidden` and the inline .nav-link list becomes `xl:flex`.
    // The old 768px (`md`) value closed the menu on tablets, where the hamburger
    // is the ONLY navigation, so any resize event (iPad/Android URL bar collapse,
    // orientation change, soft keyboard) made the menu vanish and the site
    // look unresponsive. Keep this number in sync with the `xl:` classes above.
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 1280) setMenu(false);
        }, 150);
    });

    /* ----------------------------------------------------------------------
       2) Navbar scroll behavior + active-link spy
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const sections = ['home', 'projects', 'about', 'skills', 'contact']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    function onScroll() {
        // Add glass effect after small scroll
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }

        // Active link spy
        const scrollPos = window.scrollY + 120;
        let currentId = sections[0]?.id;
        sections.forEach((sec) => {
            if (sec.offsetTop <= scrollPos) currentId = sec.id;
        });
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + currentId
            );
        });

        // Back-to-top visibility
        const back = document.getElementById('back-to-top');
        if (back) {
            const show = window.scrollY > 600;
            back.classList.toggle('hidden', !show);
            back.classList.toggle('flex', show);
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ----------------------------------------------------------------------
       3) Smooth scroll for anchor links (fallback for older browsers)
       ---------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    const contactEmail = document.getElementById('contact-email');
    const copyEmailButton = document.getElementById('copy-email');
    const copyEmailStatus = document.getElementById('copy-email-status');

    if (contactEmail && copyEmailButton && copyEmailStatus) {
        copyEmailButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(contactEmail.textContent.trim());
                copyEmailStatus.textContent = 'Email address copied.';
            } catch {
                copyEmailStatus.textContent = 'Select the email address to copy it manually.';
            }
        });
    }

    /* ----------------------------------------------------------------------
       4) Scroll-triggered reveal animations (IntersectionObserver)
       ---------------------------------------------------------------------- */
    const animated = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && animated.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08,
                // Slightly trigger animations a bit before elements fully enter view
                rootMargin: '0px 0px -10% 0px',
            }
        );
        animated.forEach((el) => observer.observe(el));
    } else {
        // Fallback: just show them all
        animated.forEach((el) => el.classList.add('is-visible'));
    }

    // Tiny stagger for grouped items in the same parent
    document.querySelectorAll('[data-animate-group]').forEach((group) => {
        let i = 0;
        group.querySelectorAll('[data-animate]').forEach((el) => {
            el.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
            i++;
        });
    });

    /* ----------------------------------------------------------------------
       Mobile-only accordion for the Skills cards
       ---------------------------------------------------------------------- */
    const skillsSection = document.getElementById('skills');
    const skillCards = skillsSection
        ? Array.from(skillsSection.querySelectorAll('.skill-card'))
        : [];

    if (skillCards.length) {
        const mobileSkillsQuery = window.matchMedia('(max-width: 767px)');

        const getToggle = (card) => card.querySelector('.skill-toggle');

        function setSkillOpen(card, open) {
            card.classList.toggle('is-open', open);
            const toggle = getToggle(card);
            if (toggle) toggle.setAttribute('aria-expanded', String(open));
        }

        function toggleSkill(card) {
            if (card.classList.contains('is-open')) {
                setSkillOpen(card, false);
                return;
            }
            // Accordion behaviour: only one skill stays expanded at a time.
            skillCards.forEach((other) => {
                if (other !== card) setSkillOpen(other, false);
            });
            setSkillOpen(card, true);
        }

        // One handler on the card: clicks on the title button bubble up here,
        // and the button gives us native keyboard support (Enter / Space).
        function onSkillCardClick(e) {
            if (!mobileSkillsQuery.matches) return;
            toggleSkill(e.currentTarget);
        }

        function syncSkillAccordionMode() {
            const isMobile = mobileSkillsQuery.matches;
            skillCards.forEach((card) => {
                const toggle = getToggle(card);
                if (isMobile) {
                    if (toggle) {
                        toggle.disabled = false;
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                } else {
                    if (toggle) {
                        toggle.disabled = true;
                        toggle.removeAttribute('aria-expanded');
                    }
                }
                card.classList.remove('is-open');
            });
        }

        skillCards.forEach((card) => {
            card.addEventListener('click', onSkillCardClick);
        });

        if (typeof mobileSkillsQuery.addEventListener === 'function') {
            mobileSkillsQuery.addEventListener('change', syncSkillAccordionMode);
        } else {
            mobileSkillsQuery.addListener(syncSkillAccordionMode);
        }
        syncSkillAccordionMode();
    }

    /* ----------------------------------------------------------------------
       5) Typing effect for hero role
       ---------------------------------------------------------------------- */
    const typedEl = document.getElementById('typed');
    if (typedEl) {
        const roles = [
            'Full-Stack Developer',
            'UI/UX Enthusiast',
            'Open-Source Contributor',
            'Problem Solver',
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;

        function tick() {
            const word = roles[roleIdx];
            if (!deleting) {
                charIdx++;
                typedEl.textContent = word.slice(0, charIdx);
                if (charIdx === word.length) {
                    deleting = true;
                    return setTimeout(tick, 1800);
                }
            } else {
                charIdx--;
                typedEl.textContent = word.slice(0, charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                }
            }
            setTimeout(tick, deleting ? 40 : 80);
        }
        tick();
    }

    /* ----------------------------------------------------------------------
       7) Back-to-top button
       ---------------------------------------------------------------------- */
    const backBtn = document.getElementById('back-to-top');
    backBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ----------------------------------------------------------------------
       8) Footer year
       ---------------------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ----------------------------------------------------------------------
       9) Subtle parallax on hero orbs (only on desktop, very small)
       ---------------------------------------------------------------------- */
    if (window.matchMedia('(min-width: 1024px)').matches) {
        const orbs = document.querySelectorAll('.animate-float, .animate-float-delay');
        window.addEventListener(
            'mousemove',
            (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 12;
                const y = (e.clientY / window.innerHeight - 0.5) * 12;
                orbs.forEach((orb, i) => {
                    const sign = i % 2 === 0 ? 1 : -1;
                    orb.style.translate = `${x * sign}px ${y * sign}px`;
                });
            },
            { passive: true }
        );
    }
})();
