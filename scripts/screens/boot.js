// Import da função sleep da utils, dá jeito para as animações
import { sleep } from '../core/utils.js';

// ── Easter egg: boot interrupted crash screen ─────────────────
async function renderBootCorrupted(root, audio) {
    const lines = [
        { t: 0,    txt: 'VOLTECH SYSTEMS(TM) BIOS v2.17',            col: '#5ecba8' },
        { t: 300,  txt: 'Resuming boot sequence...',                  col: '#5ecba8' },
        { t: 700,  txt: '> Checking bootloader integrity...',         col: '#5ecba8' },
        { t: 1200, txt: '> [ERR 0x0041] BOOTLOADER SECTOR CORRUPT',   col: '#ff2222' },
        { t: 1600, txt: '> Primary boot record: DAMAGED',             col: '#ff2222' },
        { t: 2000, txt: '> Attempting secondary loader... FAILED',    col: '#ff8800' },
        { t: 2500, txt: '> MEM PARITY ERROR AT 0x0000:0x04A2',        col: '#ff8800' },
        { t: 2900, txt: '> STACK TRACE:',                             col: '#ff8800' },
        { t: 3100, txt: '    #0  BIOS_STAGE2 + 0x00f4',              col: '#ff8800' },
        { t: 3200, txt: '    #1  KERN_INIT   + 0x0017',              col: '#ff8800' },
        { t: 3300, txt: '    #2  <CORRUPTED>',                        col: '#ff2222' },
        { t: 3800, txt: '> !! FATAL: BOOT SEQUENCE INTERRUPTED BY POWER LOSS', col: '#ff2222' },
        { t: 4400, txt: '> System halted to prevent data loss.',      col: '#ff8800' },
        { t: 5000, txt: '> Run full hardware diagnostic before restart.', col: '#5ecba8' },
    ];

    root.innerHTML = `
        <div class="piece output" style="padding:2.5rem;text-align:left;overflow-y:auto;">
            <div id="crash-log" style="line-height:1.7;font-size:0.95rem;letter-spacing:0.5px;font-family:'VT323',monospace;"></div>
            <div id="crash-actions" style="margin-top:2rem;display:none;">
                <div style="border:1px solid #ff2222;padding:1rem 1.2rem;max-width:400px;background:rgba(255,34,34,0.04);">
                    <div style="color:#ff2222;font-size:0.75rem;letter-spacing:2px;margin-bottom:0.8rem;">!! SYSTEM HALTED</div>
                    <div style="color:#5ecba8;font-size:0.85rem;margin-bottom:1.2rem;line-height:1.6;">
                        Boot loader failed due to power interruption.<br>
                        Hardware integrity check required.<br>
                        Press COLD BOOT to reinitialize all systems.
                    </div>
                    <button id="crash-reboot" style="
                        font-family:'VT323',monospace;
                        font-size:1.1rem;
                        letter-spacing:3px;
                        padding:0.6rem 1.4rem;
                        background:transparent;
                        border:1px solid #ff2222;
                        color:#ff2222;
                        cursor:pointer;
                        width:100%;
                        transition:background 0.15s,color 0.15s;
                    ">[ COLD BOOT ]</button>
                </div>
            </div>
        </div>`;

    const log = document.getElementById('crash-log');
    audio.setVolume('boot', 0.15);
    audio.play('boot');

    for (const { t, txt, col } of lines) {
        await sleep(t === 0 ? 0 : 300);
        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.color = col;
        p.textContent = `> ${txt}`;
        log.appendChild(p);
        root.scrollTop = root.scrollHeight;
        audio.play('click');
    }

    // Blinking cursor stall — feels like it's hanging
    await sleep(600);
    const cursor = document.createElement('span');
    cursor.textContent = '_';
    cursor.style.animation = 'blink 0.5s step-end infinite';
    cursor.style.color = '#ff2222';
    log.appendChild(cursor);
    await sleep(1800);
    cursor.remove();

    // Show the reboot panel
    audio.stop('boot');
    const actions = document.getElementById('crash-actions');
    if (actions) actions.style.display = 'block';

    const btn = document.getElementById('crash-reboot');
    if (btn) {
        btn.addEventListener('mouseenter', () => { btn.style.background='#ff2222'; btn.style.color='#020f07'; });
        btn.addEventListener('mouseleave', () => { btn.style.background='transparent'; btn.style.color='#ff2222'; });
        btn.addEventListener('click', () => {
            sessionStorage.removeItem('vault84_boot_interrupted');
            window.location.reload();
        });
    }
}

export function createBootScreen(manager) {
    return {
        async render(username) {

            // ── Easter egg check ──────────────────────────────
            if (sessionStorage.getItem('vault84_boot_interrupted')) {
                await renderBootCorrupted(manager.root, manager.audio);
                return; // don't proceed to normal boot
            }
            // O HTML do boot-up screen
            manager.root.innerHTML = `
                <div class="piece output" style="padding:2.5rem 2.5rem 2rem 2.5rem;text-align:left;overflow-y:auto;">
                    <div id="boot-log" style="line-height:1.6;font-size:1rem;letter-spacing:0.5px;"></div>
                    <div id="dev-menu" style="position:fixed;bottom:1.5rem;right:1.5rem;opacity:0.25;">
                        <a href="#" id="skip-loader" class="terminal-link" style="border:none;font-size:13px;letter-spacing:1px;">[Skip]</a>
                    </div>
                </div>
            `;

            // Constantes para as classes ".boot-log" e ".skip-loader"
            // E um bool para determinar se um skip foi requested
            const bootLog = document.getElementById('boot-log');
            const skipBtn = document.getElementById('skip-loader');
            let skipRequested = false;

            // Lógica do botão de skip do boot-up screen
            skipBtn.addEventListener('click', (e) => {
                // Necessário para custom navigation neste sentido, sendo uma SPA
                e.preventDefault();
                // Mudamos o skipRequested para verdadeiro
                skipRequested = true;
                // Parar os sons
                manager.audio.stop('boot');
                manager.audio.stop('click');
                
                // Se username existe
                if (username) {
                    // vai para a página Welcome
                    manager.navigateTo('welcome', username);
                } else {
                    // vai para a página Auth
                    manager.navigateTo(localStorage.getItem('vault84_difficulty') ? 'auth' : localStorage.getItem('vault84_lore_seen') ? 'difficulty' : 'lore');
                }
            });

            // Mete um valor determinado para o volume do áudio do boot, e toca esse mesmo áudio
            manager.audio.setVolume('boot', 0.25);
            manager.audio.play('boot');
            manager.audio.setVolume('click', 0.25);
            // bootLines por defeito
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

            // Tempo, em ms, em que cada linha começa a aparecer
            let timeLines = 250;
            for (const line of bootLines) {
                // Se o skip foi pedido, dar break logo
                if (skipRequested) break;

                // Aumenta o valor do Memory Check para ser parecido com PCs antigos
                if (line.startsWith('Memory Check')) {
                    const p = document.createElement('p');
                    p.style.margin = '0';
                    p.textContent = '> Memory Check: ';
                    bootLog.appendChild(p);
                    manager.root.scrollTop = manager.root.scrollHeight;

                    for (let i = 1; i <= 640; i += 10) {
                        if (skipRequested) break;
                        p.textContent = `> Memory Check: ${i}K`;
                        manager.audio.play('click');
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

                
                manager.root.scrollTop = manager.root.scrollHeight;
                manager.audio.play('click');

                await sleep(timeLines);
                timeLines += 50;
            }
            
            if (!skipRequested) {
                await sleep(1500);
                if (username) {
                    manager.navigateTo('welcome', username);
                } else {
                    manager.navigateTo(localStorage.getItem('vault84_difficulty') ? 'auth' : localStorage.getItem('vault84_lore_seen') ? 'difficulty' : 'lore');
                }
            }
        },
        
        onExit() {
            manager.audio.stop('boot');
        }
    };
}