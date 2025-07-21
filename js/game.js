// Brain principal que vai ouvir quando o DOM der load
document.addEventListener('DOMContentLoaded', () => {
    // Determinamos a constante "crt" que vai ser igual à classe "game"
    const crt = document.querySelector('.game');
    // Esta constante determina o nome da KEY para o nome do user
    // Por exemplo, se o user for "John", em localStorage ficaria
    // vault84_user: John
    const USERNAME_KEY = 'vault84_user';

    // Funçao que dá render do start screen
    function renderStartScreen(){
        crt.innerHTML = `
            <div class="piece output items-center">
                <h1>VAULT 84</h1>
                <a id="start_game" href="#">[ START ]</a>
                <p class="mt-5">© 1997 VOLTECH SYSTEMS</p>
            </div>
        `;
        // Vai ouvir o botao, caso o botao seja clicado, avança para o ecra de Username Input
        document.getElementById('start_game').addEventListener('click', (e) => {
            e.preventDefault();
            renderUsernameInput();
        })
    }

    // Funçao que dá render do username input screen
    function renderUsernameInput() {
        crt.innerHTML = `
            <div class="piece output items-center">
                <h1>AUTHENTICATION</h1>
                <p>Please register your terminal designation.</p>
                <input type="text" id="username-input" class="terminal-input" maxlength="20" autofocus>
                <a href="#" id="continue-btn" class="terminal-link">[ CONTINUE ]</a>
                <p class="mt-5">© 1997 VOLTECH SYSTEMS</p>
            </div>
        `;
        // Criamos duas constantes, uma para o botao de continuar, e outra para a textbox/input
        const continueBtn = document.getElementById('continue-btn');
        const usernameInput = document.getElementById('username-input');

        // EventListener para o botao de continue
        continueBtn.addEventListener('click', (e) => {
            // Isto cancela o evento se for cancelável, pois estes eventos teem uma default clause
            // Isto é só para good code sake :)
            e.preventDefault();
            // Isto é necessário, pois se nao vinha com a treta toda do objeto HTML
            const username = usernameInput.value.trim();
            // Se o username existir
            if (username) {
                // Guardar username no localstorage
                localStorage.setItem(USERNAME_KEY, username);
                renderGameUI(username);
            } else {
                // Mostrar erro se o user nao puser nome nenhum
                usernameInput.placeholder = "DESIGNATION REQUIRED";
            }
        });
    }

    function renderGameUI(username) {
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

            <p class="mt-5">© 1997 VOLTECH SYSTEMS</p>
        </div>
        `;
        
        // Isto vai dar clear do user para debug
        // TIRAR DEPOIS
        document.getElementById('dev-clear-user').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Dev Menu: Clearing stored user data.");
            localStorage.removeItem(USERNAME_KEY);
            location.reload();
        });
        // A partir daqui, é fazer a game loop aqui
    }

    function init() {
        // Vai buscar o username do localStorage
        const savedUsername = localStorage.getItem(USERNAME_KEY);

        if (savedUsername) {
            // Se existe, baza
            console.log(`Found saved user: ${savedUsername}`);
            renderGameUI(savedUsername);
        } else {
            // Se nao, start screen
            console.log("No saved user found. Showing start screen.");
            renderStartScreen();
        }
    }

    // Inicia
    init();
})