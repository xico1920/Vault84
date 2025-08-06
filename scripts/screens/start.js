export function createStartScreen(manager) {
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output items-center justify-center">
                    <h1>VAULT 84</h1>
                    <a id="start_game" href="#">[ START ]</a>
                    <p class="mt-5">© 1977 VOLTECH SYSTEMS</p>
                </div>
            `;
            
            document.getElementById('start_game').addEventListener('click', (e) => {
                e.preventDefault();
                manager.navigateTo('boot', username);
            });
        }
    };
}