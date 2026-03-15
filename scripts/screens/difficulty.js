import { GameState } from '../core/GameState.js';

const DIFFICULTIES = [
    {
        id: 'EASY',
        label: 'CADET',
        color: '#14fdce',
        desc: 'Reduced threats. Slower wear. For those new to the vault.',
        details: ['Threats every 180s', 'Wear rate ×0.5', 'Prices +20%'],
    },
    {
        id: 'STANDARD',
        label: 'OVERSEER',
        color: '#d4e800',
        desc: 'The intended experience. Balanced challenge.',
        details: ['Threats every 120s', 'Standard wear', 'Standard prices'],
        default: true,
    },
    {
        id: 'HARD',
        label: 'DIRECTOR',
        color: '#ff8800',
        desc: 'Frequent threats. Faster degradation. Stay alert.',
        details: ['Threats every 75s', 'Wear rate ×1.6', 'Prices -15%'],
    },
    {
        id: 'NIGHTMARE',
        label: 'ADMINISTRATOR',
        color: '#ff2222',
        desc: 'Relentless. Systems fail faster. Every decision matters.',
        details: ['Threats every 45s', 'Wear rate ×2.5', 'Prices -30%'],
    },
];

export function createDifficultyScreen(manager, USERNAME_KEY) {
    let selected = 'STANDARD';

    return {
        async render() {
            manager.audio.setVolume('bg', 0.1);
            manager.audio.play('bg');
            manager.audio.loop?.('bg', true);
            manager.root.innerHTML = `
                <div class="piece output" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:1.5rem;">
                    <h1 style="margin-bottom:0.2rem;">SECURITY CLEARANCE</h1>
                    <p style="color:#3d9970;margin-bottom:1.5rem;letter-spacing:2px;font-size:0.85rem;">SELECT OPERATIONAL PARAMETERS</p>

                    <div id="diff-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;width:100%;max-width:480px;margin-bottom:1.5rem;">
                        ${DIFFICULTIES.map(d => `
                            <div class="diff-card ${d.id === selected ? 'diff-selected' : ''}"
                                 data-id="${d.id}"
                                 style="border:1px solid ${d.id === selected ? d.color : '#1a4a2e'};
                                        padding:0.75rem;cursor:pointer;background:rgba(0,0,0,0.3);
                                        transition:border-color 0.15s,background 0.15s;">
                                <div style="color:${d.color};font-size:1rem;letter-spacing:3px;margin-bottom:3px;">${d.label}</div>
                                <div style="font-size:0.7rem;color:#5ecba8;margin-bottom:0.5rem;line-height:1.4;">${d.desc}</div>
                                ${d.details.map(det => `<div style="font-size:0.65rem;color:#2a7a55;letter-spacing:1px;">> ${det}</div>`).join('')}
                            </div>
                        `).join('')}
                    </div>

                    <a href="#" id="diff-continue" class="terminal-link" style="font-size:1.2rem;letter-spacing:4px;">[ CONFIRM CLEARANCE ]</a>
                    <p style="color:#1a4a2e;font-size:0.7rem;margin-top:1rem;letter-spacing:1px;">DIFFICULTY CANNOT BE CHANGED AFTER SELECTION</p>
                </div>`;

            // Card selection
            document.querySelectorAll('.diff-card').forEach(card => {
                card.addEventListener('click', () => {
                    selected = card.dataset.id;
                    document.querySelectorAll('.diff-card').forEach(c => {
                        const d = DIFFICULTIES.find(x => x.id === c.dataset.id);
                        c.style.borderColor = c.dataset.id === selected ? d.color : '#1a4a2e';
                        c.style.background  = c.dataset.id === selected ? 'rgba(20,253,206,0.04)' : 'rgba(0,0,0,0.3)';
                    });
                });
            });

            document.getElementById('diff-continue').addEventListener('click', e => {
                e.preventDefault();
                // Apply difficulty modifiers to GameState
                GameState.difficulty = selected;
                const mods = {
                    EASY:      { threatInterval: 180, wearMult: 0.5,  priceMult: 1.2  },
                    STANDARD:  { threatInterval: 120, wearMult: 1.0,  priceMult: 1.0  },
                    HARD:      { threatInterval: 75,  wearMult: 1.6,  priceMult: 0.85 },
                    NIGHTMARE: { threatInterval: 45,  wearMult: 2.5,  priceMult: 0.7  },
                }[selected];
                GameState.security.threatInterval    = mods.threatInterval;
                GameState._diffWearMult              = mods.wearMult;
                GameState.ssm.rawOrePrice            = Math.round(2 * mods.priceMult * 10) / 10;
                GameState.ssm.refinedOrePrice        = Math.round(8 * mods.priceMult * 10) / 10;
                localStorage.setItem('vault84_difficulty', selected);
                manager.navigateTo('auth');
            });
        },
        onExit() {}
    };
}
