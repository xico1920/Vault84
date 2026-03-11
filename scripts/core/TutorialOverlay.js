// TutorialOverlay.js — interactive paper manual

const TUTORIAL_KEY = 'vault84_tutorial_seen';

// SVG icons — line art, same color as dept tint, no emojis
const ICONS = {
    reactor: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r="7" stroke-dasharray="3 2"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="1" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="19" y2="10"/></svg>`,
    mining:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="3" y1="17" x2="17" y2="3"/><line x1="3" y1="17" x2="7" y2="13"/><rect x="1" y="15" width="5" height="4" rx="1"/><line x1="13" y1="7" x2="17" y2="3"/><line x1="11" y1="5" x2="15" y2="9"/></svg>`,
    refinery:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="8" width="10" height="10" rx="1"/><path d="M7 8V5h6v3"/><path d="M8 5V3h4v2"/><line x1="8" y1="12" x2="12" y2="12"/><line x1="10" y1="10" x2="10" y2="14"/></svg>`,
    water:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 2 C10 2 4 9 4 13 a6 6 0 0 0 12 0 C16 9 10 2 10 2z"/><line x1="7" y1="14" x2="9" y2="12"/></svg>`,
    storage: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3" width="16" height="4" rx="1"/><rect x="2" y="9" width="16" height="4" rx="1"/><rect x="2" y="15" width="16" height="2" rx="1"/><circle cx="15" cy="5" r="0.8" fill="currentColor"/><circle cx="15" cy="11" r="0.8" fill="currentColor"/></svg>`,
    workshop:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="3"/><path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2.1 2.1M14.4 14.4l2.1 2.1M3.5 16.5l2.1-2.1M14.4 5.6l2.1-2.1"/></svg>`,
    security:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 2 L17 5 V10 C17 14.5 13.5 17.8 10 19 C6.5 17.8 3 14.5 3 10 V5 Z"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="10" y1="7" x2="10" y2="13"/></svg>`,
};

const DEPTS = [
    { icon: ICONS.reactor,  name: 'REACTOR CORE',    color: '#0eb88a', desc: 'Heart of the vault. Keep it online and below 1800°C. Upgrade coolant flow for better efficiency. Without power, nothing runs.' },
    { icon: ICONS.mining,   name: 'MINING SHAFT',    color: '#a89400', desc: 'Extracts raw ore from the rock. Hit MINE manually or let auto-mining tick away. More upgrades equals faster extraction.' },
    { icon: ICONS.refinery, name: 'ORE REFINERY',    color: '#c06a00', desc: 'Converts raw ore into refined ore worth far more caps. Needs reactor power to run. Upgrade efficiency to squeeze more output per cycle.' },
    { icon: ICONS.water,    name: 'WATER TREATMENT', color: '#1a72aa', desc: 'Keeps the reactor from overheating. If the pump goes offline and temps spike past 800°C, emergency shutdown triggers.' },
    { icon: ICONS.storage,  name: 'SMART STORAGE',   color: '#0e8080', desc: 'Sells ore for caps. Use auto-sell or trigger manually. Prices fluctuate — sell refined ore when rates are high.' },
    { icon: ICONS.workshop, name: 'WORKSHOP',        color: '#6a40aa', desc: 'Spend caps to permanently upgrade every department. Invest early — each level compounds. Reactor and water upgrades first.' },
    { icon: ICONS.security, name: 'SECURITY',        color: '#aa1818', desc: 'Threats appear over time — viruses, malfunctions, breaches. Each unresolved threat drains efficiency vault-wide. Deal with them fast.' },
];

// ── Pen scratch SFX ────────────────────────────────────────────
function playPenSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const strokes = [
            {t:0.00,len:0.10,f:2800},{t:0.12,len:0.07,f:3200},{t:0.22,len:0.13,f:2600},
            {t:0.38,len:0.06,f:3400},{t:0.46,len:0.09,f:2900},{t:0.58,len:0.08,f:3100},
            {t:0.68,len:0.14,f:2700},{t:0.85,len:0.07,f:3300},{t:0.95,len:0.11,f:2500},
            {t:1.10,len:0.08,f:3000},{t:1.22,len:0.12,f:2800},
        ];
        strokes.forEach(s => {
            const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * s.len), ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++)
                d[i] = (Math.random()*2-1) * Math.sin(Math.PI*i/d.length) * 0.35;
            const src = ctx.createBufferSource(); src.buffer = buf;
            const bpf = ctx.createBiquadFilter(); bpf.type='bandpass'; bpf.frequency.value=s.f; bpf.Q.value=3.5;
            const g = ctx.createGain(); g.gain.value = 0.55;
            src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
            src.start(ctx.currentTime+s.t); src.stop(ctx.currentTime+s.t+s.len+0.01);
        });
        setTimeout(() => ctx.close(), 1800);
    } catch(e) {}
}

export function showTutorialIfFirstTime(username) {
    if (localStorage.getItem(TUTORIAL_KEY)) return Promise.resolve();

    return new Promise(resolve => {
        localStorage.setItem(TUTORIAL_KEY, '1');

        const safe = (username||'Overseer').replace(/[<>&"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));

        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tut-paper" id="tut-paper">

                <div class="tut-header">
                    <div class="tut-stamp">CLASSIFIED</div>
                    <div class="tut-title-block">
                        <div class="tut-logo">VOLTEC TECHNOLOGIES</div>
                        <div class="tut-title">OVERSEER FIELD MANUAL</div>
                        <div class="tut-sub">Vault 84 — Operations Briefing · Authorised Personnel Only</div>
                    </div>
                    <div class="tut-doc-num">DOC-84-OPS-001<br>REV. C / 1984</div>
                </div>

                <div class="tut-intro">
                    <p>Congratulations, Overseer. You have been assigned command of <strong>Vault 84</strong>. Your objective is to keep all vault systems operational, maximise ore extraction revenue, and neutralise security threats before they cascade.</p>
                    <p>Study the department objectives below, then sign to acknowledge your assignment.</p>
                </div>

                <div class="tut-rule"></div>
                <div class="tut-section-label">▸ DEPARTMENT OBJECTIVES</div>

                <div class="tut-grid">
                    ${DEPTS.map(d => `
                    <div class="tut-dept">
                        <div class="tut-dept-badge" style="border-color:${d.color};color:${d.color}">${d.icon}</div>
                        <div>
                            <div class="tut-dept-name" style="color:${d.color}">${d.name}</div>
                            <div class="tut-dept-desc">${d.desc}</div>
                        </div>
                    </div>`).join('')}
                </div>

                <div class="tut-rule"></div>

                <div class="tut-tip-box">
                    <span class="tut-tip-label">FIELD NOTE</span>
                    Check <strong>STATUS</strong> for a live overview of all systems. Watch your treasury in the top bar — if it hits zero, upgrades stall and the vault falls behind.
                </div>

                <div class="tut-signature-block" id="tut-sig-block">
                    <div class="tut-sig-label">Overseer Designation — Sign to acknowledge your assignment:</div>

                    <div class="tut-sign-prompt" id="tut-sign-prompt">
                        <div class="tut-sign-line">
                            <span class="tut-sign-x">✕</span>
                            <span class="tut-sign-dash">________________________________</span>
                        </div>
                        <button class="tut-sign-btn" id="tut-sign-btn">[ SIGN DOCUMENT ]</button>
                    </div>

                    <div class="tut-signed" id="tut-signed" style="display:none;">
                        <svg class="tut-sig-svg" viewBox="0 0 360 72" xmlns="http://www.w3.org/2000/svg">
                            <text class="tut-sig-text" x="14" y="50">${safe}</text>
                            <path class="tut-sig-underline" d="M12 58 Q180 68 330 54 Q348 51 336 58"/>
                        </svg>
                        <div class="tut-sig-meta">${safe} · Vault 84 · ${new Date().getFullYear()}</div>
                    </div>
                </div>

                <button class="tut-close" id="tut-close" style="opacity:0;pointer-events:none;transition:opacity 0.4s ease;">
                    [ BEGIN OPERATIONS ]
                </button>

                <!-- paperclip: pure CSS, no pseudo-element bugs -->
                <div class="tut-clip-wrap">
                    <div class="tut-clip-outer"></div>
                    <div class="tut-clip-inner"></div>
                </div>
                <div class="tut-fold-crease"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => requestAnimationFrame(() => {
            overlay.classList.add('tut-visible');
        }));

        document.getElementById('tut-sign-btn').addEventListener('click', () => {
            const prompt   = document.getElementById('tut-sign-prompt');
            const signed   = document.getElementById('tut-signed');
            const closeBtn = document.getElementById('tut-close');

            prompt.style.transition = 'opacity 0.2s';
            prompt.style.opacity = '0';
            setTimeout(() => { prompt.style.display = 'none'; }, 200);

            playPenSound();

            setTimeout(() => {
                signed.style.display = 'block';
                const paper = document.getElementById('tut-paper');
                paper.style.transition = 'transform 0.12s ease';
                paper.style.transform = 'rotate(-0.3deg) translateY(2px)';
                setTimeout(() => { paper.style.transform = 'rotate(-0.3deg) translateY(0)'; }, 140);
            }, 220);

            setTimeout(() => {
                closeBtn.style.opacity = '1';
                closeBtn.style.pointerEvents = 'all';
                closeBtn.classList.add('tut-close-ready');
            }, 1650);
        });

        document.getElementById('tut-close').addEventListener('click', () => {
            overlay.classList.remove('tut-visible');
            overlay.classList.add('tut-hiding');
            setTimeout(() => { overlay.remove(); resolve(); }, 500);
        });

        overlay.addEventListener('click', e => {
            const btn = document.getElementById('tut-close');
            if (e.target === overlay && btn && btn.style.pointerEvents !== 'none') btn.click();
        });
    });
}
