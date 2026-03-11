import { GameNavManager } from '../core/gameNavManager.js';
import { SE } from '../core/SoundEngine.js';
import { startGameLoop, stopGameLoop } from '../core/GameLoop.js';
import { GameState } from '../core/GameState.js';
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
                <a href="#" data-screen="${key}">${label}</a>
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

                    <div class="alert-banner" id="alert-banner"></div>
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
            const showBanner = msg => {
                const b = document.getElementById('alert-banner');
                if (!b) return;
                b.textContent = `!! ${msg}`;
                b.style.display = 'block';
                clearTimeout(b._t);
                b._t = setTimeout(() => { b.style.display = 'none'; }, 5000);
            };
            GameState.on('alert',  d => { showBanner(d.msg); SE.alert(); });
            GameState.on('threat', t => { showBanner(`${t.type} DETECTED >> ${t.target.toUpperCase()} — GO TO SECURITY`); });
            GameState.on('cascade', () => { showBanner('REACTOR OFFLINE — CASCADE SHUTDOWN — RESTART SYSTEMS MANUALLY'); SE.threat(); });
            GameState.on('perimeterAlert', a => { showBanner(`MOTION DETECTED — SECTOR ${a.zone}`); });

            renderEventLog();
            startGameLoop();

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
