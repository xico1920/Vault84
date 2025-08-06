import { sleep } from '../core/utils.js';
import { GameNavManager } from '../core/gameNavManager.js';
import { createStatusScreen } from './game/status.js';

export function createGameScreen(manager, USERNAME_KEY) {
    let navManager;
    let capsIntervalId;
    
    return {
        async render(username) {
            manager.root.innerHTML = `
        <div class="piece output">
            <nav class="nav-bar mb-10">
                <ul class="nav-list">
                    <li><a href="#">STATUS</a></li>
                    <li><a href="#">ROOMS</a></li>
                    <li><a href="#">PERSONNEL</a></li>
                    <li><a href="#">RESOURCES</a></li>
                    <li><a href="#">SETTINGS</a></li>
                    <!-- TODO: Add game stats with bottle cap icon -->
                    <!--<div class="game-stats">
                       <p><img src="../assets/img/bottle-cap-gre.png" alt="caps" width="20" height="20"><span id="caps-count">0</span>$</p>
                    </div>-->
                </ul>
            </nav>
            <!-- Developer Menu - TIRAR DEPOIS -->
            <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                <a href="#" id="dev-clear-user" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Clear Overseer]</a>
            </div>
        </div>
            `;

            // Start BG music if needed
            if (manager.audio.sounds.bg.paused) {
                manager.audio.setVolume('bg', 0.1);
                manager.audio.play('bg');
                manager.audio.loop('bg', true);
            }

            // Caps counter
            let caps = 0;
            const capsElement = document.getElementById('caps-count');
            capsIntervalId = setInterval(() => {
                caps++;
                capsElement.textContent = caps;
            }, 1000);

            // Register game screens
            const screens = {
                status: createStatusScreen()
            };

            // Initialize navigation
            const contentContainer = document.getElementById('game-content');
            navManager = new GameNavManager(contentContainer, screens, 'status');

            // Navigation event listeners
            document.querySelectorAll('.game-nav button').forEach(button => {
                button.addEventListener('click', () => {
                    navManager.navigateTo(button.dataset.screen);
                });
            });

            // Dev menu
            document.getElementById('dev-clear-user').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(USERNAME_KEY);
                clearInterval(capsIntervalId);
                location.reload();
            });
        },
        
        onExit() {
            clearInterval(capsIntervalId);
        }
    };
}