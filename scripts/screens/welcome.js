import { showTutorialIfFirstTime } from '../core/TutorialOverlay.js';
import { randomChar, sleep } from '../core/utils.js';

export function createWelcomeScreen(manager) {
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2.5rem;">
                    <img src="assets/img/logo_voltec2.png" id="vaultLogo" alt="VOLTEC logo"
                         style="display:block!important;width:auto!important;max-width:200px!important;max-height:28vh!important;object-fit:contain;opacity:0;transition:opacity 2s ease;">
                    <p id="loadingText" style="min-height:1.4rem;font-size:1rem;letter-spacing:2px;"></p>
                    <p id="statusLine" style="color:#3d9970;font-size:0.85rem;">[Loading Environment]</p>
                    <p id="copyright" style="color:#3d9970;font-size:0.82rem;letter-spacing:2px;">© 1977 VOLTECH SYSTEMS</p>
                    <div id="dev-menu" style="position:absolute;bottom:1rem;right:1rem;opacity:0.3;">
                        <a href="#" id="skip-loader" class="terminal-link" style="border:none;font-size:14px;">[Dev: Skip Loader]</a>
                    </div>
                </div>
            `;

            manager.audio.setVolume('login', 0.1);
            manager.audio.play('login');

            const logo = document.getElementById('vaultLogo');
            setTimeout(() => { logo.style.opacity = 1; }, 250);

            const skipBtn = document.getElementById('skip-loader');
            let skipRequested = false;
            skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                skipRequested = true;
                manager.navigateTo('game', username);
            });

            const loadingText = document.getElementById('loadingText');
            const statusLine = document.getElementById('statusLine');

            const statusMessages = [
                "Loading Environment",
                "Checking Water Pumps",
                "Stabilizing Reactor Core",
                "Assembling 3D Models",
                "All systems Ready!"
            ];

            async function typeWithDots(message, isLast = false) {
                loadingText.textContent = "";
                statusLine.textContent = "";
                const fullText = isLast ? message : message + "...";
                for (let i = 0; i < fullText.length; i++) {
                    if (skipRequested) return;
                    loadingText.textContent += fullText[i];
                    await sleep(50);
                }
                await sleep(500);
            }

            (async () => {
                for (let i = 0; i < statusMessages.length; i++) {
                    if (skipRequested) break;
                    const isLast = (i === statusMessages.length - 1);
                    await typeWithDots(statusMessages[i], isLast);
                }
            })();

            const copyright = document.getElementById('copyright');
            const originalText = copyright.textContent;
            const originalChars = originalText.split('');
            let stableIndex = 0;
            const totalTime = 10000;
            const stepTime = totalTime / originalChars.length;

            const glitchInterval = setInterval(() => {
                if (skipRequested) return;
                const stablePart = originalChars.slice(0, stableIndex).join('');
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
                    if (skipRequested || elapsed >= max) {
                        clearInterval(glitchInterval);
                        clearInterval(stabilizeInterval);
                        clearInterval(check);
                        resolve();
                    }
                    elapsed += interval;
                }, interval);
            });

            if (!skipRequested) {
                loadingText.textContent = "";
                statusLine.textContent = "";
                copyright.textContent = originalText;
                await showTutorialIfFirstTime(username);
                manager.navigateTo('game', username);
            }
        },

        onExit() {
            manager.audio.stop('login');
        }
    };
}
