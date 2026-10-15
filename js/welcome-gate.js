(function () {
    'use strict';

    var STORAGE_KEY = 'welcomeGateChoice';
    var gate = document.getElementById('welcomeGate');
    var panels = document.getElementById('gatePanels');
    var proPanel = document.getElementById('gatePro');
    var socialPanel = document.getElementById('gateSocial');
    var skipButtons = document.querySelectorAll('[data-gate-skip]');

    if (!gate || !panels) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var wideViewport = window.matchMedia('(min-width: 821px)').matches;

    function unlockHub(persist) {
        document.body.classList.remove('gate-locked');
        document.body.classList.add('gate-unlocked');
        if (persist) {
            try {
                sessionStorage.setItem(STORAGE_KEY, 'pro');
            } catch (e) { /* ignore */ }
        }
        var hub = document.getElementById('proHub');
        if (hub) {
            hub.removeAttribute('aria-hidden');
            if (!reduceMotion) {
                window.setTimeout(function () {
                    hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
            }
        }
        var focusTarget = document.querySelector('#proHub .page-title, #proHub h1');
        if (focusTarget) {
            focusTarget.setAttribute('tabindex', '-1');
            focusTarget.focus({ preventScroll: true });
        }
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#hub');
        }
    }

    function enterProfessional(event) {
        if (event) event.preventDefault();
        unlockHub(true);
    }

    function enterSocial() {
        try {
            sessionStorage.setItem(STORAGE_KEY, 'social');
        } catch (e) { /* ignore */ }
    }

    function applyParallax(event) {
        if (reduceMotion || !finePointer) return;
        var rect = panels.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        var imgs = panels.querySelectorAll('.gate-panel__media img');
        imgs.forEach(function (img, index) {
            var depth = index === 0 ? 8 : 14;
            img.style.setProperty('--px', (x * depth * -1).toFixed(2) + 'px');
            img.style.setProperty('--py', (y * depth * -1).toFixed(2) + 'px');
        });
    }

    function init() {
        document.body.classList.add('gate-locked');
        if (finePointer && wideViewport) panels.classList.add('is-hoverable');

        if (window.matchMedia) {
            var widthQuery = window.matchMedia('(min-width: 821px)');
            var syncHoverable = function () {
                if (finePointer && widthQuery.matches) {
                    panels.classList.add('is-hoverable');
                } else {
                    panels.classList.remove('is-hoverable');
                }
            };
            if (widthQuery.addEventListener) {
                widthQuery.addEventListener('change', syncHoverable);
            } else if (widthQuery.addListener) {
                widthQuery.addListener(syncHoverable);
            }
        }

        requestAnimationFrame(function () {
            gate.classList.add('is-ready');
        });

        // Deep-link / returning in same session: skip straight to hub
        var hash = (window.location.hash || '').toLowerCase();
        var saved = null;
        try {
            saved = sessionStorage.getItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }

        if (hash === '#hub' || saved === 'pro') {
            unlockHub(false);
        }

        if (proPanel) {
            proPanel.addEventListener('click', enterProfessional);
            proPanel.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    enterProfessional(event);
                }
            });
        }

        if (socialPanel) {
            socialPanel.addEventListener('click', enterSocial);
        }

        skipButtons.forEach(function (btn) {
            btn.addEventListener('click', enterProfessional);
        });

        if (finePointer && !reduceMotion) {
            panels.addEventListener('pointermove', applyParallax);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
