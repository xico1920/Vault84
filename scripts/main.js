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

    // Inicializa sempre no start screen
    // Há de ser mudado depois para saltar o boot/auth/welcome, dependendo da preferência do user
    const savedUsername = localStorage.getItem(USERNAME_KEY);
    screenManager.navigateTo('start', savedUsername);
});