export function createAuthScreen(manager, USERNAME_KEY) {
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

            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    continueBtn.click();
                }
            });
        },
        
        onExit() {
            // Don't stop BG music - it continues to next screens
        }
    };
}