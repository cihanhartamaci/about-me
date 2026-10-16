(function () {
    'use strict';

    var STORAGE_KEY = 'welcomeGateChoice';
    var INTRO_KEY = 'pathIntroSeen';
    var gate = document.getElementById('welcomeGate');
    var intro = document.getElementById('pathIntro');
    var introSkip = document.getElementById('introSkip');
    var introCanvas = document.getElementById('introCanvas');
    var rainCanvas = document.getElementById('gateRain');
    var socialPanel = document.getElementById('gateSocial');

    if (!gate) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var introRaf = 0;
    var rainRaf = 0;
    var rainRunning = false;

    function rememberChoice(choice) {
        try {
            sessionStorage.setItem(STORAGE_KEY, choice);
        } catch (e) { /* ignore */ }
    }

    function markIntroSeen() {
        try {
            sessionStorage.setItem(INTRO_KEY, '1');
        } catch (e) { /* ignore */ }
    }

    function hasSeenIntro() {
        try {
            return sessionStorage.getItem(INTRO_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function showGate() {
        document.body.classList.add('intro-done');
        if (intro) {
            intro.classList.add('is-done');
            intro.setAttribute('aria-hidden', 'true');
        }
        requestAnimationFrame(function () {
            gate.classList.add('is-ready');
        });
        initRain();
    }

    function finishIntro(immediate) {
        markIntroSeen();
        stopIntroCanvas();
        if (immediate) {
            showGate();
            return;
        }
        if (intro) intro.classList.add('is-exiting');
        window.setTimeout(showGate, reduceMotion ? 0 : 520);
    }

    /* Soft glyph rain — decorative only */
    function stopRain() {
        rainRunning = false;
        if (rainRaf) {
            window.cancelAnimationFrame(rainRaf);
            rainRaf = 0;
        }
    }

    function initRain() {
        if (!rainCanvas || reduceMotion || typeof rainCanvas.getContext !== 'function') return;
        if (rainRunning) return;

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
                ctx.fillStyle = col.hue === 'blue'
                    ? 'rgba(58, 160, 255, 0.55)'
                    : 'rgba(226, 61, 74, 0.42)';
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

    function stopIntroCanvas() {
        if (introRaf) {
            window.cancelAnimationFrame(introRaf);
            introRaf = 0;
        }
    }

    function initIntroCanvas() {
        if (!introCanvas || reduceMotion || typeof introCanvas.getContext !== 'function') return;
        var ctx = introCanvas.getContext('2d');
        if (!ctx) return;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var particles = [];
        var start = performance.now();

        function resize() {
            var w = window.innerWidth;
            var h = window.innerHeight;
            introCanvas.width = Math.floor(w * dpr);
            introCanvas.height = Math.floor(h * dpr);
            introCanvas.style.width = w + 'px';
            introCanvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles = [];
            var count = Math.min(90, Math.floor((w * h) / 18000));
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: 0.6 + Math.random() * 1.8,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: 0.15 + Math.random() * 0.55,
                    hue: Math.random() > 0.5 ? 'blue' : 'red',
                    a: 0.15 + Math.random() * 0.45
                });
            }
        }

        function frame(ts) {
            var w = window.innerWidth;
            var h = window.innerHeight;
            var t = (ts - start) / 1000;
            ctx.clearRect(0, 0, w, h);

            // Soft dual-lens washes (original geometry — not a film still)
            var cx = w * 0.5;
            var cy = h * 0.42;
            var pulse = 0.55 + Math.sin(t * 1.4) * 0.2;
            var lensR = Math.min(w, h) * 0.18;
            var leftX = cx - Math.min(w * 0.18, 140);
            var rightX = cx + Math.min(w * 0.18, 140);

            var blue = ctx.createRadialGradient(leftX, cy, 0, leftX, cy, lensR * 2.4);
            blue.addColorStop(0, 'rgba(58, 160, 255,' + (0.32 * pulse) + ')');
            blue.addColorStop(1, 'rgba(58, 160, 255, 0)');
            ctx.fillStyle = blue;
            ctx.fillRect(0, 0, w, h);

            var red = ctx.createRadialGradient(rightX, cy, 0, rightX, cy, lensR * 2.4);
            red.addColorStop(0, 'rgba(226, 61, 74,' + (0.3 * pulse) + ')');
            red.addColorStop(1, 'rgba(226, 61, 74, 0)');
            ctx.fillStyle = red;
            ctx.fillRect(0, 0, w, h);

            // Faint circular rim outlines behind the CSS lenses
            ctx.save();
            ctx.globalAlpha = 0.22 + pulse * 0.12;
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(126, 196, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(leftX, cy, lensR * 1.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 122, 132, 0.7)';
            ctx.beginPath();
            ctx.arc(rightX, cy, lensR * 1.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.y > h + 4) {
                    p.y = -4;
                    p.x = Math.random() * w;
                }
                ctx.beginPath();
                ctx.fillStyle = p.hue === 'blue'
                    ? 'rgba(126, 196, 255,' + p.a + ')'
                    : 'rgba(255, 122, 132,' + p.a + ')';
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }

            introRaf = window.requestAnimationFrame(frame);
        }

        resize();
        introRaf = window.requestAnimationFrame(frame);
        window.addEventListener('resize', resize);
    }

    function startIntro() {
        if (!intro || reduceMotion || hasSeenIntro()) {
            if (intro) {
                intro.classList.add('is-done');
                intro.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.add('intro-done');
            showGate();
            return;
        }

        document.body.classList.add('intro-playing');
        intro.classList.add('is-playing');
        initIntroCanvas();

        // Timed beats: lenses → brand bridge → lines; auto-advance to gate
        window.setTimeout(function () {
            finishIntro(false);
        }, 4800);

        if (introSkip) {
            introSkip.addEventListener('click', function () {
                finishIntro(true);
            });
        }

        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.removeEventListener('keydown', onKey);
                finishIntro(true);
            }
        });
    }

    function init() {
        document.body.classList.add('gate-locked');
        document.body.classList.remove('gate-unlocked');

        if (socialPanel) {
            socialPanel.addEventListener('click', function () {
                rememberChoice('social');
            });
        }

        var proLinks = document.querySelectorAll('#gatePro, .gate-skip, .gate-skip-mobile, .gate-wordmark');
        proLinks.forEach(function (el) {
            el.addEventListener('click', function () {
                rememberChoice('pro');
                stopRain();
            });
        });

        startIntro();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
