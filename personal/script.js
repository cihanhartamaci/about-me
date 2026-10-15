/**
 * Personal site: mobile menu + reveal motion
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
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    reveals.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index % 6, 5) * 0.06}s`;
        observer.observe(el);
    });
});
