/**
 * mobile-nav.js
 * Hamburger drawer for the professional site.
 * Ensures hash + page links navigate reliably on touch devices.
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (!hamburger || !navLinks) return;

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

            // Same-page hash: close drawer, then scroll (don't cancel navigation with inert)
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

            // Page navigations: close drawer visually but do NOT block the default
            // click — synchronous inert/pointer-events on the parent can cancel nav.
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
        if (window.innerWidth > 1200) setOpen(false);
    });
});
