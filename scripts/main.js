import { SE } from './core/SoundEngine.js';
import { pauseGameLoop, resumeGameLoop, isGamePaused, loadGame } from './core/GameLoop.js';
import { GameState } from './core/GameState.js';
import { deleteSave, hasSave, isSaveOutdated } from './core/SaveSystem.js';
import { t, getLang, setLang } from './core/i18n.js';
import { AudioManager } from './core/audioManager.js';
import { ScreenManager } from './core/screenManager.js';
import { createStartScreen } from './screens/start.js';
import { createBootScreen } from './screens/boot.js';
import { createLoreScreen }       from './screens/lore.js';
import { createDifficultyScreen } from './screens/difficulty.js';
import { createAuthScreen } from './screens/auth.js';
import { createWelcomeScreen } from './screens/welcome.js';
import { createGameScreen } from './screens/game.js';
import { createDeprecatedScreen } from './screens/deprecated.js';

window.t       = t;
window.getLang = getLang;
window._setLang = setLang;
window._SE = SE;
window._pauseGame    = pauseGameLoop;
window._resumeGame   = resumeGameLoop;
window._isGamePaused = isGamePaused;
window._GameState    = GameState;
window._deleteSave   = deleteSave;
window._hasSave      = hasSave;
window._loadSave     = () => loadGame(GameState);

document.addEventListener('click', function(e) {
    const el = e.target.closest('button, a, .btn, .dial, .nav-list li');
    if (el) SE.click(Math.floor(Math.random() * 4));
}, true);

document.addEventListener('DOMContentLoaded', () => {
    const USERNAME_KEY = 'vault84_user';
    const crt = document.querySelector('.game');
    const audioManager = new AudioManager();
    const screenManager = new ScreenManager(crt, audioManager);
    window._screenManager = screenManager;

    screenManager.registerScreen('start',      createStartScreen(screenManager));
    screenManager.registerScreen('boot',       createBootScreen(screenManager));
    screenManager.registerScreen('lore',       createLoreScreen(screenManager));
    screenManager.registerScreen('difficulty', createDifficultyScreen(screenManager, USERNAME_KEY));
    screenManager.registerScreen('auth',       createAuthScreen(screenManager, USERNAME_KEY));
    screenManager.registerScreen('welcome',    createWelcomeScreen(screenManager));
    screenManager.registerScreen('game',       createGameScreen(screenManager, USERNAME_KEY));
    screenManager.registerScreen('deprecated', createDeprecatedScreen(screenManager));

    window._getCurrentScreen = () => screenManager.currentScreenName || null;

    // Restore difficulty if returning player
    const savedDiff = localStorage.getItem('vault84_difficulty');
    if (savedDiff) {
        GameState.difficulty = savedDiff;
        const mods = {
            EASY:      { threatInterval: 180, wearMult: 0.5,  priceMult: 1.2  },
            STANDARD:  { threatInterval: 120, wearMult: 1.0,  priceMult: 1.0  },
            HARD:      { threatInterval: 75,  wearMult: 1.6,  priceMult: 0.85 },
            NIGHTMARE: { threatInterval: 45,  wearMult: 2.5,  priceMult: 0.7  },
        }[savedDiff];
        if (mods) {
            GameState.security.threatInterval = mods.threatInterval;
            GameState._diffWearMult = mods.wearMult;
        }
    }

    let savedUsername = null;
    let outdated = false;
    try { savedUsername = localStorage.getItem(USERNAME_KEY); } catch(_) {}
    try { outdated = isSaveOutdated(); } catch(_) {}

    if (outdated) {
        screenManager.navigateTo('deprecated');
    } else {
        screenManager.navigateTo('start', savedUsername);
    }
});