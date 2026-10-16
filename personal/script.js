/**
 * Personal site: mobile menu + mosaic filters + hero slideshow + reveal motion
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        const setOpen = (open) => {
            hamburger.classList.toggle('active', open);
            navLinks.classList.toggle('active', open);
            overlay.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
            overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
            document.body.classList.toggle('nav-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        };

        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!navLinks.classList.contains('active'));
        });

        overlay.addEventListener('click', () => setOpen(false));

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';

                if (href.startsWith('#')) {
                    e.preventDefault();
                    setOpen(false);
                    const id = href.slice(1);
                    const target = id ? document.getElementById(id) : null;
                    if (target) {
                        window.setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            if (history.replaceState) {
                                history.replaceState(null, '', href);
                            }
                        }, 40);
                    }
                    return;
                }

                // Real navigations: close drawer without canceling the click
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('nav-open');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                setOpen(false);
                hamburger.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) setOpen(false);
        });
    }

    /* Hero crossfade slideshow */
    const slides = document.querySelectorAll('.hero-slideshow .hero-slide');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (slides.length > 1 && !reduceMotion) {
        let index = 0;
        slides[0].classList.add('is-active');
        window.setInterval(() => {
            slides[index].classList.remove('is-active');
            index = (index + 1) % slides.length;
            slides[index].classList.add('is-active');
        }, 5200);
    } else if (slides.length) {
        slides[0].classList.add('is-active');
    }

    const filters = document.querySelectorAll('.mosaic-filter');
    const tiles = document.querySelectorAll('#photoMosaic .photo-tile');

    if (filters.length && tiles.length) {
        const applyFilter = (group) => {
            tiles.forEach((tile) => {
                const tileGroup = tile.getAttribute('data-group') || 'all';
                const show = group === 'all' || tileGroup === group || tileGroup === 'all';
                tile.classList.toggle('is-hidden', !show);
            });
        };

        filters.forEach((btn) => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-filter') || 'all';
                filters.forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle('is-active', active);
                    b.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                applyFilter(group);
            });
        });
    }

    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
    );

    reveals.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index % 6, 5) * 0.06}s`;
        observer.observe(el);
    });

    const markInView = () => {
        reveals.forEach((el) => {
            if (el.classList.contains('is-visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
                el.classList.add('is-visible');
                observer.unobserve(el);
            }
        });
    };

    requestAnimationFrame(markInView);
    window.setTimeout(() => {
        reveals.forEach((el) => el.classList.add('is-visible'));
    }, 600);
});
