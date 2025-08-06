export class GameNavManager {
    constructor(contentContainer, screens, initialScreen = 'status') {
        this.contentContainer = contentContainer;
        this.screens = screens;
        this.currentScreen = null;
        this.navigateTo(initialScreen);
    }

    async navigateTo(screenName, ...args) {
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();
        }
        
        const screen = this.screens[screenName];
        if (!screen) {
            console.error(`Game screen ${screenName} not found!`);
            return;
        }
        
        this.contentContainer.innerHTML = '';
        this.currentScreen = screen;
        await screen.render(...args);
    }
}