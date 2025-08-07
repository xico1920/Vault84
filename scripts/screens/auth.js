// Função que cria o ecrã Authentication
// Parecida à função do original "game.js", só que passada para "módulo" 
export function createAuthScreen(manager, USERNAME_KEY) {

    // Pré-carrega os sons de keypress: keypress1 a keypress7
    const keypressSounds = Array.from({ length: 7 }, (_, i) => {
        const audio = new Audio(`assets/audio/keypress${i + 1}.mp3`);
        audio.volume = 0.3;
        return audio;
    });

    // Guarda o índice do último som aleatório tocado (de keypress3 a keypress7)
    let lastRandomIndex = null;

    // Função para tocar som aleatório entre keypress3.mp3 a keypress7.mp3
    // Nunca toca o mesmo som duas vezes seguidas para parecer mais realista
    function playRandomNormalKeypressSound() {
        let index;
        do {
            index = Math.floor(Math.random() * 5) + 2; // 2 a 6 → keypress3 a keypress7
        } while (index === lastRandomIndex); // Repete até ser diferente do anterior
        lastRandomIndex = index;

        const sound = keypressSounds[index].cloneNode(); // cloneNode permite múltiplas sobreposições
        sound.play();
    }

    // Função para tocar som fixo (útil para Backspace e Espaço)
    // index 0 = keypress1.mp3, index 1 = keypress2.mp3, etc.
    function playFixedKeypressSound(index) {
        const sound = keypressSounds[index].cloneNode();
        sound.play();
    }

    return {
        // Função de renderização do ecrã
        async render() {
            // HTML do ecrã de autenticação
            manager.root.innerHTML = `
                <div class="piece output items-center justify-center">
                    <h1>AUTHENTICATION</h1>
                    <p>Please register your terminal designation.</p>
                    <input type="text" id="username-input" class="terminal-input" maxlength="20" autofocus>
                    <a href="#" id="continue-btn" class="terminal-link">[ CONTINUE ]</a>
                    <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
                </div>
            `;

            // Começa a música de fundo (volume baixo)
            manager.audio.setVolume('bg', 0.1);
            manager.audio.play('bg');
            manager.audio.loop('bg', true);

            const continueBtn = document.getElementById('continue-btn');
            const usernameInput = document.getElementById('username-input');

            // Ao clicar no botão CONTINUE
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const username = usernameInput.value.trim();
                if (username) {
                    // Guarda o nome no localStorage e avança
                    localStorage.setItem(USERNAME_KEY, username);
                    manager.navigateTo('welcome', username);
                } else {
                    // Mostra erro se vazio
                    usernameInput.placeholder = "DESIGNATION REQUIRED";
                }
            });

            // Ao pressionar uma tecla no input
            usernameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    continueBtn.click(); // Simula clique no botão
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

                // Qualquer outra tecla visível (ex: letras, números) → som aleatório entre keypress3-7
                const isPrintable = e.key.length === 1;
                if (isPrintable) {
                    playRandomNormalKeypressSound();
                }
            });
        },

        // Função chamada ao sair do ecrã
        onExit() {
            // Música continua nas outras telas
        }
    };
}
