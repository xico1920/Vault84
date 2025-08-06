// Manager de screens para não ficar código esparguete
// Já estavamos a dar manage tipo de 5 screens diferentes num só "game.js"
// No ínicio, parece um bicho de sete cabeças, mas realmente, fica muito mais fácil de usar

export class ScreenManager {
    // Construtor da classe
    // Definimos as propriedades iniciais do manager
    constructor(rootElement, audioManager) {
        this.root = rootElement;          // Elemento raiz do DOM onde as telas serão renderizadas
        this.audio = audioManager;        // Manager de áudio para controlar sons entre telas
        this.screens = {};                // Objeto para armazenar as telas registradas
        this.currentScreen = null;        // Tela atualmente ativa
    }

    // Método para registrar um novo screen
    // Permite adicionar screens ao manager
    registerScreen(name, screen) {
        this.screens[name] = screen;  // Armazena o screen no objeto usando o nome como 'key'
    }

    // Método para navegar entre telas
    // Main brain desta cena toda
    async navigateTo(screenName, ...args) {
        // Verifica se há um screen atual e se, o mesmo, tem um método de saída (onExit)
        // Isto é importante para clean-up antes de trocar de screen
        // Não queremos que isto seja um memory-hog
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();  // Executa a limpeza do screen atual
        }
        
        // Obtém o screen pedido no registro
        const screen = this.screens[screenName];
        
        // Verificação básica
        if (!screen) {
            console.error(`Screen ${screenName} not found!`); 
            return; 
        }
        
        // Prepara o terreno para o novo screen
        this.root.innerHTML = '';
        
        // Atualiza o screen atual para o screen novo
        this.currentScreen = screen;
        
        // Renderiza o screen, passando quaisquer argumentos necessários
        // O render pode ser "async", por isso o await importa
        // Tive de descobrir isto da maneira dificil
        await screen.render(...args);
        
        // Após renderizar, verifica se o screen tem um hook "onRendered"
        // Isto é útil para configurações que dependem do DOM já estar carregado
        if (this.currentScreen.onRendered) {
            await this.currentScreen.onRendered(...args);
        }
    }
}