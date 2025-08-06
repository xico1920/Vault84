// Isto é basicamente a mesma coisa que o "screenManager.js"
// Mas, em vez de mudar o screen inteiro, muda apenas as coisas necessárias dentro do jogo em si

export class GameNavManager {
    // Construtor que inicializa o manager de navegação do jogo
    constructor(contentContainer, screens, initialScreen = 'status') {
        this.contentContainer = contentContainer;  // Container onde o conteúdo das telas será renderizado
        this.screens = screens;                   // Objeto que armazena todas os screens disponíveis
        this.currentScreen = null;                // Screen atual 
        this.navigateTo(initialScreen);           // Tela inicial por defeito
    }

    // Método principal para navegar entre as telas do jogo
    async navigateTo(screenName, ...args) {
        // Verifica se há um screen atual e se, o mesmo, tem um método de saída (onExit)
        // Isto é importante para clean-up antes de trocar de screen
        // Não queremos que isto seja um memory-hog
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();  // Executa a limpeza da tela atual
        }
        
        // Obtém o screen pedido no registro
        const screen = this.screens[screenName];
        
        // Verificação básica
        if (!screen) {
            console.error(`Game screen ${screenName} not found!`);
            return;
        }
        
        // Prepara o terreno para o novo screen
        this.contentContainer.innerHTML = '';
        
        // Renderiza o screen, passando quaisquer argumentos necessários
        // O render pode ser "async", por isso o await importa
        // Tive de descobrir isto da maneira dificil
        const content = await screen.render(...args);
        
        // Insere o conteúdo no container
        this.contentContainer.innerHTML = content;
        
        // Atualiza o screen atual para o screen novo
        this.currentScreen = screen;
        
        // Atualiza o estado ativo na barra de navegação
        // Percorre todos os links e adiciona/remove a classe 'active'
        document.querySelectorAll('.nav-list a').forEach(link => {
            // Adiciona 'active' apenas no link correspondente ao screen atual
            link.classList.toggle('active', link.dataset.screen === screenName);
        });
        
        // Se a tela tiver um método "onRendered", executa após a renderização
        if (this.currentScreen.onRendered) {
            await this.currentScreen.onRendered(...args);
        }
    }
}