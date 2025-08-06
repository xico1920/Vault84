// AQUI É QUE ESTÁ AS BATATAS E A CARNE
// Ya, lógica da criação da page do jogo

import { GameNavManager } from '../core/gameNavManager.js';
import { createRoomsScreen } from './game/rooms.js';
import { createStatusScreen } from './game/status.js';
import { createPersonnelScreen } from './game/personnel.js';
import { createResourcesScreen } from './game/resources.js';
import { createSettingsScreen } from './game/settings.js';

export function createGameScreen(manager, USERNAME_KEY) {
    let navManager;
    let capsIntervalId;
    
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output">
                    <nav class="nav-bar mb-10">
                        <ul class="nav-list">
                            <li><a href="#" data-screen="status">STATUS</a></li>
                            <li><a href="#" data-screen="rooms">ROOMS</a></li>
                            <li><a href="#" data-screen="personnel">PERSONNEL</a></li>
                            <li><a href="#" data-screen="resources">RESOURCES</a></li>
                            <li><a href="#" data-screen="settings">SETTINGS</a></li>
                        </ul>
                    </nav>
                    
                    <div id="game-content" class="game-container"></div>
                    
                    <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                        <a href="#" id="dev-clear-user" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Clear Overseer]</a>
                    </div>
                </div>
            `;

            // Começa o background noise, verifica se está a tocar, e se não tiver, toca!
            if (manager.audio.sounds.bg.paused) {
                manager.audio.setVolume('bg', 0.1);
                manager.audio.play('bg');
                manager.audio.loop('bg', true);
            }

            // Caps -- TODO: Ainda não sei como é que haveremos de implementar isto, dentro do contexto
            let caps = 0;
            const capsElement = document.getElementById('caps-count');
            if (capsElement) {
                capsIntervalId = setInterval(() => {
                    caps++;
                    capsElement.textContent = caps;
                }, 1000);
            }

            // Constante com todos as tabs da Navigation Bar. Status, Rooms, etc...
            const screens = {
                status: createStatusScreen(),
                rooms: createRoomsScreen(),
                personnel: createPersonnelScreen(),
                resources: createResourcesScreen(),
                settings: createSettingsScreen(USERNAME_KEY, manager.audio)
            };

            // Inicializa o GameNavManager
            const contentContainer = document.getElementById('game-content');
            navManager = new GameNavManager(contentContainer, screens, 'status');

            // Event listeners para quando um item na navbar é clicado
            document.querySelectorAll('.nav-list a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    navManager.navigateTo(link.dataset.screen);
                });
            });

            // Dev menu -- Obviamente retirar daqui quando for necessário
            // Talvez adicionar isto nas Settings?
            document.getElementById('dev-clear-user').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(USERNAME_KEY);
                if (capsIntervalId) clearInterval(capsIntervalId);
                location.reload();
            });
        },
        
        onExit() {
            if (capsIntervalId) clearInterval(capsIntervalId);
        }
    };
}