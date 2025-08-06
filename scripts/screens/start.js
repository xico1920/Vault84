export function createStartScreen(manager) {
    return {
        async render(username) {
            manager.root.innerHTML = `
                <div class="piece output items-center justify-center">
                    <img class="w-md" src="../../assets/img/vault84.png"></img>
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