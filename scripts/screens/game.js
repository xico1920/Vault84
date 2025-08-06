import { sleep } from '../core/utils.js';

export function createGameScreen(manager, USERNAME_KEY) {
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output">
                    <h1>Welcome, Overseer ${username}</h1>
                    <div id="game-stats">
                        <p>Caps: <span id="caps-count">0</span>$</p>
                    </div>
                    <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                        <a href="#" id="dev-clear-user" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Clear Overseer]</a>
                    </div>
                    <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
                </div>
            `;

            // Start BG music if not already playing
            if (manager.audio.sounds.bg.paused) {
                manager.audio.setVolume('bg', 0.1);
                manager.audio.play('bg');
                manager.audio.loop('bg', true);
            }

            let caps = 0;
            const capsElement = document.getElementById('caps-count');
            const intervalId = setInterval(() => {
                caps++;
                capsElement.textContent = caps;
            }, 1000);

            document.getElementById('dev-clear-user').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(USERNAME_KEY);
                clearInterval(intervalId);
                location.reload();
            });
        },
        
        onExit() {
            // Clean up if needed
        }
    };
}