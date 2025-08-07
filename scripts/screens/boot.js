// Import da função sleep da utils, dá jeito para as animações
import { sleep } from '../core/utils.js';
// Função que cria o Boot-up
// Parecida à função do original "game.js", só que passada para "módulo" 
export function createBootScreen(manager) {
    return {
        async render(username) {
            // O HTML do boot-up screen
            manager.root.innerHTML = `
                <div class="piece output" style="width: 100%; text-align: left;">
                    <div id="boot-log"></div>
                    <div id="dev-menu" style="position: absolute; bottom: 1rem; right: 1rem; border: 1px solid #14fdce; padding: 5px; opacity: 0.4;">
                        <a href="#" id="skip-loader" class="terminal-link" style="border: none; font-size: 16px;">[Dev: Skip Loader]</a>
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
                    manager.navigateTo('auth');
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
                    manager.navigateTo('auth');
                }
            }
        },
        
        onExit() {
            manager.audio.stop('boot');
        }
    };
}