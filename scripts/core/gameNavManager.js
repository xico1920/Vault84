import { SE } from './SoundEngine.js';

export class GameNavManager {
    constructor(contentContainer, screens, initialScreen = 'status') {
        this.contentContainer = contentContainer;
        this.screens = screens;
        this.currentScreen = null;
        this.navigateTo(initialScreen);
    }

    async navigateTo(screenName, ...args) {
        window._minigameActive = false;
        if (this.currentScreen && this.currentScreen.onExit) {
            await this.currentScreen.onExit();
        }

        const screen = this.screens[screenName];
        if (!screen) { console.error(`Game screen ${screenName} not found!`); return; }

        // "Computer thinking" sound on every nav change
        SE.navTransition();

        // Brief flash-clear with a small delay so the sound plays first
        this.contentContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#3d9970;font-size:0.85rem;letter-spacing:3px;opacity:0.6;">LOADING...</div>';

        await new Promise(r => setTimeout(r, 120));

        const content = await screen.render(...args);
        this.contentContainer.innerHTML = content;
        this.currentScreen = screen;

        document.querySelectorAll('.nav-list a').forEach(link => {
            link.classList.toggle('active', link.dataset.screen === screenName);
        });

        if (this.currentScreen.onRendered) {
            await this.currentScreen.onRendered(...args);
        }

        // Wire all buttons in the new screen for click sounds
        this.contentContainer.querySelectorAll('button, .btn').forEach((el, i) => {
            el.addEventListener('click', () => SE.click(i % 4), { once: false });
        });
    }
}
