import { SE } from './core/SoundEngine.js';
import { pauseGameLoop, resumeGameLoop, isGamePaused } from './core/GameLoop.js';

// Expose globally for the CRT controls (non-module script)
window._SE = SE;
window._pauseGame    = pauseGameLoop;
window._resumeGame   = resumeGameLoop;
window._isGamePaused = isGamePaused;
// _getCurrentScreen is set after DOMContentLoaded so screenManager exists

// Global click sound — fires on any button/link click
document.addEventListener('click', function(e) {
    const el = e.target.closest('button, a, .btn, .dial, .nav-list li');
    if (el) SE.click(Math.floor(Math.random() * 4));
}, true);

// Imports, imports, imports!!!
import { AudioManager } from './core/audioManager.js';
import { ScreenManager } from './core/screenManager.js';
import { createStartScreen } from './screens/start.js';
import { createBootScreen } from './screens/boot.js';
import { createAuthScreen } from './screens/auth.js';
import { createWelcomeScreen } from './screens/welcome.js';
import { createGameScreen } from './screens/game.js';

document.addEventListener('DOMContentLoaded', () => {
    // Constantes tipo Username, CRT (que é igual à classe .game)
    // e cria instâncias do AudioManager e do ScreenManager
    const USERNAME_KEY = 'vault84_user';
    const crt = document.querySelector('.game');
    const audioManager = new AudioManager();
    const screenManager = new ScreenManager(crt, audioManager);

    // Os ecrãs todos que passam
    screenManager.registerScreen('start', createStartScreen(screenManager));
    screenManager.registerScreen('boot', createBootScreen(screenManager));
    screenManager.registerScreen('auth', createAuthScreen(screenManager, USERNAME_KEY));
    screenManager.registerScreen('welcome', createWelcomeScreen(screenManager));
    screenManager.registerScreen('game', createGameScreen(screenManager, USERNAME_KEY));

    // Expose screen getter now that screenManager exists
    window._getCurrentScreen = () => screenManager.currentScreenName || null;

    // Inicializa sempre no start screen
    const savedUsername = localStorage.getItem(USERNAME_KEY);
    screenManager.navigateTo('start', savedUsername);
});