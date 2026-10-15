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

    // Flex-expand seam: ratio where the visual split sits when one side is active
    var SEAM_NEUTRAL = '50%';
    var SEAM_PRO = ((1.28 / 2.28) * 100).toFixed(3) + '%';
    var SEAM_SOCIAL = ((1 / 2.28) * 100).toFixed(3) + '%';
    // Deadzone + hysteresis around center (normalized 0–1) prevents hover thrashing
    var DEADZONE = 0.07;
    var HYSTERESIS = 0.05;

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

    /**
     * Stabilized panel expand: never use raw :hover for flex growth.
     * Pointer near the center seam stays neutral; switching sides requires
     * crossing the deadzone (+ hysteresis once a side is already expanded).
     */
    function initStabilizedExpand() {
        if (!finePointer || !proPanel || !socialPanel) return;

        var active = null; // 'pro' | 'social' | null
        var pendingRatio = null;
        var rafId = 0;

        function setSeam(side) {
            var seam = SEAM_NEUTRAL;
            if (side === 'pro') seam = SEAM_PRO;
            else if (side === 'social') seam = SEAM_SOCIAL;
            panels.style.setProperty('--gate-seam', seam);
        }

        function setExpanded(side) {
            if (active === side) return;
            active = side;
            if (reduceMotion) {
                // Still track intent for focus/keyboard parity, but skip size change
                proPanel.classList.remove('is-expanded');
                socialPanel.classList.remove('is-expanded');
                setSeam(null);
                return;
            }
            proPanel.classList.toggle('is-expanded', side === 'pro');
            socialPanel.classList.toggle('is-expanded', side === 'social');
            setSeam(side);
        }

        function resolve(ratio) {
            var leftExit = 0.5 - DEADZONE;
            var rightExit = 0.5 + DEADZONE;

            if (active === null) {
                if (ratio < leftExit) setExpanded('pro');
                else if (ratio > rightExit) setExpanded('social');
                return;
            }

            if (active === 'pro') {
                // Must travel past center + deadzone + hysteresis before flipping
                if (ratio > rightExit + HYSTERESIS) setExpanded('social');
                return;
            }

            if (active === 'social') {
                if (ratio < leftExit - HYSTERESIS) setExpanded('pro');
            }
        }

        function flush() {
            rafId = 0;
            if (pendingRatio == null) return;
            resolve(pendingRatio);
            pendingRatio = null;
        }

        function onPointerMove(event) {
            if (event.pointerType === 'touch') return;
            var rect = panels.getBoundingClientRect();
            if (rect.width <= 0) return;
            pendingRatio = (event.clientX - rect.left) / rect.width;
            if (!rafId) rafId = window.requestAnimationFrame(flush);
        }

        function clearExpand() {
            pendingRatio = null;
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            setExpanded(null);
        }

        panels.addEventListener('pointermove', onPointerMove);
        panels.addEventListener('pointerleave', clearExpand);
        panels.addEventListener('pointercancel', clearExpand);

        // Keyboard focus still expands via :focus-visible CSS; clear pointer class
        proPanel.addEventListener('focus', function () {
            socialPanel.classList.remove('is-expanded');
            if (!reduceMotion) {
                proPanel.classList.add('is-expanded');
                setSeam('pro');
                active = 'pro';
            }
        });
        socialPanel.addEventListener('focus', function () {
            proPanel.classList.remove('is-expanded');
            if (!reduceMotion) {
                socialPanel.classList.add('is-expanded');
                setSeam('social');
                active = 'social';
            }
        });
        proPanel.addEventListener('blur', function () {
            if (document.activeElement !== socialPanel) clearExpand();
        });
        socialPanel.addEventListener('blur', function () {
            if (document.activeElement !== proPanel) clearExpand();
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

        initStabilizedExpand();

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
