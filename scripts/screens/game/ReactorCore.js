export function createReactorCoreScreen() {
    return {
        async render() {
            return `
                <div class="reactor-core-container grid grid-cols-12 gap-4">
                <!-- Conteúdo por cima -->
                    <div class="reactor-content col-span-12 md:col-span-12">
                        <h1>REACTOR CORE</h1>
                        <p>The reactor is still not in use.</p>
                    </div>
                <!-- Vídeo de fundo -->
                    <video autoplay loop muted>
                        <source src="./assets/Animation/reactor.webm" type="video/webm">

                    </video>
                </div>
            `;
        }
    };
}