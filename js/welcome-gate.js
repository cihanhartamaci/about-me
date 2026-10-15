(function () {
    'use strict';

    var STORAGE_KEY = 'welcomeGateChoice';
    var gate = document.getElementById('welcomeGate');
    var proPanel = document.getElementById('gatePro');
    var socialPanel = document.getElementById('gateSocial');
    var skipButtons = document.querySelectorAll('[data-gate-skip]');
    var rainCanvas = document.getElementById('gateRain');

    if (!gate) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        stopRain();
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

    /* Soft glyph rain — decorative only, never affects hit targets */
    var rainRaf = 0;
    var rainRunning = false;

    function stopRain() {
        rainRunning = false;
        if (rainRaf) {
            window.cancelAnimationFrame(rainRaf);
            rainRaf = 0;
        }
    }

    function initRain() {
        if (!rainCanvas || reduceMotion || typeof rainCanvas.getContext !== 'function') return;

        var ctx = rainCanvas.getContext('2d');
        if (!ctx) return;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var cols = [];
        var glyphs = '01アイウエオカキクケコサシスセソタチツテト<>[]{}/=+*#@$%';
        var fontSize = 14;
        var lastTs = 0;

        function resize() {
            var w = gate.clientWidth;
            var h = gate.clientHeight;
            rainCanvas.width = Math.floor(w * dpr);
            rainCanvas.height = Math.floor(h * dpr);
            rainCanvas.style.width = w + 'px';
            rainCanvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var colCount = Math.max(12, Math.floor(w / fontSize));
            cols = [];
            for (var i = 0; i < colCount; i++) {
                cols.push({
                    y: Math.random() * h,
                    speed: 0.35 + Math.random() * 0.85,
                    hue: Math.random() > 0.55 ? 'blue' : 'red'
                });
            }
        }

        function frame(ts) {
            if (!rainRunning) return;
            if (ts - lastTs < 40) {
                rainRaf = window.requestAnimationFrame(frame);
                return;
            }
            lastTs = ts;

            var w = gate.clientWidth;
            var h = gate.clientHeight;
            ctx.fillStyle = 'rgba(4, 7, 12, 0.12)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = fontSize + 'px "Fira Code", monospace';

            for (var i = 0; i < cols.length; i++) {
                var col = cols[i];
                var x = i * fontSize;
                var ch = glyphs.charAt((Math.random() * glyphs.length) | 0);
                if (col.hue === 'blue') {
                    ctx.fillStyle = 'rgba(58, 160, 255, 0.55)';
                } else {
                    ctx.fillStyle = 'rgba(226, 61, 74, 0.42)';
                }
                ctx.fillText(ch, x, col.y);
                col.y += fontSize * col.speed;
                if (col.y > h + fontSize * 4) {
                    col.y = -Math.random() * h * 0.3;
                    col.speed = 0.35 + Math.random() * 0.85;
                }
            }

            rainRaf = window.requestAnimationFrame(frame);
        }

        resize();
        rainRunning = true;
        rainRaf = window.requestAnimationFrame(frame);

        var resizeTimer = 0;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(resize, 120);
        });
    }

    function init() {
        // Always show the choice gate on load. Never auto-unlock from
        // #hub, sessionStorage, or any other returning-visitor signal —
        // hub entry requires an explicit pill click or Skip control.
        document.body.classList.remove('gate-unlocked');
        document.body.classList.add('gate-locked');

        var hub = document.getElementById('proHub');
        if (hub) {
            hub.setAttribute('aria-hidden', 'true');
        }

        // Drop a leftover #hub from a prior unlock so refresh/share URLs
        // do not look like an already-chosen professional deep-link.
        if ((window.location.hash || '').toLowerCase() === '#hub') {
            if (window.history && window.history.replaceState) {
                window.history.replaceState(
                    null,
                    '',
                    window.location.pathname + window.location.search
                );
            }
        }

        requestAnimationFrame(function () {
            gate.classList.add('is-ready');
        });

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

        initRain();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
