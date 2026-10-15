/**
 * Personal site: mobile menu + mosaic filters + reveal motion
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        const setOpen = (open) => {
            hamburger.classList.toggle('active', open);
            navLinks.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        };

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            setOpen(!navLinks.classList.contains('active'));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !hamburger.contains(e.target) &&
                !navLinks.contains(e.target)) {
                setOpen(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
        });
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

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    // Fallback so content is never stuck invisible (e.g. odd viewport/IO cases)
    window.setTimeout(() => {
        reveals.forEach((el) => el.classList.add('is-visible'));
    }, 600);
});
