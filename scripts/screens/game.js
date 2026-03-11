import { GameNavManager } from '../core/gameNavManager.js';
import { SE } from '../core/SoundEngine.js';
import { startGameLoop, stopGameLoop } from '../core/GameLoop.js';
import { GameState } from '../core/GameState.js';
import { createOreRefineryScreen }    from './game/OreRefinery.js';
import { createStatusScreen }         from './game/status.js';
import { createReactorCoreScreen }    from './game/ReactorCore.js';
import { createMiningShaftScreen }    from './game/MiningShaft.js';
import { createWaterTreatmentScreen } from './game/WaterTreatment.js';
import { createSmartStorageUnitScreen } from './game/SmartStorageUnit.js';
import { createWorkshopScreen }       from './game/Workshop.js';
import { createSecurityScreen }       from './game/Security.js';
import { createSettingsScreen }       from './game/settings.js';

export function createGameScreen(manager, USERNAME_KEY) {
    let navManager;

    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output">

                    <nav class="nav-bar">
                        <ul class="nav-list">
                            <li><a href="#" data-screen="status">STATUS</a></li>
                            <li><a href="#" data-screen="reactorcore">REACTOR</a></li>
                            <li><a href="#" data-screen="miningshaft">MINING</a></li>
                            <li><a href="#" data-screen="orerefinery">REFINERY</a></li>
                            <li><a href="#" data-screen="watertreatment">WATER</a></li>
                            <li><a href="#" data-screen="smartstorageunit">SSM</a></li>
                            <li><a href="#" data-screen="workshop">WORKSHOP</a></li>
                            <li><a href="#" data-screen="security">SECURITY</a></li>
                            <li><a href="#" data-screen="settings">SETTINGS</a></li>
                        </ul>
                    </nav>

                    <div class="hud-bar">
                        <div class="hud-item">TREASURY<span id="hud-cash">${GameState.formatCash(GameState.cash)}</span></div>
                        <div class="hud-item">POWER<span id="hud-power">${(GameState.reactor.powerGW * GameState.reactor.efficiency).toFixed(2)} GW</span></div>
                        <div class="hud-item">TEMP<span id="hud-temp">${GameState.reactor.temperature}C</span></div>
                        <div class="hud-item" id="hud-sec">SEC<span>NOMINAL</span></div>
                    </div>

                    <div id="game-content" class="game-container"></div>

                    <div class="alert-banner" id="alert-banner"></div>

                    <div id="dev-menu">
                        <a href="#" id="dev-clear-user" class="terminal-link">[Clear Overseer]</a>
                    </div>
                </div>
            `;

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

            document.getElementById('dev-clear-user').addEventListener('click', e => {
                e.preventDefault(); localStorage.removeItem(USERNAME_KEY); stopGameLoop(); location.reload();
            });

            // HUD updates
            GameState.on('tick', () => {
                const hc = document.getElementById('hud-cash');   if (hc) hc.textContent = GameState.formatCash(GameState.cash);
                const hp = document.getElementById('hud-power');  if (hp) hp.textContent = `${(GameState.reactor.powerGW * GameState.reactor.efficiency).toFixed(2)} GW`;
                const ht = document.getElementById('hud-temp');
                if (ht) { ht.textContent = `${GameState.reactor.temperature}C`; ht.style.color = GameState.reactor.temperature > 1000 ? '#ff2222' : GameState.reactor.temperature > 800 ? '#ff8800' : ''; }
                const hs = document.getElementById('hud-sec');
                if (hs) {
                    const n = GameState.security.threats.length;
                    hs.innerHTML = `SEC<span style="color:${n>0?'#ff2222':''}">${n > 0 ? n + ' THREAT' + (n>1?'S':'') : 'NOMINAL'}</span>`;
                }
            });

            // Alert banner
            const showBanner = msg => {
                const b = document.getElementById('alert-banner');
                if (!b) return;
                b.textContent = `!! ${msg}`;
                b.style.display = 'block';
                clearTimeout(b._t);
                b._t = setTimeout(() => { b.style.display = 'none'; }, 5000);
            };

            GameState.on('alert',  d => { showBanner(d.msg); SE.alert(); });
            GameState.on('threat', t => { showBanner(`${t.type} DETECTED >> ${t.target.toUpperCase()} >> SECURITY`); SE.alert(); });

            startGameLoop();

            // ── Power button mute/unmute via custom events ───────
            const gameEl = document.querySelector('.game');
            if (gameEl) {
                gameEl.addEventListener('vault84:mute', () => {
                    manager.audio.setVolume('bg', 0);
                });
                gameEl.addEventListener('vault84:unmute', () => {
                    manager.audio.setVolume('bg', 0.1);
                    if (manager.audio.sounds.bg.paused) {
                        manager.audio.play('bg');
                        manager.audio.loop('bg', true);
                    }
                });
            }
        },

        onExit() { stopGameLoop(); }
    };
}
