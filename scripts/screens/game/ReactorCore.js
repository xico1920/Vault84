export function createReactorCoreScreen() {
    return {
        async render() {
            return `
                <div class="reactor-core-container grid grid-cols-12 gap-4">
                    
                    <!-- Conteúdo -->
                    <div class="reactor-content col-span-12 md:col-span-12">
                        <h1>REACTOR CORE</h1>
                        <p>The reactor is still not in use.</p>
                    </div>

                    <!-- Vídeo ocupa 12 colunas -->
                    <div class="col-span-4">
                        <video autoplay loop muted class="w-full">
                            <source src="./assets/Animation/reactor1.webm" type="video/webm">
                        </video>
                    </div>

                </div>
            `;
        }
    };
}
