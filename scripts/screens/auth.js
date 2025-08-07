// Função que cria o ecrã Authentication
// Parecida à função do original "game.js", só que passada para "módulo" 
export function createAuthScreen(manager, USERNAME_KEY) {

    // Pré-carrega os sons de keypress
    const keypressSounds = Array.from({ length: 7 }, (_, i) => {
        const audio = new Audio(`assets/audio/keypress${i + 1}.mp3`);
        audio.volume = 0.3;
        return audio;
    });

    // Função para som aleatório para teclas normais
    function playRandomKeypressSound() {
        const index = Math.floor(Math.random() * keypressSounds.length);
        const sound = keypressSounds[index].cloneNode(); // Permite toques simultâneos
        sound.play();
    }

    // Função para tocar som fixo (índice base 0 → keypress1 = 0, keypress2 = 1, etc.)
    function playFixedKeypressSound(index) {
        const sound = keypressSounds[index].cloneNode();
        sound.play();
    }

    return {
        async render() {
            manager.root.innerHTML = `
                <div class="piece output items-center justify-center">
                    <h1>AUTHENTICATION</h1>
                    <p>Please register your terminal designation.</p>
                    <input type="text" id="username-input" class="terminal-input" maxlength="20" autofocus>
                    <a href="#" id="continue-btn" class="terminal-link">[ CONTINUE ]</a>
                    <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
                </div>
            `;

            manager.audio.setVolume('bg', 0.1);
            manager.audio.play('bg');
            manager.audio.loop('bg', true);

            const continueBtn = document.getElementById('continue-btn');
            const usernameInput = document.getElementById('username-input');

            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const username = usernameInput.value.trim();
                if (username) {
                    localStorage.setItem(USERNAME_KEY, username);
                    manager.navigateTo('welcome', username);
                } else {
                    usernameInput.placeholder = "DESIGNATION REQUIRED";
                }
            });

            usernameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    continueBtn.click();
                    return;
                }

                // Backspace → sempre keypress1.mp3
                if (e.key === 'Backspace') {
                    playFixedKeypressSound(0); // index 0 = keypress1
                    return;
                }

                // Space → sempre keypress2.mp3
                if (e.key === ' ') {
                    playFixedKeypressSound(1); // index 1 = keypress2
                    return;
                }

                // Qualquer outra tecla visível → som aleatório
                const isPrintable = e.key.length === 1;
                if (isPrintable) {
                    playRandomKeypressSound();
                }
            });
        },
        
        onExit() {
            // Música de fundo continua nas outras telas
        }
    };
}
