function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Brain principal que vai ouvir quando o DOM der load
document.addEventListener('DOMContentLoaded', () => {
    const crt = document.querySelector('.game');
    const USERNAME_KEY = 'vault84_user';
    const bootSound = new Audio('assets/audio/boot.mp3');
    const loginSound = new Audio('assets/audio/welcome.mp3');
    const clickSound = new Audio('assets/audio/click.mp3');
    const bg = new Audio('assets/audio/background.mp3');
    var checkUsername;

    // Função para gerar glitch em texto
    function glitchText(text, glitchChance = 0.05) {
        const chars = "!@#$%^&*()_+[]{}<>?/|\\";
        return text.split('').map(c =>
            Math.random() < glitchChance ? chars[Math.floor(Math.random() * chars.length)] : c
        ).join('');
    }

    function renderStartScreen(username) {
        crt.innerHTML = `
            <div class="piece output items-center justify-center">
                <h1>VAULT 84</h1>
                <a id="start_game" href="#">[ START ]</a>
                <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
            </div>
        `;
        document.getElementById('start_game').addEventListener('click', (e) => {
            e.preventDefault();
            renderBootSequence(username);
        })
    }

    async function renderBootSequence(username) {
        crt.innerHTML = `
            <div class="piece output" style="width: 100%; text-align: left;">
                <div id="boot-log"></div>

                 <!-- Skip loader - TIRAR DEPOIS -->
                 <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                    <a href="#" id="skip-loader" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Skip Loader]</a>
                </div>

            </div>
        `;
        const bootLog = document.getElementById('boot-log');
        const skipBtn = document.getElementById('skip-loader');

        let skipRequested = false;

        skipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            skipRequested = true;
            bootSound.pause();
            bootSound.currentTime = 0;
            clickSound.pause();
            loginSound.pause();
            bg.pause();

            if (username) {
                renderWelcomeScreen(username);
            } else {
                renderUsernameInput();
            }
        });

        bootSound.volume = 0.25;
        bootSound.play();

        const bootLines = [
            'VOLTECH SYSTEMS(TM) BIOS v2.17',
            'Initializing VT-DOS...',
            'Memory Check: 640K... OK',
            'Searching for bootable media...',
            'Booting from C:/ drive...',
            'Loading kernel modules...',
            '[OK] IO_SUBSYSTEM',
            '[OK] MEM_MANAGER_V2',
            '[OK] RSRC_ALLOCATOR',
            'Mounting file systems...',
            '[OK] /dev/vda1 mounted on /',
            'Starting services...',
            '[OK] CRON_DAEMON',
            '[OK] TERMINAL_RENDERER',
            '[WARN] Network interface eth0 not found.',
            'Starting UI...',
            'Welcome to VaultOS.',
            'Terminal ready.',
        ];

        let timeLines = 250;
        for (const line of bootLines) {
            if (skipRequested) break;

            if (line.startsWith('Memory Check')) {
                const p = document.createElement('p');
                p.style.margin = '0';
                p.textContent = '> Memory Check: ';
                bootLog.appendChild(p);
                crt.scrollTop = crt.scrollHeight;

                clickSound.volume = 0.07;

                for (let i = 1; i <= 640; i += 10) {
                    if (skipRequested) break;
                    p.textContent = `> Memory Check: ${i}K`;
                    clickSound.play();
                    await sleep(15);
                }
                if (!skipRequested) {
                    p.textContent = `> Memory Check: 640K... OK`;
                    await sleep(400);
                }
                if (skipRequested) break;
                continue;
            }

            const p = document.createElement('p');
            p.style.margin = '0';
            p.textContent = `> ${line}`;
            bootLog.appendChild(p);

            crt.scrollTop = crt.scrollHeight;
            clickSound.volume = 0.07;
            clickSound.play();

            await sleep(timeLines);
            timeLines += 50;
        }
        if (!skipRequested) {
            await sleep(1500);
            if (username) {
                renderWelcomeScreen(username);
            } else {
                renderUsernameInput();
            }
        }
    }

    function renderUsernameInput() {
        checkUsername = 1;
        bg.volume = 0.1;
        bg.play();
        bg.loop = true;
        crt.innerHTML = `
            <div class="piece output items-center justify-center">
                <h1>AUTHENTICATION</h1>
                <p>Please register your terminal designation.</p>
                <input type="text" id="username-input" class="terminal-input" maxlength="20" autofocus>
                <a href="#" id="continue-btn" class="terminal-link">[ CONTINUE ]</a>
                <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
            </div>
        `;
        const continueBtn = document.getElementById('continue-btn');
        const usernameInput = document.getElementById('username-input');

        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim();
            if (username) {
                localStorage.setItem(USERNAME_KEY, username);
                renderWelcomeScreen(username);
            } else {
                usernameInput.placeholder = "DESIGNATION REQUIRED";
            }
        });

        // ENTER também continua
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                continueBtn.click();
            }
        });
    }

    async function renderWelcomeScreen(username) {
        loginSound.volume = 0.1;
        loginSound.play();

        crt.innerHTML = `
        <div class="piece output items-center justify-center">
            <img src="assets/img/logo_voltec2.png" id="vaultLogo" alt="VOLTEC logo" class="logo" style="opacity: 0; transition: opacity 2s ease;">
            <div id="loadingText" style="font-family: monospace; color: #14fdce; margin-top: 10px;"></div>
            <p id="copyright" class="mt-5">© 1977 VOLTECH SYSTEMS</p>

             <!-- Skip loader - TIRAR DEPOIS -->
             <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                <a href="#" id="skip-loader" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Skip Loader]</a>
            </div>

        </div>
    `;

        // FADE IN do logotipo
        const logo = document.getElementById('vaultLogo');
        setTimeout(() => {
            logo.style.opacity = 1;
        }, 250);

        const skipBtn = document.getElementById('skip-loader');
        let skipRequested = false;

        skipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            skipRequested = true;
            loginSound.pause();
            bg.pause();
            renderGameUI(username);
        });

        // Loader estilo [▓▓▒▒▒] animado
        const loaderFrames = ['▒▒▒▒▒', '▓▒▒▒▒', '▓▓▒▒▒', '▓▓▓▒▒', '▓▓▓▓▒', '▓▓▓▓▓'];
        let frameIndex = 0;
        const loadingText = document.getElementById('loadingText');

        const loadingInterval = setInterval(() => {
            if (skipRequested) return;
            loadingText.textContent = loaderFrames[frameIndex % loaderFrames.length];
            frameIndex++;
        }, 200);

        // Glitch progressivo da esquerda p/ direita
        const copyright = document.getElementById('copyright');
        const originalText = copyright.textContent.split('');
        let stableIndex = 0; // cursor de estabilização

        const totalTime = 10000; // duração do loader
        const stepTime = totalTime / originalText.length; // tempo por letra

        const glitchInterval = setInterval(() => {
            if (skipRequested) return; // para glitch se skip
            // constrói o texto: parte estabilizada + parte glitchada
            const stablePart = originalText.slice(0, stableIndex).join('');
            const glitchPart = originalText
                .slice(stableIndex)
                .map(c => (Math.random() < 0.25 ? randomChar() : c))
                .join('');

            copyright.textContent = stablePart + glitchPart;
        }, 120);

        // avança o cursor de estabilização progressivamente
        const stabilizeInterval = setInterval(() => {
            if (skipRequested) return; // para se skip
            stableIndex++;
            if (stableIndex > originalText.length) {
                clearInterval(stabilizeInterval);
            }
        }, stepTime);

        // Espera o loader acabar, mas também escuta o skip
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
            // garante texto final correto
            copyright.textContent = originalText.join('');
            renderGameUI(username);
        }
    }

    function randomChar() {
        const chars = "!@#$%^&*()_+[]{}<>?/|\\";
        return chars[Math.floor(Math.random() * chars.length)];
    }

    async function renderGameUI(username) {
        if (checkUsername === 1) {
            await sleep(100);
        }
        else {
            bg.volume = 0.1;
            bg.play();
            bg.loop = true;
        }
        crt.innerHTML = `
    <div class="piece output">
        <h1>Welcome, Overseer ${username}</h1>
        
        <div id="game-stats">
            <p>Caps: <span id="caps-count">0</span>$</p>
        </div>

        <!-- Developer Menu - TIRAR DEPOIS -->
        <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
            <a href="#" id="dev-clear-user" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Clear Overseer]</a>
        </div>

        <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
    </div>
    `;

        let caps = 0;
        const capsElement = document.getElementById('caps-count');

        // Incrementa caps 1 por segundo
        const intervalId = setInterval(() => {
            caps++;
            capsElement.textContent = caps;
        }, 1000);

        document.getElementById('dev-clear-user').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Dev Menu: Clearing stored user data.");
            localStorage.removeItem(USERNAME_KEY);
            clearInterval(intervalId); // Para o contador
            location.reload();
        });
    }


    function init() {
        const savedUsername = localStorage.getItem(USERNAME_KEY);
        renderStartScreen(savedUsername);
    }

    init();
});
