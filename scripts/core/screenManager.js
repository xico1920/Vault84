// Manager de screens para nao ficar código esparguete

export class ScreenManager {
    constructor(rootElement, audioManager) {
        this.root = rootElement;
        this.audio = audioManager;
        this.screens = {};
        this.currentScreen = null;
    }

    registerScreen(name, screen) {
        this.screens[name] = screen;
    }

    async navigateTo(screenName, ...args) {
        // Exit current screen
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();
        }
        
        // Get new screen
        const screen = this.screens[screenName];
        if (!screen) {
            console.error(`Screen ${screenName} not found!`);
            return;
        }
        
        // Clear the root element
        this.root.innerHTML = '';
        
        // Set as current screen
        this.currentScreen = screen;
        
        // Render new screen
        await screen.render(...args);
    }
}