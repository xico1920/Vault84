import { randomChar, sleep } from '../core/utils.js';

export function createWelcomeScreen(manager) {
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output items-center justify-center">
                    <img src="assets/img/logo_voltec2.png" id="vaultLogo" alt="VOLTEC logo" class="logo" style="opacity: 0; transition: opacity 2s ease;">
                    <div id="loadingText" style="font-family: monospace; color: #14fdce; margin-top: 10px;"></div>
                    <p id="copyright" class="mt-5">© 1977 VOLTECH SYSTEMS</p>
                    <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                        <a href="#" id="skip-loader" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Skip Loader]</a>
                    </div>
                </div>
            `;

            manager.audio.setVolume('login', 0.1);
            manager.audio.play('login');

            const logo = document.getElementById('vaultLogo');
            setTimeout(() => {
                logo.style.opacity = 1;
            }, 250);

            const skipBtn = document.getElementById('skip-loader');
            let skipRequested = false;

            skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                skipRequested = true;
                manager.navigateTo('game', username);
            });

            const loaderFrames = ['▒▒▒▒▒', '▓▒▒▒▒', '▓▓▒▒▒', '▓▓▓▒▒', '▓▓▓▓▒', '▓▓▓▓▓'];
            let frameIndex = 0;
            const loadingText = document.getElementById('loadingText');

            const loadingInterval = setInterval(() => {
                if (skipRequested) return;
                loadingText.textContent = loaderFrames[frameIndex % loaderFrames.length];
                frameIndex++;
            }, 200);

            const copyright = document.getElementById('copyright');
            const originalText = copyright.textContent;
            const originalChars = originalText.split('');
            let stableIndex = 0;
            const totalTime = 10000;
            const stepTime = totalTime / originalChars.length;

            const glitchInterval = setInterval(() => {
                if (skipRequested) return;
                const stablePart = originalChars.slice(0, stableIndex).join('');
                // FIXED LINE: Removed extra parentheses around ternary
                const glitchPart = originalChars
                    .slice(stableIndex)
                    .map(c => Math.random() < 0.25 ? randomChar() : c)
                    .join('');
                copyright.textContent = stablePart + glitchPart;
            }, 120);

            const stabilizeInterval = setInterval(() => {
                if (skipRequested) return;
                stableIndex++;
                if (stableIndex > originalChars.length) {
                    clearInterval(stabilizeInterval);
                }
            }, stepTime);

            await new Promise(resolve => {
                let elapsed = 0;
                const interval = 100;
                const max = totalTime;

                const check = setInterval(() => {
                    if (skipRequested) {
                        clearInterval(loadingInterval);
                        clearInterval(glitchInterval);
                        clearInterval(stabilizeInterval);
                        clearInterval(check);
                        resolve();
                    } else if (elapsed >= max) {
                        clearInterval(loadingInterval);
                        clearInterval(glitchInterval);
                        clearInterval(stabilizeInterval);
                        clearInterval(check);
                        resolve();
                    }
                    elapsed += interval;
                }, interval);
            });

            if (!skipRequested) {
                copyright.textContent = originalText;
                manager.navigateTo('game', username);
            }
        },
        
        onExit() {
            manager.audio.stop('login');
        }
    };
}