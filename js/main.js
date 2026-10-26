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
    const sections = ['home', 'about', 'skills', 'projects', 'education', 'contact']
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
       Mobile-only scroll sequence for the Projects cards
       ---------------------------------------------------------------------- */
    const projectsSection = document.getElementById('projects');
    const projectsTrack = projectsSection?.querySelector('.projects-scroll-track');
    const projectsStack = projectsSection?.querySelector('.project-card-stack');
    const projectCards = projectsStack
        ? Array.from(projectsStack.querySelectorAll('.project-card'))
        : [];

    if (projectsTrack && projectsStack && projectCards.length === 3) {
        const mobileProjectsQuery = window.matchMedia('(max-width: 767px)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let projectSequenceEnabled = false;
        let projectScrollFrame = null;
        let renderedProjectPosition = null;

        const clampProjectProgress = (value, min, max) => Math.min(max, Math.max(min, value));
        const easeProjectProgress = (value) => value * value * (3 - (2 * value));

        function updateProjectStack() {
            projectScrollFrame = null;
            if (!projectSequenceEnabled) return;

            const trackRect = projectsTrack.getBoundingClientRect();
            const stackHeight = projectsStack.getBoundingClientRect().height;
            const trackHeight = trackRect.height;
            const stickyTop = parseFloat(window.getComputedStyle(projectsStack).top) || 0;
            const scrollRange = Math.max(1, trackHeight - stackHeight);
            const trackDocumentTop = window.scrollY + trackRect.top;
            const sequenceStart = trackDocumentTop - stickyTop;
            const progress = clampProjectProgress(
                (window.scrollY - sequenceStart) / scrollRange,
                0,
                1
            );
            const targetPosition = progress * (projectCards.length - 1);
            renderedProjectPosition = renderedProjectPosition === null
                ? targetPosition
                : renderedProjectPosition + ((targetPosition - renderedProjectPosition) * 0.18);

            const sequencePosition = renderedProjectPosition;
            const activeIndex = Math.min(
                projectCards.length - 1,
                Math.floor(sequencePosition)
            );
            const segmentProgress = activeIndex === projectCards.length - 1
                ? 0
                : sequencePosition - activeIndex;
            const exitProgress = clampProjectProgress((segmentProgress - 0.5) * 2, 0, 1);
            const visibleCardIndex = Math.min(
                projectCards.length - 1,
                Math.round(sequencePosition)
            );
            const entryOffset = (stackHeight * 0.2) + 16;

            projectCards.forEach((card, index) => {
                let y = 0;
                let scale = 1;
                let opacity = 1;
                let zIndex = 100;

                if (index < activeIndex) {
                    y = -stackHeight * 1.08;
                    scale = 0.94;
                    opacity = 0.18;
                    zIndex = 10 + index;
                } else if (index === activeIndex) {
                    y = -stackHeight * 1.08 * exitProgress;
                    scale = 1 - (0.06 * exitProgress);
                    zIndex = segmentProgress < 0.5 ? 200 : 190;
                } else if (index === activeIndex + 1) {
                    const entryProgress = easeProjectProgress(segmentProgress);
                    y = entryOffset * (1 - entryProgress);
                    scale = 0.96 + (0.04 * entryProgress);
                    opacity = 0.6 + (0.4 * entryProgress);
                    zIndex = segmentProgress >= 0.5 ? 201 : 150 - index;
                } else {
                    const isPreparingNext = index === activeIndex + 2;
                    const prepareProgress = isPreparingNext
                        ? easeProjectProgress(clampProjectProgress((segmentProgress - 0.76) / 0.24, 0, 1))
                        : 0;
                    y = 16 + ((entryOffset - 16) * prepareProgress);
                    scale = 0.92 + (0.04 * prepareProgress);
                    opacity = 0.18 + (0.42 * prepareProgress);
                    zIndex = 120 - index;
                }

                card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
                card.style.opacity = String(opacity);
                card.style.zIndex = String(zIndex);
                card.classList.toggle('has-visible-content', index === visibleCardIndex);
            });

            if (Math.abs(targetPosition - renderedProjectPosition) > 0.001) {
                scheduleProjectStackUpdate();
            }
        }

        function scheduleProjectStackUpdate() {
            if (!projectSequenceEnabled || projectScrollFrame !== null) return;
            projectScrollFrame = window.requestAnimationFrame(updateProjectStack);
        }

        function stopProjectSequence() {
            if (!projectSequenceEnabled) return;
            projectSequenceEnabled = false;
            window.removeEventListener('scroll', scheduleProjectStackUpdate);
            window.removeEventListener('resize', scheduleProjectStackUpdate);
            if (projectScrollFrame !== null) {
                window.cancelAnimationFrame(projectScrollFrame);
                projectScrollFrame = null;
            }

            projectsTrack.classList.remove('is-project-sequence');
            projectsStack.classList.remove('is-project-sequence');
            renderedProjectPosition = null;
            projectCards.forEach((card) => {
                card.classList.remove('is-project-sequence-card', 'has-visible-content');
                card.style.removeProperty('transform');
                card.style.removeProperty('opacity');
                card.style.removeProperty('z-index');
            });
        }

        function startProjectSequence() {
            if (projectSequenceEnabled) return;
            projectSequenceEnabled = true;
            projectsTrack.classList.add('is-project-sequence');
            projectsStack.classList.add('is-project-sequence');
            projectCards.forEach((card) => card.classList.add('is-project-sequence-card'));
            window.addEventListener('scroll', scheduleProjectStackUpdate, { passive: true });
            window.addEventListener('resize', scheduleProjectStackUpdate, { passive: true });
            updateProjectStack();
        }

        function syncProjectSequenceMode() {
            if (mobileProjectsQuery.matches && !reducedMotionQuery.matches) {
                startProjectSequence();
            } else {
                stopProjectSequence();
            }
        }

        [mobileProjectsQuery, reducedMotionQuery].forEach((mediaQuery) => {
            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', syncProjectSequenceMode);
            } else {
                mediaQuery.addListener(syncProjectSequenceMode);
            }
        });
        syncProjectSequenceMode();
    }

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
