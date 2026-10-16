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
        if (open) {
            navLinks.removeAttribute('inert');
        } else {
            // Keep drawer out of hit-testing when closed (iOS Safari quirks)
            navLinks.setAttribute('inert', '');
        }
    };

    // Start closed / non-interactive when in drawer mode
    if (window.matchMedia('(max-width: 1200px)').matches) {
        navLinks.setAttribute('inert', '');
    }

    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!navLinks.classList.contains('active'));
    });

    overlay.addEventListener('click', () => setOpen(false));

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            // Close drawer first so it cannot intercept the next paint
            setOpen(false);

            // Same-page hash: ensure scroll after drawer closes
            if (href.startsWith('#')) {
                const id = href.slice(1);
                const target = id ? document.getElementById(id) : null;
                if (target) {
                    e.preventDefault();
                    window.setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        if (history.replaceState) {
                            history.replaceState(null, '', href);
                        }
                    }, 40);
                }
            }
            // External / other-page links: allow default navigation
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            setOpen(false);
            hamburger.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1200) {
            setOpen(false);
            navLinks.removeAttribute('inert');
        } else if (!navLinks.classList.contains('active')) {
            navLinks.setAttribute('inert', '');
        }
    });
});
