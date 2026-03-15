import { GameNavManager } from '../core/gameNavManager.js';
import { SE } from '../core/SoundEngine.js';
import { startGameLoop, stopGameLoop } from '../core/GameLoop.js';
import { loadGame, saveGame } from '../core/SaveSystem.js';
import { notifyAlert, enableNotifications } from '../core/NotificationSystem.js';
import { GameState } from '../core/GameState.js';
import { mountOscilloscope } from '../core/VisualEngine.js';
import { createOreRefineryScreen }      from './game/OreRefinery.js';
import { createStatusScreen }           from './game/status.js';
import { createReactorCoreScreen }      from './game/ReactorCore.js';
import { createMiningShaftScreen }      from './game/MiningShaft.js';
import { createWaterTreatmentScreen }   from './game/WaterTreatment.js';
import { createSmartStorageUnitScreen } from './game/SmartStorageUnit.js';
import { createWorkshopScreen }         from './game/Workshop.js';
import { createSecurityScreen }         from './game/Security.js';
import { createSettingsScreen }         from './game/settings.js';

export function createGameScreen(manager, USERNAME_KEY) {
    let navManager;

    const NAV_ICONS = {
        status:           `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="1" width="6" height="6" rx="0.5"/><rect x="9" y="1" width="6" height="6" rx="0.5"/><rect x="1" y="9" width="6" height="6" rx="0.5"/><rect x="9" y="9" width="6" height="6" rx="0.5"/></svg>`,
        reactorcore:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="6" stroke-dasharray="3 2"/><line x1="8" y1="1" x2="8" y2="3.5"/><line x1="8" y1="12.5" x2="8" y2="15"/><line x1="1" y1="8" x2="3.5" y2="8"/><line x1="12.5" y1="8" x2="15" y2="8"/></svg>`,
        miningshaft:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2" y1="14" x2="14" y2="2"/><line x1="2" y1="14" x2="5" y2="11"/><rect x="1" y="12" width="4" height="3" rx="0.5"/><line x1="10" y1="6" x2="14" y2="2"/><line x1="9" y1="4" x2="13" y2="8"/></svg>`,
        orerefinery:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="7" width="8" height="8" rx="0.5"/><path d="M6 7V5h4v2"/><path d="M7 4V2h2v2"/><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/></svg>`,
        watertreatment:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1 C8 1 3 7 3 10 a5 5 0 0 0 10 0 C13 7 8 1 8 1z"/><line x1="5.5" y1="11" x2="7" y2="9.5"/></svg>`,
        smartstorageunit: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="2" width="14" height="4" rx="0.5"/><rect x="1" y="8" width="14" height="4" rx="0.5"/><circle cx="12.5" cy="4" r="0.8" fill="currentColor" stroke="none"/><circle cx="12.5" cy="10" r="0.8" fill="currentColor" stroke="none"/></svg>`,
        workshop:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14 L9 7 C8.5 5.5 9 3 11 2 C12 1.5 13.5 2 13.5 2 L11.5 4 L12 5 L13 5.5 L15 3.5 C15 3.5 15.5 5 15 6 C14 8 11.5 8.5 10 8 L3 15 Z"/></svg>`,
        security:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1 L14 4 V8 C14 12 11 14.5 8 15.5 C5 14.5 2 12 2 8 V4 Z"/><line x1="5.5" y1="8" x2="10.5" y2="8"/><line x1="8" y1="5.5" x2="8" y2="10.5"/></svg>`,
        settings:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.6 2.6l1.1 1.1M12.3 12.3l1.1 1.1M2.6 13.4l1.1-1.1M12.3 3.7l1.1-1.1"/><circle cx="8" cy="8" r="4.5"/></svg>`,
    };

    // Nav icon state indicators
    const NAV_SCREENS = [
        { key: 'status',           label: 'STATUS'   },
        { key: 'reactorcore',      label: 'REACTOR'  },
        { key: 'miningshaft',      label: 'MINING'   },
        { key: 'orerefinery',      label: 'REFINERY' },
        { key: 'watertreatment',   label: 'WATER'    },
        { key: 'smartstorageunit', label: 'SSM'      },
        { key: 'workshop',         label: 'WORKSHOP' },
        { key: 'security',         label: 'SECURITY' },
        { key: 'settings',         label: 'SETTINGS' },
    ];

    function getNavBadge(key) {
        switch(key) {
            case 'reactorcore':
                if (!GameState.reactor.online) return { dot: 'nav-dot-offline', pulse: true };
                if (GameState.reactor.temperature >= 1000) return { dot: 'nav-dot-crit', pulse: true };
                if (GameState.reactor.temperature >= 700)  return { dot: 'nav-dot-warn', pulse: false };
                if (GameState.reactor.wear >= 70)          return { dot: 'nav-dot-warn', pulse: false };
                return null;
            case 'watertreatment':
                if (!GameState.water.pumpOnline) return { dot: 'nav-dot-offline', pulse: true };
                if (GameState.water.wear >= 70)  return { dot: 'nav-dot-warn', pulse: false };
                return null;
            case 'miningshaft':
                if (!GameState.mining.online) return { dot: 'nav-dot-offline', pulse: true };
                if (GameState.mining.rawOres >= GameState.mining.storageMax * 0.9) return { dot: 'nav-dot-warn', pulse: false };
                if (GameState.mining.wear >= 70) return { dot: 'nav-dot-warn', pulse: false };
                return null;
            case 'orerefinery':
                if (!GameState.refinery.online) return { dot: 'nav-dot-offline', pulse: true };
                if (GameState.refinery.refinedOres >= GameState.refinery.storageMax * 0.9) return { dot: 'nav-dot-warn', pulse: false };
                return null;
            case 'security':
                const n = GameState.security.threats.length;
                const p = GameState.security.perimeter.alerts.filter(a => !a.resolved).length;
                if (n > 0)  return { dot: 'nav-dot-crit', pulse: true, count: n };
                if (p > 0)  return { dot: 'nav-dot-warn', pulse: true };
                return null;
            case 'smartstorageunit':
                if (GameState.mining.rawOres >= GameState.mining.storageMax) return { dot: 'nav-dot-crit', pulse: false };
                return null;
            default: return null;
        }
    }

    function updateNavBadges() {
        NAV_SCREENS.forEach(({ key }) => {
            const el = document.getElementById(`nav-badge-${key}`);
            if (!el) return;
            const badge = getNavBadge(key);
            if (badge) {
                el.className = `nav-badge ${badge.dot} ${badge.pulse ? 'nav-badge-pulse' : ''}`;
                el.style.display = 'block';
                el.textContent = badge.count || '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function buildNavHTML() {
        return NAV_SCREENS.map(({ key, label }) => `
            <li style="position:relative;">
                <a href="#" data-screen="${key}" style="display:flex;align-items:center;gap:5px;">
                  <span style="width:13px;height:13px;flex-shrink:0;opacity:0.75;display:inline-flex;align-items:center;">${NAV_ICONS[key]||''}</span><span class="nav-label">${label}</span></a>
                <span class="nav-badge" id="nav-badge-${key}" style="display:none;"></span>
            </li>`).join('');
    }

    // Event log state
    let logMinimized = false;
    let logUnreadType = null; // null | 'warn' | 'crit'

    // Event log renderer
    function renderEventLog() {
        const el = document.getElementById('hud-log');
        if (!el) return;
        const logs = GameState.eventLog.slice(0, 12);
        el.innerHTML = logs.map(l => {
            const col = { crit: '#ff2222', warn: '#ff8800', ok: '#14fdce', info: '#5ecba8' }[l.type] || '#5ecba8';
            return `<div class="log-line" style="color:${col};"><span class="log-ts">${l.ts}</span>${l.msg}</div>`;
        }).join('');
    }

    function updateUnreadDot(type) {
        const dot = document.getElementById('log-unread');
        if (!dot) return;
        // Escalate: crit > warn, never downgrade
        if (type === 'crit' || (type === 'warn' && logUnreadType !== 'crit')) {
            logUnreadType = type;
        } else if (!logUnreadType) {
            logUnreadType = type;
        }
        dot.className = `log-unread-dot visible${logUnreadType === 'crit' ? ' dot-crit' : ''}`;
    }

    function clearUnreadDot() {
        logUnreadType = null;
        const dot = document.getElementById('log-unread');
        if (dot) dot.className = 'log-unread-dot';
    }

    function setupLogToggle() {
        const toggle = document.getElementById('log-toggle');
        const wrap   = document.getElementById('hud-log-wrap');
        if (!toggle || !wrap) return;
        toggle.addEventListener('click', () => {
            logMinimized = !logMinimized;
            wrap.classList.toggle('log-minimized', logMinimized);
            // Clear unread when opening
            if (!logMinimized) clearUnreadDot();
        });
    }

    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output">
                    <nav class="nav-bar">
                        <ul class="nav-list">${buildNavHTML()}</ul>
                    </nav>

                    <div class="hud-bar">
                        <div class="hud-item">TREASURY<span id="hud-cash">${GameState.formatCash(GameState.cash)}</span></div>
                        <div class="hud-item">POWER<span id="hud-power">${(GameState.reactor.powerGW * GameState.reactor.efficiency).toFixed(2)} GW</span></div>
                        <div class="hud-item">
                            TEMP
                            <span id="hud-temp" class="hud-temp-val">${GameState.reactor.temperature}°C</span><span class="hud-temp-bar-wrap"><span id="hud-temp-bar" class="hud-temp-bar"></span></span>
                        </div>
                        <div class="hud-item" id="hud-sec">SEC<span>NOMINAL</span></div>
                        <div class="hud-item hud-osc"><canvas id="hud-oscilloscope"></canvas></div>
                    </div>

                    <div id="game-content" class="game-container"></div>

                    <div class="event-log-bar" id="hud-log-wrap">
                        <div class="log-header" id="log-toggle">
                            <span class="log-unread-dot" id="log-unread"></span>
                            <span class="log-header-label">// EVENT LOG</span>
                            <span class="log-toggle-arrow">▲</span>
                        </div>
                        <div class="log-body">
                            <div id="hud-log" class="log-lines"></div>
                        </div>
                    </div>

                </div>`;

            if (manager.audio.sounds.bg.paused) {
                manager.audio.setVolume('bg', 0.1);
                manager.audio.play('bg');
                manager.audio.loop('bg', true);
            }

            const screens = {
                status:           createStatusScreen(),
                reactorcore:      createReactorCoreScreen(),
                miningshaft:      createMiningShaftScreen(),
                orerefinery:      createOreRefineryScreen(),
                watertreatment:   createWaterTreatmentScreen(),
                smartstorageunit: createSmartStorageUnitScreen(),
                workshop:         createWorkshopScreen(),
                security:         createSecurityScreen(),
                settings:         createSettingsScreen(USERNAME_KEY, manager.audio)
            };

            const contentContainer = document.getElementById('game-content');
            navManager = new GameNavManager(contentContainer, screens, 'status');

            document.querySelectorAll('.nav-list a').forEach(link => {
                link.addEventListener('click', e => { e.preventDefault(); navManager.navigateTo(link.dataset.screen); });
            });

            // HUD tick updates
            GameState.on('tick', () => {
                // Cash
                const hc = document.getElementById('hud-cash');
                if (hc) hc.textContent = GameState.formatCash(GameState.cash);

                // Power
                const hp = document.getElementById('hud-power');
                if (hp) hp.textContent = `${(GameState.reactor.powerGW * GameState.reactor.efficiency).toFixed(2)} GW`;

                // Temp — colour gradient + mini bar
                const temp = GameState.reactor.temperature;
                const ht = document.getElementById('hud-temp');
                const hb = document.getElementById('hud-temp-bar');
                if (ht) {
                    ht.textContent = `${temp}°C`;
                    ht.style.color = temp >= 1500 ? '#ff2222'
                                   : temp >= 1000 ? '#ff6600'
                                   : temp >= 700  ? '#ff8800'
                                   : temp >= 500  ? '#ffcc00'
                                   : '#14fdce';
                }
                if (hb) {
                    const pct = Math.min(100, (temp / 1800) * 100);
                    hb.style.width = `${pct}%`;
                    hb.style.background = temp >= 1500 ? '#ff2222'
                                        : temp >= 1000 ? '#ff6600'
                                        : temp >= 700  ? '#ff8800'
                                        : temp >= 500  ? '#ffcc00'
                                        : '#14fdce';
                }

                // Security HUD
                const hs = document.getElementById('hud-sec');
                if (hs) {
                    const n = GameState.security.threats.length;
                    const p = GameState.security.perimeter.alerts.filter(a => !a.resolved).length;
                    if (n > 0) {
                        hs.innerHTML = `SEC<span style="color:#ff2222;animation:hudSecPulse 0.6s infinite alternate;">${n} THREAT${n>1?'S':''}</span>`;
                    } else if (p > 0) {
                        hs.innerHTML = `SEC<span style="color:#ff8800;">MOTION ×${p}</span>`;
                    } else {
                        hs.innerHTML = `SEC<span style="color:#14fdce;">NOMINAL</span>`;
                    }
                }

                // Nav badges
                updateNavBadges();
            });

            // Log updates — show unread dot when minimized
            GameState.on('log', (entry) => {
                renderEventLog();
                if (logMinimized && entry && (entry.type === 'crit' || entry.type === 'warn' || entry.type === 'ok')) {
                    updateUnreadDot(entry.type);
                }
            });

            setupLogToggle();

            // Alerts
            GameState.on('cascade', () => { notifyAlert('REACTOR OFFLINE — CASCADE SHUTDOWN — RESTART SYSTEMS MANUALLY'); SE.threat(); });
            GameState.on('perimeterAlert', a => { notifyAlert(`MOTION DETECTED — SECTOR ${a.zone}`); });

            renderEventLog();
            loadGame(GameState);
            startGameLoop();
            enableNotifications();
            mountOscilloscope('hud-oscilloscope');

            // Power button mute/unmute
            const gameEl = document.querySelector('.game');
            if (gameEl) {
                gameEl.addEventListener('vault84:mute',   () => { manager.audio.setVolume('bg', 0); });
                gameEl.addEventListener('vault84:unmute', () => {
                    manager.audio.setVolume('bg', 0.1);
                    if (manager.audio.sounds.bg.paused) { manager.audio.play('bg'); manager.audio.loop('bg', true); }
                });
            }
        },

        onExit() { stopGameLoop(); }
    };
}
