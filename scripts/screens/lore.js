// lore.js — Pre-game lore cutscene, military briefing style

const LORE_KEY = 'vault84_lore_seen';

const SLIDES = [
    {
        date: 'OCTOBER 23, 2077',
        location: 'EASTERN SEABOARD — CLASSIFIED',
        tag: 'TOP SECRET // VOLTEC EYES ONLY',
        lines: [
            'At 09:47 EST, nuclear exchange between world powers was confirmed.',
            'Estimated detonations: 247.',
            'Projected casualties within 48 hours: 2.1 billion.',
            'Surface conditions: uninhabitable within 72 hours.',
            '',
            'The world outside no longer exists as you knew it.',
        ]
    },
    {
        date: 'OCTOBER 23, 2077 — 11:02 EST',
        location: 'VAULT 84 — EASTERN APPALACHIANS',
        tag: 'FACILITY SEALED — OPERATIONAL',
        lines: [
            'Vault 84 sealed at 11:02 EST. 247 residents confirmed.',
            'Constructed by VOLTEC TECHNOLOGIES, 1969—1975.',
            '',
            'Vault 84 was not built to shelter civilians.',
            'It was built to fund whatever comes next.',
        ]
    },
    {
        date: 'PRESENT DAY — DAY 1,204',
        location: 'VAULT 84 — OVERSEER\'S TERMINAL',
        tag: 'PERSONNEL FILE — ACTIVE ASSIGNMENT',
        lines: [
            'Previous Overseer: status unknown.',
            'Last recorded log entry: 847 days ago.',
            '',
            'Reactor core: degraded. Mining shaft: unmaintained.',
            '',
            'You have been assigned command of Vault 84.',
        ]
    },
    {
        date: 'OPERATIONAL DIRECTIVE',
        location: 'VAULT 84 — MISSION BRIEFING',
        tag: 'OVERSEER EYES ONLY',
        lines: [
            'Keep the reactor online. Without power, nothing runs.',
            'Extract ore. Sell it. Upgrade everything.',
            'Security threats will escalate. Deal with them fast.',
            '',
            'The vault depends on you.',
            'The survivors on the surface depend on the vault.',
            '',
            'Good luck, Overseer.',
        ]
    }
];

// ── Subtle 80s terminal SFX ──────────────────────────────────────
function beep(freq, duration, vol=0.04) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gn  = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gn.gain.setValueAtTime(vol, ctx.currentTime);
        gn.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
        osc.connect(gn); gn.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + duration + 0.01);
        setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
    } catch(e) {}
}

function playTypeChar() { beep(1200, 0.015, 0.025); }

function playSlideChange() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [{ f:880, t:0, d:0.04 }, { f:660, t:0.05, d:0.07 }].forEach(({f,t,d}) => {
            const o = ctx.createOscillator(); o.type='square'; o.frequency.value=f;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.04, ctx.currentTime+t);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+d);
            o.connect(g); g.connect(ctx.destination);
            o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+d+0.01);
        });
        setTimeout(() => ctx.close(), 300);
    } catch(e) {}
}

function playConfirm() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [{ f:440, t:0, d:0.05 }, { f:660, t:0.06, d:0.09 }].forEach(({f,t,d}) => {
            const o = ctx.createOscillator(); o.type='square'; o.frequency.value=f;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.04, ctx.currentTime+t);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+d);
            o.connect(g); g.connect(ctx.destination);
            o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+d+0.01);
        });
        setTimeout(() => ctx.close(), 300);
    } catch(e) {}
}

// ── Screen ───────────────────────────────────────────────────────
export function createLoreScreen(manager) {
    let currentSlide = 0;
    let typeTimer    = null;
    let canAdvance   = false;
    let charCount    = 0; // play type sound every N chars

    function stopTyping() {
        if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    }

    function updateMeta(idx) {
        const s = SLIDES[idx];
        const tag  = document.getElementById('lore-tag');
        const date = document.getElementById('lore-date');
        const loc  = document.getElementById('lore-loc');
        const dots = document.getElementById('lore-dots');
        const next = document.getElementById('lore-next');
        if (tag)  tag.textContent  = s.tag;
        if (date) date.textContent = s.date;
        if (loc)  loc.textContent  = '▸ ' + s.location;
        if (dots) dots.innerHTML   = SLIDES.map((_,i) =>
            `<div style="width:5px;height:5px;border-radius:50%;background:${
                i===idx?'#14fdce':i<idx?'#2a6a3a':'#0d2a18'};"></div>`
        ).join('');
        if (next) {
            next.textContent  = idx === SLIDES.length-1 ? 'BEGIN OPERATIONS ▸' : 'CONTINUE ▸';
            next.style.opacity = '0.3';
            next.style.pointerEvents = 'none';
        }
    }

    function typeSlide(idx) {
        stopTyping();
        canAdvance = false;
        charCount  = 0;
        updateMeta(idx);

        const body = document.getElementById('lore-body');
        if (!body) return;
        body.innerHTML = '';

        const lines = SLIDES[idx].lines;
        const els = lines.map(txt => {
            const p = document.createElement('p');
            p.style.cssText = 'margin:0 0 1px;min-height:1.6em;';
            if (txt === '') p.innerHTML = '&nbsp;';
            body.appendChild(p);
            return { p, txt };
        });

        let li = 0, ci = 0;
        function typeStep() {
            // Skip empty lines instantly
            while (li < els.length && els[li].txt === '') li++;
            if (li >= els.length) {
                typeTimer = null;
                canAdvance = true;
                const next = document.getElementById('lore-next');
                if (next) { next.style.opacity='1'; next.style.pointerEvents='auto'; }
                return;
            }
            const { p, txt } = els[li];
            if (ci < txt.length) {
                p.textContent = txt.slice(0, ++ci);
                charCount++;
                if (charCount % 4 === 0) playTypeChar();
            } else {
                li++; ci = 0;
            }
            // Variable delay: normal chars 18-40ms, punctuation pauses longer
            const ch = txt[ci-1] || '';
            const delay = '.!?,'.includes(ch) ? 120 + Math.random()*80
                        : ' '.includes(ch)    ? 40  + Math.random()*20
                        : 18 + Math.random()*28;
            typeTimer = setTimeout(typeStep, delay);
        }
        typeStep();
    }

    function finishSlide() {
        stopTyping();
        const body = document.getElementById('lore-body');
        if (body) {
            const ps = body.querySelectorAll('p');
            SLIDES[currentSlide].lines.forEach((txt, i) => {
                if (!ps[i]) return;
                if (txt === '') ps[i].innerHTML = '&nbsp;';
                else ps[i].textContent = txt;
            });
        }
        canAdvance = true;
        const next = document.getElementById('lore-next');
        if (next) { next.style.opacity='1'; next.style.pointerEvents='auto'; }
    }

    function advance() {
        playSlideChange();
        currentSlide++;
        if (currentSlide >= SLIDES.length) {
            stopTyping();
            playConfirm();
            localStorage.setItem(LORE_KEY, '1');
            setTimeout(() => manager.navigateTo(localStorage.getItem('vault84_difficulty') ? 'game' : 'difficulty'), 200);
            return;
        }
        typeSlide(currentSlide);
    }

    function doNext() {
        if (!canAdvance) finishSlide();
        else advance();
    }

    function doSkip() {
        stopTyping();
        localStorage.setItem(LORE_KEY, '1');
        playSlideChange();
        setTimeout(() => manager.navigateTo(localStorage.getItem('vault84_difficulty') ? 'game' : 'difficulty'), 100);
    }

    return {
        async render() {
            manager.audio.setVolume('bg', 0.1);
            manager.audio.play('bg');
            manager.audio.loop?.('bg', true);
            manager.root.innerHTML = `
            <div class="piece output" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:2rem 1.5rem;box-sizing:border-box;">
              <div style="max-width:560px;width:100%;">

                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                  <span style="font-size:0.55rem;color:#1a5a2a;letter-spacing:3px;">VOLTEC TECHNOLOGIES // CLASSIFIED ARCHIVE</span>
                  <span style="font-size:0.55rem;color:#1a5a2a;letter-spacing:3px;">VAULT 84</span>
                </div>

                <div style="border:1px solid #0d3a20;background:rgba(0,0,0,0.5);padding:1.5rem 1.8rem;">
                  <div id="lore-tag"  style="font-size:0.58rem;color:#2a7a45;letter-spacing:4px;margin-bottom:5px;"></div>
                  <div id="lore-date" style="font-size:1rem;color:#14fdce;letter-spacing:3px;font-weight:700;line-height:1.3;"></div>
                  <div id="lore-loc"  style="font-size:0.7rem;color:#3d9970;letter-spacing:2px;margin-top:3px;"></div>
                  <div style="border-bottom:1px solid #0d3a20;margin:0.75rem 0;"></div>
                  <div id="lore-body" style="font-size:0.86rem;line-height:1.9;color:#14fdce;min-height:175px;"></div>
                  <div id="lore-dots" style="display:flex;gap:5px;margin-top:1rem;"></div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.6rem;">
                  <button id="lore-skip" style="font-family:'VT323',monospace;font-size:0.68rem;letter-spacing:2px;background:transparent;border:0;color:#1a5a2a;cursor:pointer;padding:4px 0;">[ SKIP ALL ]</button>
                  <button id="lore-next" style="font-family:'VT323',monospace;font-size:0.82rem;letter-spacing:3px;background:transparent;border:1px solid #14fdce;color:#14fdce;cursor:pointer;padding:5px 18px;opacity:0.3;pointer-events:none;transition:opacity 0.3s;">CONTINUE ▸</button>
                </div>

              </div>
            </div>`;

            // Bind AFTER innerHTML so elements exist
            document.getElementById('lore-next').onclick = doNext;
            document.getElementById('lore-skip').onclick = doSkip;

            // Keyboard support
            const onKey = (e) => {
                if (e.code==='Space'||e.code==='Enter') { e.preventDefault(); doNext(); }
                if (e.code==='Escape') { e.preventDefault(); doSkip(); }
            };
            document.addEventListener('keydown', onKey);
            manager._loreKey = onKey;

            // Start
            currentSlide = 0;
            typeSlide(0);
        },

        onExit() {
            stopTyping();
            if (manager._loreKey) {
                document.removeEventListener('keydown', manager._loreKey);
                delete manager._loreKey;
            }
        }
    };
}
