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

    function renderStartScreen(username){
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
            </div>
        `;
        const bootLog = document.getElementById('boot-log');
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
            if (line.startsWith('Memory Check')) {
                const p = document.createElement('p');
                p.style.margin = '0';
                p.textContent = '> Memory Check: ';
                bootLog.appendChild(p);
                crt.scrollTop = crt.scrollHeight;

                clickSound.volume = 0.07;

                for (let i = 1; i <= 640; i += 10) {
                    p.textContent = `> Memory Check: ${i}K`;
                    clickSound.play();
                    await sleep(15);
                }
                p.textContent = `> Memory Check: 640K... OK`;
                await sleep(400);
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
        await sleep(1500);
        if(username) {
            renderWelcomeScreen(username);
        } else{
            renderUsernameInput();
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
    }

    async function renderWelcomeScreen(username){
        loginSound.volume = 0.1;
        loginSound.play();
        crt.innerHTML = `
            <div class="piece output items-center justify-center">
                <img src="assets/img/glow.png" alt="VOLTEC logo" class="logo"></img>
            </div>
        `;
        await sleep(10000);
        renderGameUI(username);
    }

    async function renderGameUI(username) {
        if(checkUsername === 1){
            await sleep(100);
        }
        else{
            bg.volume = 0.1;
            bg.play();
            bg.loop = true;
        }
        crt.innerHTML = `
        <div class="piece output">
            <h1>Welcome, Overseer ${username}</h1>
            <p>Resource management systems online.</p>
            
            <div id="game-stats">
                <p>Caps: 0</p>
            </div>

            <!-- Developer Menu - TIRAR DEPOIS -->
            <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                <a href="#" id="dev-clear-user" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Clear Overseer]</a>
            </div>

            <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
        </div>
        `;
        
        document.getElementById('dev-clear-user').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Dev Menu: Clearing stored user data.");
            localStorage.removeItem(USERNAME_KEY);
            location.reload();
        });
    }

    function init() {
        const savedUsername = localStorage.getItem(USERNAME_KEY);
        renderStartScreen(savedUsername);
    }

    init();
});
