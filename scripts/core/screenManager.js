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
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();
        }
        
        const screen = this.screens[screenName];
        if (!screen) {
            console.error(`Screen ${screenName} not found!`);
            return;
        }
        
        this.root.innerHTML = '';
        this.currentScreen = screen;
        await screen.render(...args);
        
        // Call onRendered hook if it exists
        if (this.currentScreen.onRendered) {
            await this.currentScreen.onRendered(...args);
        }
    }

}