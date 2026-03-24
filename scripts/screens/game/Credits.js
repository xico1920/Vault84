// Credits.js — Developer info screen

export function createCreditsScreen() {
    const DEVS = [
        {
            name:  'FRANCISCO SILVA',
            role:  'DEVELOPER',
            code:  'DEV-01',
            photo: 'assets/img/dev_francisco.png',
            links: [
                { label: 'LINKEDIN',  icon: 'in', url: 'https://www.linkedin.com/in/francisco-silva-59747619b/' },
                { label: 'INSTAGRAM', icon: 'ig', url: 'https://www.instagram.com/xico_silva19/' },
                { label: 'LINKTREE',  icon: 'lt', url: 'https://linktr.ee/Xico_' },
            ]
        },
        {
            name:  'TOMÁS LONGLE',
            role:  'DEVELOPER',
            code:  'DEV-02',
            photo: 'assets/img/dev_tomas.png',
            links: [
                { label: 'LINKEDIN',  icon: 'in', url: 'https://www.linkedin.com/in/tmslongle/' },
                { label: 'INSTAGRAM', icon: 'ig', url: 'https://www.instagram.com/tmslongle/' },
                { label: 'LINKTREE',  icon: 'lt', url: 'https://linktr.ee/tmslongle' },
            ]
        }
    ];

    const ICONS = {
        in: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4zm2 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-1 2h2v8H5V10zm4 0h1.9v1.1A3.2 3.2 0 0 1 13.8 10C16 10 17 11.5 17 14v4h-2v-3.5c0-1.3-.5-2-1.5-2s-1.5.7-1.5 2V18H9z"/></svg>`,
        ig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
        lt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 7 L12 2 L7 7"/><path d="M17 13 L12 8 L7 13"/><line x1="12" y1="8" x2="12" y2="22"/></svg>`,
    };

    return {
        render() {
            return `
            <style>
              .cred-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; height:100%; padding-top:0.5rem; }
              @media (max-width:540px) { .cred-grid { grid-template-columns:1fr; height:auto; } }
              .cred-name {
                font-size:1.3rem;color:var(--hi);letter-spacing:2px;line-height:1.1;cursor:default;font-family:var(--font);
              }
              .cred-link {
                display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.8rem;
                color:var(--dim);text-decoration:none;flex:1;
                transition:color 0.1s, background 0.1s;
              }
              .cred-link:hover { color:var(--hi); background:rgba(20,253,206,0.04); }
              .cred-link:hover .lk-icon { filter:drop-shadow(0 0 5px rgba(20,253,206,0.7)); }
              .lk-arr { opacity:0; transition:opacity 0.1s; }
              .cred-link:hover .lk-arr { opacity:1; animation:blink-cursor 0.4s step-start 3; }
              .cred-photo-wrap { position:relative; overflow:hidden; cursor:default; }
              .cred-photo-wrap img { display:block; }
              .cred-photo-wrap:hover img { animation:crt-glitch 0.5s steps(1) forwards; }
              .cred-photo-noise {
                position:absolute;inset:0;
                background:repeating-linear-gradient(to bottom,rgba(20,253,206,0.04) 0px,rgba(20,253,206,0.04) 1px,transparent 1px,transparent 3px);
                pointer-events:none;opacity:0;transition:opacity 0.1s;
              }
              .cred-photo-wrap:hover .cred-photo-noise { opacity:1; }
              @keyframes crt-glitch {
                0%   { filter:brightness(1);   transform:translateX(0);    }
                15%  { filter:brightness(2.5); transform:translateX(-3px); opacity:0.7; }
                30%  { filter:brightness(0.4); transform:translateX(3px);  clip-path:inset(15% 0 25% 0); }
                45%  { filter:brightness(1.8); transform:translateX(-1px); clip-path:none; opacity:1; }
                60%  { filter:brightness(1);   transform:translateX(2px);  }
                75%  { filter:brightness(1.4); transform:translateX(-2px); clip-path:inset(40% 0 10% 0); }
                90%  { filter:brightness(0.8); transform:translateX(1px);  clip-path:none; }
                100% { filter:brightness(1);   transform:translateX(0);    }
              }
            </style>
            <div class="cred-grid">

              ${DEVS.map(dev => `
              <div style="border:1px solid var(--muted);background:rgba(20,253,206,0.02);display:flex;flex-direction:column;">

                <!-- Top bar -->
                <div style="background:rgba(20,253,206,0.06);border-bottom:1px solid var(--muted);padding:0.4rem 0.8rem;display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:0.55rem;color:var(--muted);letter-spacing:3px;">${dev.code} // PERSONNEL FILE</span>
                  <span style="font-size:0.55rem;color:var(--muted);letter-spacing:2px;">VAULT 84</span>
                </div>

                <!-- Photo + name -->
                <div style="display:flex;gap:0;border-bottom:1px solid var(--muted);">
                  <div class="cred-photo-wrap" style="flex-shrink:0;border-right:1px solid var(--muted);">
                    <img src="${dev.photo}" alt="${dev.name}"
                      style="width:clamp(80px,25vw,130px);height:clamp(80px,25vw,130px);object-fit:cover;image-rendering:pixelated;">
                    <div class="cred-photo-noise"></div>
                    <div style="font-size:0.45rem;color:var(--muted);letter-spacing:1px;text-align:center;padding:3px 0;border-top:1px solid var(--muted);">▓ 16-BIT RENDER</div>
                  </div>
                  <div style="padding:0.8rem;display:flex;flex-direction:column;justify-content:center;gap:0.3rem;">
                    <div style="font-size:0.52rem;color:var(--muted);letter-spacing:4px;">${dev.role}</div>
                    <div class="cred-name">${dev.name}</div>
                    <div style="font-size:0.55rem;color:var(--muted);margin-top:0.3rem;letter-spacing:1px;">CLEARANCE LEVEL: OVERSEER</div>
                    <div style="font-size:0.55rem;color:var(--muted);letter-spacing:1px;">STATUS: <span style="color:var(--hi);">ACTIVE</span></div>
                  </div>
                </div>

                <!-- Links -->
                <div style="display:flex;flex-direction:column;flex:1;">
                  ${dev.links.map((l, i) => `
                  <a href="${l.url}" target="_blank" rel="noopener" class="cred-link"
                    style="${i < dev.links.length-1 ? 'border-bottom:1px solid var(--muted);' : ''}">
                    <span class="lk-icon" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS[l.icon]}</span>
                    <span class="lk-label" style="flex:1;font-size:0.8rem;letter-spacing:2px;">${l.label}</span>
                    <span class="lk-arr" style="font-size:0.7rem;">_</span>
                  </a>`).join('')}
                </div>
              </div>`).join('')}

              <!-- Footer -->
              <div style="grid-column:1/-1;border-top:1px solid var(--muted);padding:0.6rem 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                <div style="font-size:0.6rem;color:#1a4a2a;letter-spacing:1px;line-height:1.8;">
                  <span style="color:var(--muted);">// VAULT 84 —</span> HTML · CSS · JS · Three.js · Web Audio API<br>
                  Music: royalty-free &amp; public domain &nbsp;·&nbsp; © ${new Date().getFullYear()} Francisco Silva &amp; Tomás Longle
                </div>
                <div style="font-size:0.55rem;color:#1a4a2a;letter-spacing:2px;text-align:right;">ALL RIGHTS RESERVED</div>
              </div>

            </div>`;
        },
        onRendered() {
            const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&';

            function glitchEl(el, original) {
                let iter = 0, timer = null;
                el.addEventListener('mouseenter', () => {
                    clearInterval(timer);
                    iter = 0;
                    timer = setInterval(() => {
                        el.textContent = original.split('').map((c, i) => {
                            if (c === ' ') return ' ';
                            if (i < iter) return original[i];
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        }).join('');
                        iter += 1.5;
                        if (iter >= original.length) { el.textContent = original; clearInterval(timer); }
                    }, 40);
                });
                el.addEventListener('mouseleave', () => { clearInterval(timer); el.textContent = original; });
            }

            // Names
            document.querySelectorAll('.cred-name').forEach(el => glitchEl(el, el.textContent));
            // Link labels
            document.querySelectorAll('.lk-label').forEach(el => glitchEl(el, el.textContent.trim()));
        },
        onExit() {}
    };
}
